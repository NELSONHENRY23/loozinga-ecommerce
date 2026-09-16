'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/app/db';
import { products, productImages } from '@/app/db/schema';
import { cloudinary } from '@/utils/cloudinary';

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(255),

  description: z
    .string()
    .trim()
    .min(1, 'Description is required'),

  price: z
    .number()
    .positive('Price must be greater than 0'),

  offer: z
    .number()
    .int()
    .min(0)
    .max(100),

  color: z
    .string()
    .trim()
    .min(1, 'Color is required'),

  categoryId: z
    .number()
    .int()
    .positive(),
});

export type ProductInput = z.infer<typeof productSchema>;

type CreateProductResult =
  | {
      success: true;
      message: string;
      productId: string;
    }
  | {
      success: false;
      message: string;
    };

type UpdateProductResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

/* CREATE PRODUCT */

export async function createProduct(
  input: ProductInput,
): Promise<CreateProductResult> {
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        'Invalid product data',
    };
  }

  try {
    const [newProduct] = await db
      .insert(products)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        offer: parsed.data.offer,
        color: parsed.data.color,
        categoryId: parsed.data.categoryId,
      })
      .returning({
        id: products.id,
      });

    if (!newProduct) {
      return {
        success: false,
        message: 'Could not create product.',
      };
    }

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully.',
      productId: newProduct.id,
    };
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error);

    return {
      success: false,
      message: 'Could not create product.',
    };
  }
}

/* 
   UPDATE PRODUCT
 */

export async function updateProduct(
  productId: string,
  input: ProductInput,
): Promise<UpdateProductResult> {
  const productIdSchema = z.string().uuid();

  const parsedId = productIdSchema.safeParse(productId);

  if (!parsedId.success) {
    return {
      success: false,
      message: 'Invalid product ID.',
    };
  }

  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        'Invalid product data',
    };
  }

  try {
    const [updatedProduct] = await db
      .update(products)
      .set({
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        offer: parsed.data.offer,
        color: parsed.data.color,
        categoryId: parsed.data.categoryId,
      })
      .where(eq(products.id, parsedId.data))
      .returning({
        id: products.id,
      });

    if (!updatedProduct) {
      return {
        success: false,
        message: 'Product could not be found.',
      };
    }

    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath(`/admin/products/${productId}/images`);

    return {
      success: true,
      message: 'Product updated successfully.',
    };
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error);

    return {
      success: false,
      message: 'Could not update product.',
    };
  }
}

/* DELETE PRODUCT */

export async function deleteProduct(productId: string) {
  const parsed = z.uuid().safeParse(productId);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid product ID.',
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Get Cloudinary IDs before deleting the product.
      const images = await tx
        .select({
          publicId: productImages.publicId,
        })
        .from(productImages)
        .where(eq(productImages.productId, parsed.data));

      // Delete the product.
      const [deletedProduct] = await tx
        .delete(products)
        .where(eq(products.id, parsed.data))
        .returning({
          id: products.id,
        });

      return {
        deleted: Boolean(deletedProduct),
        publicIds: images
          .map((image) => image.publicId)
          .filter((id): id is string => id !== null),
        missingIds: images.filter(
          (image) => image.publicId === null,
        ).length,
      };
    });

    if (!result.deleted) {
      return {
        success: false,
        message: 'Product not found.',
      };
    }

    // Delete associated Cloudinary assets after DB succeeds.
    const cleanup = await Promise.allSettled(
      result.publicIds.map(async (publicId) => {
        const response = await cloudinary.uploader.destroy(
          publicId,
          {
            invalidate: true,
          },
        );

        if (
          response.result !== 'ok' &&
          response.result !== 'not found'
        ) {
          throw new Error(
            `Could not delete Cloudinary asset: ${publicId}`,
          );
        }
      }),
    );

    const failed = cleanup.filter((item) => {
      if (item.status === 'rejected') {
        console.error('Cloudinary cleanup failed:', item.reason);
        return true;
      }

      return false;
    }).length;

    revalidatePath('/admin/products');

    if (failed > 0 || result.missingIds > 0) {
      return {
        success: true,
        message:
          'Product deleted, but some Cloudinary images may require manual cleanup.',
      };
    }

    return {
      success: true,
      message: 'Product deleted successfully.',
    };
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error);

    return {
      success: false,
      message: 'Could not delete product.',
    };
  }
}