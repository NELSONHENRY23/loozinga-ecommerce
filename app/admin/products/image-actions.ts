'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/app/db';
import { productImages } from '@/app/db/schema';
import { cloudinary } from '@/utils/cloudinary';

const imageSchema = z.object({
  position: z.number().int().min(0).max(4),
  secureUrl: z.url(),
  publicId: z.string().min(1),
});

const saveImagesSchema = z.object({
  productId: z.uuid(),
  images: z.array(imageSchema).min(1).max(5),
}).superRefine((data, ctx) => {
  const positions = data.images.map((image) => image.position);

  if(new Set(positions).size !== positions.length){
    ctx.addIssue({
      code: 'custom',
      path: ['images'],
      message: 'Image positions must be unique.',
    })
  }
})

const deleteImageSchema = z.object({
  productId: z.string().uuid(),
  position: z.number().int().min(0).max(4),
});

// Get existing image else Update or Create the Image
export async function saveProductImages(
  input: z.infer<typeof saveImagesSchema>,
) {
  // Validate data first
  const parsed = saveImagesSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        'Invalid image data.',
    };
  }

  const { productId, images } = parsed.data;

  const positions = images.map((image) => image.position);

  const existingImages = await db.select({publicId: productImages.publicId,})
  .from(productImages)
  .where(
    and(
      eq(
        productImages.productId,
        productId,
      ),
      inArray(
        productImages.position,
        positions,
      )
    )
  );

  const imageRows = images.map((image) => ({
    productId,
    secureUrl: image.secureUrl,
    publicId: image.publicId,
    position: image.position,
  }))

  try {
    await db.transaction(async (tx) => {
      /* Remove only image positions that are being replaced. */
      await tx.delete(productImages)
               .where(
                and(
                  eq(productImages.productId, productId),
                  inArray(productImages.position, positions)
                )
               )

      /* Insert new images */
      await tx.insert(productImages).values(imageRows);
    });

    const newPublicIds = new Set(images.map((image) => image.publicId,));
    const oldPublicIds = existingImages.map((image) => image.publicId,)
    .filter((publicId,): publicId is string => Boolean(publicId,) && !newPublicIds.has(publicId!));

    const cleanupResults = await Promise.allSettled(oldPublicIds.map((publicId) => cloudinary.uploader.destroy(publicId, {invalidate: true,})));

    cleanupResults.forEach((result) => {
      if(result.status === 'rejected'){
        console.error('Cloudinary cleanup failed: ', result.reason,)
      }
    })

    revalidatePath(
      `/admin/products/${productId}/images`,
    );

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Images saved successfully.',
    };
  } catch (error) {
    console.error('Save Product Images error:', error);

    return {
      success: false,
      message: 'Failed to save product images.',
    };
  }
}

// Delete Image 
export async function deleteProductImage(
  input: z.infer<typeof deleteImageSchema>,
) {
  const parsed = deleteImageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ??
        'Invalid image data.',
    };
  }

  const { productId, position } = parsed.data;

  try {
    // Find cloudinary public Id before deleteing the row.
    const exisiting = await db.select({
      id: productImages.id,
      publicId: productImages.publicId,
    }).from(productImages).where(
      and(
        eq(
          productImages.productId,
          productId,
        ),
        eq(
        productImages.position,
        position,
      )
    )
    ).limit(1);

    const image = exisiting[0];
    if(!image){
      return{
        success: false,
        message: 'Image was not found.'
      }
    }

    // Remove database reference first
    await db
      .delete(productImages)
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.position, position),
        ),
      );

      if(image.publicId){
        try{
          await cloudinary.uploader.destroy(image.publicId, {invalidate: true,})
        }catch (error){
          // Database deletion succeeded, so don't restore a stale row. Log Cloudinary cleanup failure.
          console.error('Cloudinary image cleaup failed:', error)
        }
      }

    revalidatePath(
      `/admin/products/${productId}/images`,
    );

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Image deleted successfully.',
    };
  } catch (error) {
    console.error('Delete Product Image error:', error);

    return {
      success: false,
      message: 'Failed to delete image.',
    };
  }
}