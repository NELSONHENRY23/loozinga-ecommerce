
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, and, desc, eq, inArray, ne } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";

import { db } from "@/app/db";
import {
  categories,
  productImages,
  products,
  productVariants,
  productVariantSizes,
} from "@/app/db/schema";

import ProductVariantSelector from "@/components/storefront/ProductVariantSelector";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import ProductCard from "@/components/storefront/ProductCard";
import { getProductColors } from "@/utils/product-colors";

export const dynamic = "force-dynamic";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    color?: string | string[];
  }>
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProductDetailsPage({
  params,
  searchParams
}: ProductDetailsPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const initialColor = Array.isArray(query.color)
            ? query.color[0] ?? ""
            : query.color ?? "";

  // Prevent malformed UUID values from reaching PostgreSQL.
  if (!uuidPattern.test(id)) {
    notFound();
  }

  // Fetch the product and its category.
  const productResult = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      offer: products.offer,
      categoryId: products.categoryId,
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

  // Fetch related products
  const relatedProducts = await db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      offer: products.offer,
      categoryName: categories.name,
      mainImage: productImages.secureUrl,
  })
  .from(products)
  .innerJoin(
    categories,
    eq(products.categoryId, categories.id),
  )
  .leftJoin(
    productImages,
    and(
      eq(productImages.productId, products.id),
      eq(productImages.position, 0),
    ),
  )
  .where(
    and(
      eq(products.categoryId, product.categoryId),
      ne(products.id, id),
      eq(categories.status, "Active"),
    )
  )
  .orderBy(desc(products.createdAt))
  .limit(4);

  const relatedColorsByProduct = await getProductColors(
    relatedProducts.map((product) => product.id),
  );

  const relatedProductsWithColors = relatedProducts.map((product) => ({
    ...product,
    colors: relatedColorsByProduct.get(product.id) ?? [],
  }));

  // Fetch the product's available color variants.
  const variants = await db
    .select({
      id: productVariants.id,
      color: productVariants.color,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .orderBy(asc(productVariants.createdAt));

    // Fetch available sizes for the product's color variants.
    const variantSizes = variants.length > 0 
      ? await db.select({
        variantId: productVariantSizes.variantId,
        size: productVariantSizes.size,
      })
      .from(productVariantSizes)
      .where(
        inArray(
          productVariantSizes.variantId,
          variants.map((variant) => variant.id),
        ),
      )
      .orderBy(asc(productVariantSizes.size))
      : [];
      

  // Fetch all images once, including their variant associations.
  const productImageResults = await db
    .select({
      id: productImages.id,
      variantId: productImages.variantId,
      secureUrl: productImages.secureUrl,
      position: productImages.position,
    })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(
      asc(productImages.position),
      asc(productImages.id),
    );

  // Associate each color variant with its image, if available.
  const variantsWithImages = variants.map((variant) => ({
    ...variant,
    image:
      productImageResults.find(
        (image) => image.variantId === variant.id,
      ) ?? null,

      sizes: variantSizes
        .filter((item) => item.variantId === variant.id)
        .map((item) => item.size),
  }));

  // Keep older, non-variant images working.
  const legacyImages = productImageResults
    .filter((image) => image.variantId === null)
    .map(({ id, secureUrl, position }) => ({
      id,
      secureUrl,
      position,
    }));

  const hasOffer =
    product.offer > 0 && product.offer <= 100;

  const discountedPrice = hasOffer
    ? Math.round(product.price * (1 - product.offer / 100) * 100) / 100
    : product.price;

    
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
    
        <main className="mx-auto max-w-7xl px-5 py-10">
          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
    
          <div className="space-y-10 rounded-2xl bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            {/* Product heading and pricing */}
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-500">
                  {product.categoryName ?? "Uncategorized"}
                </p>
    
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {product.name}
                </h1>
              </div>
    
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
    
            {/* Gallery left, color/size options right */}
            <ProductVariantSelector
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                offer: product.offer,
              }}
              variants={variantsWithImages}
              legacyImages={legacyImages}
              initialColor={initialColor}
            />
    
            {/* Description and details below the gallery */}
            <div className="grid gap-8 border-t border-gray-200 pt-8 lg:grid-cols-2">
              <section>
                <h2 className="mb-3 text-lg font-semibold">
                  Product Description
                </h2>
    
                <p className="whitespace-pre-line leading-7 text-gray-600">
                  {product.description}
                </p>
              </section>
    
              <section>
                <h2 className="mb-4 text-lg font-semibold">
                  Product Details
                </h2>
    
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Category</dt>
    
                    <dd className="font-medium">
                      {product.categoryName ?? "Uncategorized"}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
    
          {/* Related products */}
          {relatedProductsWithColors.length > 0 && (
            <section className="mt-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">
                  You May Also Like
                </h2>
    
                <p className="mt-2 text-gray-500">
                  Explore more products from this collection.
                </p>
              </div>
    
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProductsWithColors.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
    
        <Footer />
      </div>
    );
    
}
