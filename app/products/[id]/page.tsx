
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";

import { db } from "@/app/db";
import {
  categories,
  productImages,
  products,
} from "@/app/db/schema";

import Navbar from "@/components/storefront/Navbar";
import ProductGallery from "@/components/storefront/ProductGallery";

export const dynamic = "force-dynamic";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;

  // Prevent malformed UUID values from reaching PostgreSQL.
  if (!uuidPattern.test(id)) {
    notFound();
  }

  // Fetch the requested product and its category.
  const productResult = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      offer: products.offer,
      color: products.color,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(
      categories,
      eq(products.categoryId, categories.id),
    )
    .where(eq(products.id, id))
    .limit(1);

  const product = productResult[0];

  if (!product) {
    notFound();
  }

  // Fetch all product images ordered by their position.
  const images = await db
    .select({
      id: productImages.id,
      secureUrl: productImages.secureUrl,
      position: productImages.position,
    })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(
      asc(productImages.position),
      asc(productImages.id),
    );

  const hasOffer =
    product.offer > 0 && product.offer <= 100;

  const discountedPrice = hasOffer
    ? product.price * (1 - product.offer / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <Link
          href="/#products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 items-start gap-8 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2 lg:gap-10 lg:p-10">
          {/* Product Images */}
          <ProductGallery
            productName={product.name}
            images={images}
          />

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                {product.categoryName ?? "Uncategorized"}
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${discountedPrice.toFixed(2)}
                </span>

                {hasOffer && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>

                    <span className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                      Save {product.offer}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-3 text-lg font-semibold">
                Product Description
              </h2>

              <p className="whitespace-pre-line leading-7 text-gray-600">
                {product.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="mb-4 text-lg font-semibold">
                Product Details
              </h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">
                    Category
                  </dt>
                  <dd className="font-medium">
                    {product.categoryName ?? "Uncategorized"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">
                    Color
                  </dt>
                  <dd className="font-medium">
                    {product.color}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
              Shopping cart and checkout functionality
              will be available in the next development phase.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
