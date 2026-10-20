
'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/app/db';
import {
  products,
  productVariants,
  productVariantSizes,
} from '@/app/db/schema';

import { requireAdmin } from '@/utils/superbase/require-admin';

const variantSchema = z.object({
  productId: z.uuid(),
  color: z.string().trim().min(1).max(100),
});

const variantSizesSchema = z.object({
  variantId: z.uuid(),
  productId: z.uuid(),
  sizes: z.array(
    z.string().trim().min(1).max(50),
  ).max(30),
})

export async function addProductVariant(
  input: z.infer<typeof variantSchema>,
) {
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

export async function saveProductVariantSizes(
  input: z.infer<typeof variantSizesSchema>,
) {
  await requireAdmin();

  const parsed = variantSizesSchema.safeParse(input);

  if(!parsed.success){
    return {
      success: false,
      message: 'Enter valid sizes (up to 30 per color).',
    }
  }

  const { productId,variantId, sizes } = parsed.data;

  // Prevent duplicate sizes such as "M" and "m".
  const normalizedSizes = sizes.map((size) => size.trim());

  const uniqueSizes = new Set(
    normalizedSizes.map((size) => size.toLowerCase()),
  );

  if(uniqueSizes.size !== normalizedSizes.length){
    return{
      success: false,
      message: 'Remove duplicate sizes before saving.'
    }
  } 

  try {
    const [variant] = await db.select({id: productVariants.id})
                            .from(productVariants)
                            .where(
                              and(
                                eq(productVariants.id, variantId),
                                eq(productVariants.productId, productId),
                              )
                            )
                            .limit(1);

    if(!variant){
      return{
      success: false,
      message: 'Color variant not found for this product.',
      }
    }

    await db.transaction(async (tx) => {
      // deletion and insertion atomically
      await tx.delete(productVariantSizes)
              .where(
                eq(productVariantSizes.variantId, variantId),
              );

      if (normalizedSizes.length > 0){
        await tx.insert(productVariantSizes).values(
          normalizedSizes.map((size) => ({
            variantId,
            size,
          }))
        )
      }
    });

    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath('/admin/products');

    return{
      success: true,
      message: 'Sizes saved successfully.'
    }
  } catch (error) {
    console.error('Save product variant sizes error.', error);

    return{
      success: false,
      message: 'Failed to save sizes. Please try again.'
    }
  }
}