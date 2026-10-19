'use server'

import { inArray, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { db } from '@/app/db';
import { orders, orderItems, products, profiles, productVariants } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

const checkoutSchema = z.object({
    customerName: z.string().trim().min(2).max(150),
    phone: z.string().trim().min(5).max(50),
    street: z.string().trim().min(5).max(250),
    city: z.string().trim().min(2).max(100),
    country: z.string().trim().min(2).max(100),

    items: z.array(
        z.object({
            id: z.uuid(),
            variantId: z.uuid().nullable(),
            quantity: z.number().int().min(1).max(99),
        }),

    ).min(1).max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function placeOrder(input: CheckoutInput) {
    // Validate incoming form data
    const parsed = checkoutSchema.safeParse(input);
    
    if(!parsed.success){
        return{
            success: false,
            message: 'Please check your checkout information.',
        }
    }

    // Verify the signed-in user
    const supabase = await createClient();

    const {data: {user}, error } = await supabase.auth.getUser();

    if(error || !user || !user.email){
        return{
             success: false,
            message: 'Please sign in before placing an order.',
        }
    }

    // verify customer role.
    const [profile] = await db.select({role: profiles.role})
                        .from(profiles)
                        .where(eq(profiles.id, user.id))
                        .limit(1);

    if(profile?.role !== 'Customer'){
        return{
             success: false,
            message: 'Only customer accounts can place orders.',
        }
    }

    const data = parsed.data;

    // Prevent duplcate lines for the same product and variant
    const ItemKeys = data.items.map((item) => `${item.id}:${item.variantId ?? 'no-variant'}`);

    // Reject duplicate product IDs
    if(new Set(ItemKeys).size !== ItemKeys.length){
        return{
            success: false,
            message: 'Duplicate cart items detected.'
        }
    }
    

    try {

    const productIds = [
        ...new Set(data.items.map((item) => item.id)),
    ];

   
        // Fetch current product prices from database
        const availableProducts = await db.select({
            id: products.id,
            name: products.name,
            price: products.price,
            offer: products.offer,
            color: products.color,
        })
        .from(products)
        .where(inArray(products.id, productIds));

        if(availableProducts.length !== productIds.length){
            return{
                success: false,
                message: 'Some products are no longer available.',
            }
        }

        const productMap = new Map(
            availableProducts.map((product) => [product.id, product])
        );

        // Load the variants for these products from the database
        const availableVariants = await db.select({
            id: productVariants.id,
            productId: productVariants.productId,
            color: productVariants.color,
        })
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds));

        const variantMap = new Map(availableVariants.map((variant) => [
            variant.id, variant
        ]))

        const variantByProduct = new Set(availableVariants.map((variant) => variant.productId));


        // Calculate prices using server-side data
        const calculatedItems = data.items.map((item) => {
            const product = productMap.get(item.id)!;

            if(!product){
                throw new Error('Product not found.');
            }

            let variantId: string | null = null;
            let color = product.color;

            if(item.variantId){
                const variant = variantMap.get(item.variantId);

                // A variant must exisit and belong to this product
                if(!variant || variant.productId !== product.id){
                    throw new Error('Invalid product variant.')
                }

                variantId = variant.id;
                color = variant.color;
            }else if (variantByProduct.has(product.id)){
                // A product with selectable variants must 
                // have a selected variant at checkout.
                throw new Error('Please select a product color.')
            }

            const price = Number(product.price);
            const offer = Number(product.offer);

            if(
                !Number.isFinite(product.price)||
                price < 0 ||
                !Number.isInteger(offer) ||
                offer < 0 ||
                offer > 100 
            ){
                throw new Error('Invalid product pricing');
            }

            // work in cents to avoid floating-point inaccuracies during total calculations
            const unitPriceCents = Math.round(price * (1 - offer / 100) * 100 );

            return {
                productId: product.id,
                productName: product.name,
                variantId,
                color,
                quantity: item.quantity,

                // database stores dollars, not cents
                price: (unitPriceCents / 100).toFixed(2),

                // Used only for calculating the total.
                unitPriceCents,
            };
        });

        // Calculate the complete order in cents.
        const totalCents = calculatedItems.reduce(
            (sum, item) => 
                sum + item.unitPriceCents * item.quantity,
            0,
        );

        
        if(totalCents <= 0){
            return{
                success: false,
                message:'Order total must be greater than zero.'
            }
        }

        // Convert cents back to dollars before saving
        const orderTotal = (totalCents / 100).toFixed(2);

        // Save order and its items atomically
        const orderId = randomUUID();
        const orderNumber = `LZ-${randomUUID().slice(0,12).toUpperCase()}`;

        await db.transaction(async (tx) => {
            await tx.insert(orders).values({
                id: orderId,
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

            });

            await tx.insert(orderItems).values(
                calculatedItems.map((item) => ({
                    orderId,
                    productId: item.productId,
                    productName: item.productName,
                    variantId: item.variantId,
                    color: item.color,
                    quantity: item.quantity,
                    price: item.price,
                })),
            );
        });

        return {
            success: true,
            message: 'Order placed successfully',
            orderId,
            orderNumber,
        }

    } catch (error) {
        console.log('CHECKOUT ERROR:', error);

        return{
            success: false,
            message: 'Could not placed order. Please try again.',
        }
    }
}