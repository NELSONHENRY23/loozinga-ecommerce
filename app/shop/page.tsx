import Link from 'next/link';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from 'drizzle-orm';

import { db } from '@/app/db';
import { categories, productImages, products } from '@/app/db/schema';

import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';

export const dynamic = 'force-dynamic';

const pageSize = 12;

type ShopPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    page?: string | string[];
  }>;
};

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getValidPrice(value?: string) {
  if (!value || value.trim() === '') return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const search = getParam(params.q)?.trim() ?? '';
  const categoryValue = getParam(params.category);
  const minPrice = getValidPrice(getParam(params.minPrice));
  const maxPrice = getValidPrice(getParam(params.maxPrice));

  const requestedCategory = Number(categoryValue);

  const categoryId =
    Number.isSafeInteger(requestedCategory) && requestedCategory > 0
      ? requestedCategory
      : undefined;

  const requestedPage = Number(getParam(params.page) ?? 1);

  const validPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const categoryList = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .where(eq(categories.status, 'Active'))
    .orderBy(asc(categories.name));

  // Calculate the actual selling price after any product offer
  const discountedPrice = sql<number>`(${products.price} * (1 - ${products.offer} / 100.0))`;

  const conditions = [eq(categories.status, 'Active')];

  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`),
      )!,
    );
  }

  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  if (minPrice !== undefined) {
    conditions.push(gte(discountedPrice, minPrice));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(discountedPrice, maxPrice));
  }

  const whereCondition = and(...conditions);

  const countResult = await db
    .select({
      total: count(),
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereCondition);

  const totalProducts = countResult[0]?.total ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const currentPage = Math.min(validPage, totalPages);
  const offset = (currentPage - 1) * pageSize;

  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      offer: products.offer,
      categoryName: categories.name,
      mainImage: productImages.secureUrl,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.position, 0),
      ),
    )
    .where(whereCondition)
    .orderBy(desc(products.createdAt), desc(products.id))
    .limit(pageSize)
    .offset(offset);

  function getPageUrl(page: number) {
    const query = new URLSearchParams();

    if (search) query.set('q', search);
    if (categoryId) query.set('category', String(categoryId));
    if (minPrice !== undefined) {
      query.set('minPrice', String(minPrice));
    }
    if (maxPrice !== undefined) {
      query.set('maxPrice', String(maxPrice));
    }

    query.set('page', String(page));

    return `/shop?${query.toString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
            Explore Loozinga
          </p>

          <h1 className="mt-2 text-3xl font-bold">Shop All Products</h1>

          <p className="mt-2 mb-4 text-gray-500">Find something you will love.</p>

          {/* Search and Filters */}

          <form
            action="/shop"
            method="GET"
            className="mb-8 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label
                  htmlFor="shop-search"
                  className="mb-2 block text-sm font-medium"
                >
                  Search products
                </label>

                <input
                  id="shop-search"
                  type="search"
                  name="q"
                  defaultValue={search}
                  placeholder="Search by product name..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="shop-category"
                  className="mb-2 text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="shop-category"
                  name="category"
                  defaultValue={categoryId ? String(categoryId) : ''}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                >
                  <option value="">All categories</option>
                  {categoryList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="shop-min-price"
                    className="mb-2 block text-sm font-medium"
                  >
                    Min price
                  </label>

                  <input
                    id="shop-min-price"
                    type="number"
                    name="minPrice"
                    min="0"
                    step="0.01"
                    defaultValue={minPrice}
                    placeholder="0.00"
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shop-max-price"
                    className="mb-2 block text-sm font-medium"
                  >
                    Max price
                  </label>

                  <input
                    id="shop-max-price"
                    type="number"
                    name="maxPrice"
                    min="0"
                    step="0.01"
                    defaultValue={maxPrice}
                    placeholder="Any"
                    className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm outline-none focus:border-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
               Apply Filters
              </button>

              <Link
                  href="/shop"
                  className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Clear Filters
                </Link>
            </div>
          </form>

          {/* Results */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {productList.length} of {totalProducts} products
            </p>
          </div>

          {productList.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
              <h2 className="text-lg font-semibold">No products found</h2>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-block font-semibold text-gray-900 underline"
              >
                View all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}

              
            </div>
          )}

{/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  {currentPage > 1 && (
                    <Link
                      href={getPageUrl(currentPage - 1)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-white"
                    >
                      Previous
                    </Link>
                  )}

                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </span>

                  {currentPage < totalPages && (
                    <Link
                      href={getPageUrl(currentPage + 1)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-white"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
