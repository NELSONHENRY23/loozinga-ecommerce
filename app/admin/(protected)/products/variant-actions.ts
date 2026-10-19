
'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/app/db';
import {
  products,
  productVariants,
} from '@/app/db/schema';

import { requireAdmin } from '@/utils/superbase/require-admin';

const variantSchema = z.object({
  productId: z.uuid(),
  color: z.string().trim().min(1).max(100),
});

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
