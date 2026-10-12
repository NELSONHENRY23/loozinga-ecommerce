import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { products } from '@/app/db/schema';
import { cloudinary } from '@/utils/cloudinary';

import { requireAdmin } from '@/utils/superbase/require-admin';

const requestSchema = z.object({
  productId: z.uuid(),
});

export async function POST(
  request: Request,
) {
 // Protect privileged upload-signing credentials.

 try{
  await requireAdmin();
 }catch{
  return NextResponse.json({message: 'Unauthorized.'}, {status: 403},);
 }

  // validate request body
  const body =
    await request.json().catch(() => null);

  const parsed =
    requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid product ID.',
      },
      {
        status: 400,
      },
    );
  }

  // Only sign uploads for exisiting products.
  const [product] = await db.select({id: products.id})
  .from(products)
  .where(eq(products.id, parsed.data.productId))
  .limit(1);

  if(!product){
    return NextResponse.json({message: 'Product not found'}, {status: 404},);
  }

  // Read Cloudinary configuration
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME;

  const apiKey =
    process.env.CLOUDINARY_API_KEY;

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET;

  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    !uploadPreset
  ) {
    return NextResponse.json(
      {
        message:
          'Cloudinary configuration is missing.',
      },
      {
        status: 500,
      },
    );
  }

  // Create short-lived signed upload
  const timestamp =
    Math.round(Date.now() / 1000);

  const folder =
    `loozinga/products/${parsed.data.productId}`;

  const signature =
    cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        upload_preset: uploadPreset,
      },
      apiSecret,
    );

    // API key is safe to expose. 
    // API secure must never be returned.

  return NextResponse.json({
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder,
    uploadPreset,
  });
}