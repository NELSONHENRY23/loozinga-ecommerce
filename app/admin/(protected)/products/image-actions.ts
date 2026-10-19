'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { uuid, z } from 'zod';

import { db } from '@/app/db';
import { productImages, productVariants } from '@/app/db/schema';
import { cloudinary } from '@/utils/cloudinary';

import { requireAdmin } from '@/utils/superbase/require-admin';

const imageSchema = z.object({
  position: z.number().int().min(0).max(4),
  secureUrl: z.url(),
  publicId: z.string().min(1),
});

const saveVariantImageSchema = z.object({
  productId: uuid(),
  variantId: z.uuid(),
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
  // verify administrator before performing any database work
      await requireAdmin();
  
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
      // Check existing images at the selected positions.
  const currentImages = await tx
  .select({
    variantId: productImages.variantId,
  })
  .from(productImages)
  .where(
    and(
      eq(productImages.productId, productId),
      inArray(productImages.position, positions),
    ),
  );

  // Prevent the old uploader from replacing variant images.
if (currentImages.some((image) => image.variantId !== null)) {
  throw new Error(
    'An image is already assigned to a color. Use variant image management.',
  );
}
      /* Remove only image positions that are being replaced. */
      await tx.delete(productImages)
               .where(
                and(
                  eq(productImages.productId, productId),
                  inArray(productImages.position, positions),
                  isNull(productImages.variantId),
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
  // verify administrator before performing any database work
      await requireAdmin();
  
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
      variantId: productImages.variantId,
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

    if (image.variantId !== null) {
      return {
        success: false,
        message: 'This image belongs to a color variant.',
      };
    }

    // Remove database reference first
    await db
      .delete(productImages)
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.position, position),
          isNull(productImages.variantId),
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

const assignImageSchema = z.object({
  productId: z.uuid(),
  imageId: z.uuid(),
  variantId: z.uuid(),
});

export async function assignImageToVariant(input: z.infer<typeof assignImageSchema>){
  await requireAdmin();

  const parsed = assignImageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid image or color.',
    };
  }

  const { productId, imageId, variantId } = parsed.data;

  try {
    // Check that this image belongs to the product
    const [image] = await db.select({id: productImages.id})
                    .from(productImages)
                    .where(
                      and(
                        eq(productImages.id, imageId),
                        eq(productImages.productId, productId)
                      )
                    )
                    .limit(1);

                    if (!image) {
                      return {
                        success: false,
                        message: 'Image not found for this product.',
                      };
                    }

                    // Check that the selected color belongs to the product
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
                        message: 'Color not found for this product.',
                      };
                    }

                    // Check if another image already belongs to this color.
                    const [existing] = await db
                      .select({ id: productImages.id })
                      .from(productImages)
                      .where(eq(productImages.variantId, variantId))
                      .limit(1);
                      if (existing && existing.id !== imageId) {
                        return {
                          success: false,
                          message: 'This color already has an image.',
                        };
                      }

                      // Assign the image to the selected color.
                      await db
                        .update(productImages)
                        .set({ variantId })
                        .where(
                          and(
                            eq(productImages.id, imageId),
                            eq(productImages.productId, productId),
                          ),
                        );

                        revalidatePath(`/admin/products/${productId}/images`);
                        revalidatePath(`/admin/products/${productId}/variants`);
                        revalidatePath(`/products/${productId}`);
                        revalidatePath('/admin/products');

                        return {
                          success: true,
                          message: 'Image assigned to color successfully.',
                        };
  } catch (error) {
    console.error('Assign image to variant error:', error);

    return {
      success: false,
      message: 'Failed to assign image to color.',
    };
  
  }
}

export async function saveVariantImage(input: unknown) {
  await requireAdmin();

  const parsed = saveVariantImageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid image or color.',
    };
  }

  const { productId, variantId, secureUrl, publicId } =
    parsed.data;

  let uploadedImageSaved = false;

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
        message: 'The selected color does not belong to this product.',
      };
    }

    const [existingImage] = await db
      .select({
        id: productImages.id,
        publicId: productImages.publicId,
      })
      .from(productImages)
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.variantId, variantId),
        ),
      )
      .limit(1);

    if (existingImage) {
      await db
        .update(productImages)
        .set({ secureUrl, publicId })
        .where(eq(productImages.id, existingImage.id));

      uploadedImageSaved = true;

      if (
        existingImage.publicId &&
        existingImage.publicId !== publicId
      ) {
        try {
          await cloudinary.uploader.destroy(
            existingImage.publicId,
            { invalidate: true },
          );
        } catch (error) {
          console.error(
            'Old Cloudinary image cleanup failed:',
            error,
          );
        }
      }
    } else {
      const usedPositions = await db
        .select({ position: productImages.position })
        .from(productImages)
        .where(eq(productImages.productId, productId));

      const used = new Set(
        usedPositions.map((image) => image.position),
      );
      
      let position = 0;
      while (used.has(position)) {
        position += 1;
      }

      if (position === undefined) {
        return {
          success: false,
          message:
            'No free image slot is available. Existing images were preserved.',
        };
      }

      await db.insert(productImages).values({
        productId,
        variantId,
        secureUrl,
        publicId,
        position,
      });

      uploadedImageSaved = true;
    }

    revalidatePath(`/admin/products/${productId}/images`);
    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath(`/product/${productId}`);
    revalidatePath(`/products/${productId}`);
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Color image saved successfully.',
    };
  } catch (error) {
    console.error('Save variant image error:', error);

    return {
      success: false,
      message: 'Could not save the color image.',
    };
  } finally {
    // If the database save did not complete, remove the
    // newly uploaded Cloudinary asset where possible.
    if (!uploadedImageSaved) {
      try {
        await cloudinary.uploader.destroy(publicId, {
          invalidate: true,
        });
      } catch (error) {
        console.error(
          'Unused Cloudinary upload cleanup failed:',
          error,
        );
      }
    }
  }
}

const deleteVariantImageSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
});

export async function deleteVariantImage(
  input: z.infer<typeof deleteVariantImageSchema>,
) {
  await requireAdmin();

  const parsed = deleteVariantImageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid product or color.',
    };
  }

  const { productId, variantId } = parsed.data;

  try {
    // Confirm that the color belongs to this product.
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
        message: 'Color not found for this product.',
      };
    }

    // Find the image assigned to this specific color.
    const [image] = await db
      .select({
        id: productImages.id,
        publicId: productImages.publicId,
      })
      .from(productImages)
      .where(
        and(
          eq(productImages.productId, productId),
          eq(productImages.variantId, variantId),
        ),
      )
      .limit(1);

    if (!image) {
      return {
        success: false,
        message: 'No image is assigned to this color.',
      };
    }

    // Remove the database record first.
    await db
      .delete(productImages)
      .where(
        and(
          eq(productImages.id, image.id),
          eq(productImages.productId, productId),
          eq(productImages.variantId, variantId),
        ),
      );

    // Cloudinary cleanup must not undo a successful database deletion.
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId, {
          invalidate: true,
        });
      } catch (error) {
        console.error('Cloudinary variant image cleanup failed:', error);
      }
    }

    revalidatePath(`/admin/products/${productId}/images`);
    revalidatePath(`/admin/products/${productId}/variants`);
    revalidatePath(`/products/${productId}`);
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Color image deleted successfully.',
    };
  } catch (error) {
    console.error('Delete variant image error:', error);

    return {
      success: false,
      message: 'Failed to delete the color image.',
    };
  }
}

