'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/app/db';
import {
  products,
  productVariants,
  productVariantSizes,
  productImages,
  orderItems,
} from '@/app/db/schema';

import { requireAdmin } from '@/utils/superbase/require-admin';

const variantSchema = z.object({
  productId: z.uuid(),
  color: z.string().trim().min(1).max(100),
});

const updateVariantSchema = variantSchema.extend({
  variantId: z.uuid(),
});

const deleteVariantSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
});

const variantSizesSchema = z.object({
  variantId: z.uuid(),
  productId: z.uuid(),
  sizes: z.array(z.string().trim().min(1).max(50)).max(30),
});

export async function addProductVariant(input: z.infer<typeof variantSchema>) {
  await requireAdmin();

  const parsed = variantSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid product or color.',
    };
  }

  const { productId, color } = parsed.data;

  try {
    // Verify the product exists.
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return {
        success: false,
        message: 'Product not found.',
      };
    }

    // Prevent Red and red being added separately.
    const [existing] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, productId),
          sql`lower(${productVariants.color}) = lower(${color})`,
        ),
      )
      .limit(1);

    if (existing) {
      return {
        success: false,
        message: 'This color already exists.',
      };
    }

    await db.insert(productVariants).values({
      productId,
      color,
    });

    revalidatePath(`/admin/products/${productId}/variants`);

    return {
      success: true,
      message: 'Color added successfully.',
    };
  } catch (error) {
    console.error('Add product variant error:', error);

    return {
      success: false,
      message: 'Failed to add color.',
    };
  }
}

export async function updateProductVariant(
  input: z.infer<typeof updateVariantSchema>,
) {
  await requireAdmin();

  const parsed = updateVariantSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid product, variant or color.',
    };
  }

  const { productId, variantId, color } = parsed.data;

  try {
    const [variant] = await db
      .select({
        id: productVariants.id,
        color: productVariants.color,
      })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId),
        ),
      )
      .limit(1);

    if (!variant) {
      return {
        success: false,
        message: 'Color variant not found for this product.',
      };
    }

    const [duplicate] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, productId),
          sql`lower(${productVariants.color}) = lower(${color})`,
        ),
      )
      .limit(1);

    if (duplicate && duplicate.id !== variantId) {
      return {
        success: false,
        message: 'Another variant already uses this color.',
      };
    }

    await db
      .update(productVariants)
      .set({ color })
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId),
        ),
      );

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath(`/admin/products`);
    revalidatePath(`/products/${productId}`);
    revalidatePath('/shop');

    return {
      success: true,
      message: 'Color updated successfully.',
    };
  } catch (error) {
    console.error('Update product variant error:', error);

    return {
      success: false,
      message: 'Failed to update color. Please try again.',
    };
  }
}

export async function deleteProductVariant(
  input: z.infer<typeof deleteVariantSchema>,
) {
  await requireAdmin();

  const parsed = deleteVariantSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid product or variant.',
    };
  }

  const { productId, variantId } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      // Serialize variant changes for this product.
      const lockedProduct = await tx.execute(sql`
        SELECT id
        FROM products
        WHERE id = ${productId}
        FOR UPDATE
      `);

      if (lockedProduct.length === 0) {
        return {
          success: false,
          message: 'Product not found.',
        };
      }

      const [variant] = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(
          and(
            eq(productVariants.id, variantId),
            eq(productVariants.productId, productId),
          ),
        )
        .limit(1);

      if (!variant) {
        return {
          success: false,
          message: 'Variant not found for this product.',
        };
      }

      // Preserve at least one purchasable variant.
      const variants = await tx
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      if (variants.length <= 1) {
        return {
          success: false,
          message: 'A product must have at least one color variant.',
        };
      }

      // Protect historical order references.
      const [existingOrder] = await tx
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.variantId, variantId))
        .limit(1);

      if (existingOrder) {
        return {
          success: false,
          message: 'This variant has been ordered and cannot be deleted.',
        };
      }

      // Prevent images from becoming detached.
      const [existingImage] = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.variantId, variantId))
        .limit(1);

      if (existingImage) {
        return {
          success: false,
          message:
            'Remove the image associated with this color before deleting it.',
        };
      }

      await tx
        .delete(productVariants)
        .where(
          and(
            eq(productVariants.id, variantId),
            eq(productVariants.productId, productId),
          ),
        );

      return {
        success: true,
        message: 'Color variant deleted successfully.',
      };
    });

    if(result.success){
      revalidatePath(`/admin/products/${productId}/variants`);
      revalidatePath('/admin/products');
      revalidatePath(`/products/${productId}`);
      revalidatePath('/shop');
    }

    return result;
  } catch (error) {
    console.error('Delete product variant error:', error);

    return {
      success: false,
      message: 'Failed to delete variant. Please try again.',
    };
  }
}

export async function saveProductVariantSizes(
  input: z.infer<typeof variantSizesSchema>,
) {
  await requireAdmin();

  const parsed = variantSizesSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Enter valid sizes (up to 30 per color).',
    };
  }

  const { productId, variantId, sizes } = parsed.data;

  // Prevent duplicate sizes such as "M" and "m".
  const normalizedSizes = sizes.map((size) => size.trim());

  const uniqueSizes = new Set(
    normalizedSizes.map((size) => size.toLowerCase()),
  );

  if (uniqueSizes.size !== normalizedSizes.length) {
    return {
      success: false,
      message: 'Remove duplicate sizes before saving.',
    };
  }

  try {
    const [variant] = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.id, variantId),
          eq(productVariants.productId, productId),
        ),
      )
      .limit(1);

    if (!variant) {
      return {
        success: false,
        message: 'Color variant not found for this product.',
      };
    }

    await db.transaction(async (tx) => {
      // deletion and insertion atomically
      await tx
        .delete(productVariantSizes)
        .where(eq(productVariantSizes.variantId, variantId));

      if (normalizedSizes.length > 0) {
        await tx.insert(productVariantSizes).values(
          normalizedSizes.map((size) => ({
            variantId,
            size,
          })),
        );
      }
    });

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Sizes saved successfully.',
    };
  } catch (error) {
    console.error('Save product variant sizes error.', error);

    return {
      success: false,
      message: 'Failed to save sizes. Please try again.',
    };
  }
}
