import { and, desc, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { categories, productImages, products } from "./db/schema";

import Navbar from "@/components/storefront/Navbar";
import ProductCard from "@/components/storefront/ProductCard";
import Footer from "@/components/storefront/Footer";

export const dynamic = "force-dynamic";

export default async function HomePage(){
  const productList = await db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    offer: products.offer,
    categoryName: categories.name,
    mainImage: productImages.secureUrl,
  })
  .from(products)
  .leftJoin(
    categories,
    eq(products.categoryId, categories.id),
  )
  .leftJoin(
    productImages,
    and(
      eq(productImages.productId, products.id),
      eq(productImages.position, 0),
    )
  )
  .orderBy(desc(products.createdAt))
  .limit(12);

  return(
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar/>

      <main>
        <section className="bg-gray-900 text-center text-white px-5 py-20">
            <div className="mx-auto max-w-4xl">
                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-gray-300">
                  Welcome to Loozinga
                </p>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Discover Your Next Favorite
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-gray-300">
                  Explore our collection of fashion, accessories, and everyday essentials.
                </p>

                <a 
                  href="#products"
                  className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-200"
                >
                  Shop Now
                </a>
            </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-5 py-14"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Latest Products</h2>
            
            <p className="mt-2 text-gray-500">Discover the latest additions to our store.</p>
          </div>
          {
            productList.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <h3 className="text-lg font-semibold">No products available</h3>
              
                <p className="mt-2 text-gray-500">Check soon for new products</p>
              </div>
            ): (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {
                  productList.map((product) => (
                    <ProductCard key={product.id} product={product}/>
                  ))
                }
              </div>
            )
          }
        </section>
      </main>

<Footer/>
    </div>
  )
}