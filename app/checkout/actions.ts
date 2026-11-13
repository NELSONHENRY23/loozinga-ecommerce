'use server';

import { and, inArray, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import {  z } from 'zod';

import { db } from '@/app/db';
import {
  orders,
  orderItems,
  products,
  profiles,
  productVariants,
  productVariantSizes,
} from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';
import { createAdminClient } from '@/utils/superbase/admin';

const checkoutSchema = z.object({
  checkoutRequestId: z.uuid(),
  customerName: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(5).max(50),
  street: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),

  items: z
    .array(
      z.object({
        id: z.uuid(),
        variantId: z.uuid().nullable(),
        size: z.string().trim().min(1).max(50).nullable(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

class CheckoutValidationError extends Error{
  constructor(message: string){
    super(message);
    this.name = "CheckoutValidationError";
  }
}

export async function placeOrder(input: CheckoutInput) {
  // Validate incoming form data
  const parsed = checkoutSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please check your checkout information.',
    };
  }

  // Verify the signed-in user
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    // A blocked account may fail normal authentication first.
    // Check the existing server-side session to identify the account.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
      const supabaseAdmin = createAdminClient();

      const {
        data: { user: currentAuthUser },
        error: accountStatusError,
      } = await supabaseAdmin.auth.admin.getUserById(session.user.id);

      if (!accountStatusError && currentAuthUser) {
        const bannedUntil = currentAuthUser.banned_until
          ? new Date(currentAuthUser.banned_until).getTime()
          : 0;

        if (bannedUntil > new Date().getTime()) {
          return {
            success: false,
            message:
              'Your account is blocked. Please contact support for assistance.',
          };
        }
      }
    }

    return {
      success: false,
      message: 'Please sign in before placing an order.',
    };
  }

  // verify the account's current status using supabase Admin
  const supabaseAdmin = createAdminClient();

  const {
    data: { user: currentAuthUser },
    error: accountStatusError,
  } = await supabaseAdmin.auth.admin.getUserById(user.id);

  // Fail closed if we cannot verify the account
  if (accountStatusError || !currentAuthUser) {
    return {
      success: false,
      message: 'Could not verify your account status. Please try again.',
    };
  }

  const bannedUntil = currentAuthUser.banned_until
    ? new Date(currentAuthUser.banned_until).getTime()
    : 0;

  if (bannedUntil > new Date().getTime()) {
    return {
      success: false,
      message:
        'Your account is blocked. Please contact support for assistance.',
    };
  }

  // verify customer role.
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (profile?.role !== 'Customer') {
    return {
      success: false,
      message: 'Only customer accounts can place orders.',
    };
  }

  const data = parsed.data;

  const [existingOrder] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
      })
      .from(orders)
      .where(
        and(
          eq(orders.checkoutRequestId, data.checkoutRequestId),
          eq(orders.userId, user.id),
        )
      )
      .limit(1);

      if(existingOrder){
        return{
          success: true,
          message: 'Order already placed successfully.',
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
        }
      }

  // Prevent duplcate lines for the same product and variant
  const ItemKeys = data.items.map(
    (item) =>
      `${item.id}:${item.variantId ?? 'no-variant'}:${item.size ?? 'no-size'}`,
  );

  // Reject duplicate product IDs
  if (new Set(ItemKeys).size !== ItemKeys.length) {
    return {
      success: false,
      message: 'Duplicate cart items detected.',
    };
  }

  try {
    const productIds = [...new Set(data.items.map((item) => item.id))];

    // Fetch current product prices from database
    const availableProducts = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        offer: products.offer,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    if (availableProducts.length !== productIds.length) {
      return {
        success: false,
        message: 'Some products are no longer available.',
      };
    }

    const productMap = new Map(
      availableProducts.map((product) => [product.id, product]),
    );

    // Load the variants for these products from the database
    const availableVariants = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        color: productVariants.color,
      })
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));

    const variantMap = new Map(
      availableVariants.map((variant) => [variant.id, variant]),
    );

    // Fetch available sizes from the database.
    const availableSizes =
      availableVariants.length > 0
        ? await db
            .select({
              variantId: productVariantSizes.variantId,
              size: productVariantSizes.size,
            })
            .from(productVariantSizes)
            .where(
              inArray(
                productVariantSizes.variantId,
                availableVariants.map((variant) => variant.id),
              ),
            )
        : [];

    const sizeKeys = new Set(
      availableSizes.map((item) => `${item.variantId}:${item.size}`),
    );

    // Calculate prices using server-side data
    const calculatedItems = data.items.map((item) => {
      const product = productMap.get(item.id)!;

      if (!product) {
        throw new CheckoutValidationError('This product is no longer available.');
      }

      let variantId: string | null = null;
      let color: string | null = null;

      if (!item.variantId) {
        throw new CheckoutValidationError('Please select a product color.');
      }

      const variant = variantMap.get(item.variantId);

      // Ensure the variant exists and belongs to this product.
      if (!variant || variant.productId !== product.id) {
        throw new CheckoutValidationError('The selected product option is no longer available.');
      }

      // Every purchasable variant must have a color.
      if (!variant.color.trim()) {
        throw new CheckoutValidationError('The selected product color is unavailable.');
      }

      // Check whether the selected variant has sizes.
      const variantHasSizes = availableSizes.some(
        (entry) => entry.variantId === variant.id,
      );

      if (variantHasSizes) {
        // Size is mandatory when the variant has available sizes.
        if (!item.size || !sizeKeys.has(`${variant.id}:${item.size}`)) {
          throw new CheckoutValidationError('Please select a valid available size.');
        }
      } else if (item.size !== null) {
        // Products without sizes must not submit a size.
        throw new CheckoutValidationError('This product does not require a size.');
      }

      variantId = variant.id;
      color = variant.color;

      const price = Number(product.price);
      const offer = Number(product.offer);

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(offer) ||
        offer < 0 ||
        offer > 100
      ) {
        throw new Error('Invalid product pricing');
      }

      // work in cents to avoid floating-point inaccuracies during total calculations
      const unitPriceCents = Math.round(price * (1 - offer / 100) * 100);

      return {
        productId: product.id,
        productName: product.name,
        color,
        variantId,
        size: item.size,
        quantity: item.quantity,

        // database stores dollars, not cents
        price: (unitPriceCents / 100).toFixed(2),

        // Used only for calculating the total.
        unitPriceCents,
      };
    });

    // Calculate the complete order in cents.
    const totalCents = calculatedItems.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0,
    );

    if (totalCents <= 0) {
      return {
        success: false,
        message: 'Order total must be greater than zero.',
      };
    }

    // Convert cents back to dollars before saving
    const orderTotal = (totalCents / 100).toFixed(2);

    // Save order and its items atomically
    const orderId = randomUUID();
    const orderNumber = `LZ-${randomUUID().slice(0, 12).toUpperCase()}`;

    const created = await db.transaction(async (tx) => {
      const insertedOrders = await tx.insert(orders).values({
        id: orderId,
        checkoutRequestId: data.checkoutRequestId,
        orderNumber,
        userId: user.id,
        customerName: data.customerName,
        email: user.email!,
        phone: data.phone,
        street: data.street,
        city: data.city,
        country: data.country,
        total: orderTotal,
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
      })
      .onConflictDoNothing({
        target: orders.checkoutRequestId,
      })
      .returning({id: orders.id});

      if (insertedOrders.length === 0){
        return false;
      }

      await tx.insert(orderItems).values(
        calculatedItems.map((item) => ({
          orderId,
          productId: item.productId,
          productName: item.productName,
          color: item.color,
          variantId: item.variantId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
      );

    return true;
    });

    if(!created){
      const [saveOrder] = await db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        userId: orders.userId,
      })
      .from(orders)
      .where(eq(orders.checkoutRequestId, data.checkoutRequestId))
      .limit(1);

      if(!saveOrder || saveOrder.userId !== user.id){
        throw new Error('Checkout request conflict.');
      }

      return{
        success: true,
        message: 'Order already placed successfully.',
        orderId: saveOrder.id,
        orderNumber: saveOrder.orderNumber,
      }
    }

    return {
      success: true,
      message: 'Order placed successfully',
      orderId,
      orderNumber,
    };
  } catch (error) {
    console.error('CHECKOUT ERROR:', error);

    return {
      success: false,
      message:
        error instanceof CheckoutValidationError
        ? error.message
        : 'Could not placed order. Please try again.',
    };
  }
}
