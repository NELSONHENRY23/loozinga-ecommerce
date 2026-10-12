import { asc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/app/db";
import { products, productImages } from "@/app/db/schema";
import ProductImagesForm from "@/components/admin/ProductImagesForm";

export default async function EditProductImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  /*
   Product and images do not depend
   on each other, so load both together.
  */
  const [productResult, images] = 
  await Promise.all([
    db.select({
        id: products.id,
        name: products.name,
      })
      .from(products)
      .where(eq(products.id, id))
      .limit(1),

      db.select({
        id: productImages.id,
        position: productImages.position,
        secureUrl: productImages.secureUrl,
        createdAt: productImages.createdAt,
      })
      .from(productImages)
      .where(
        eq(
          productImages.productId, id
        )
      )
      .orderBy(
        asc(productImages.position),
      )
    ]);

    const product = productResult[0];

  if (!product) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The product you are trying to edit does not exist.
          </p>

          <Link
            href="/admin/products"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  return (
    <ProductImagesForm
      product={product}
      existingImages={images}
    />
  );
}