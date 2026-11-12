import Link from 'next/link';
import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from 'drizzle-orm';

import { db } from '@/app/db';
import {
  categories,
  productImages,
  products,
  productVariants,
  productVariantSizes,
} from '@/app/db/schema';

import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import ShopFilters from '@/components/storefront/ShopFilters';
import { getProductColors } from '@/utils/product-colors';

export const dynamic = 'force-dynamic';

const pageSize = 12;

type ShopPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    sort?: string | string[];
    page?: string | string[];
    color?: string | string[];
    size?: string | string[];
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

  const selectedColor = getParam(params.color)?.trim() ?? '';
  const selectedSize = getParam(params.size)?.trim() ?? '';

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

      // Fetch active categories
  const categoryList = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .where(eq(categories.status, 'Active'))
    .orderBy(asc(categories.name));

    // Fetch available variant colors
  const colorRows = await db
    .selectDistinct({ color: productVariants.color })
    .from(productVariants)
    .orderBy(asc(productVariants.color));

    // Fetch available variant sizes
  const sizeRows = await db
    .selectDistinct({ size: productVariantSizes.size })
    .from(productVariantSizes)
    .orderBy(asc(productVariantSizes.size));

  const colors = colorRows.map((row) => row.color);
  const sizes = sizeRows.map((row) => row.size);

  const color = colors.includes(selectedColor) ? selectedColor : '';
  const size = sizes.includes(selectedSize) ? selectedSize : '';

  // Calculate the actual selling price after any product offer
  const discountedPrice = sql<number>`(${products.price} * (1 - ${products.offer} / 100.0))`;

  const conditions = [eq(categories.status, 'Active')];

  // Search products
  if (search) {
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.description, `%${search}%`),
      )!,
    );
  }

  // Category filter
  if (categoryId) {
    conditions.push(eq(products.categoryId, categoryId));
  }

  // Minimum price filter
  if (minPrice !== undefined) {
    conditions.push(gte(discountedPrice, minPrice));
  }

  // Maximum price filter
  if (maxPrice !== undefined) {
    conditions.push(lte(discountedPrice, maxPrice));
  }

  // Color and size must match the same variant
  if (color || size) {
    const variantConditions = [eq(productVariants.productId, products.id)];

    if (color) {
      variantConditions.push(eq(productVariants.color, color));
    }

    if (size) {
      variantConditions.push(
        exists(
          db
            .select({ id: productVariantSizes.id })
            .from(productVariantSizes)
            .where(
              and(
                eq(productVariantSizes.variantId, productVariants.id),
                eq(productVariantSizes.size, size),
              ),
            ),
        ),
      );
    }

    conditions.push(
      exists(
        db
          .select({ id: productVariants.id })
          .from(productVariants)
          .where(and(...variantConditions)),
      ),
    );
  }

  //Sorting
  const allowedSort = ['newest', 'oldest', 'price-asc', 'price-desc'] as const;

  type SortOptions = (typeof allowedSort)[number];

  const requestedSort = getParam(params.sort);

  const sort: SortOptions = allowedSort.includes(requestedSort as SortOptions)
    ? (requestedSort as SortOptions)
    : 'newest';

  const whereCondition = and(...conditions);

  // Count matching products
  const countResult = await db
    .select({
      total: count(),
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereCondition);

  const totalProducts = countResult[0]?.total ?? 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const currentPage = Math.min(validPage, totalPages);
  const offset = (currentPage - 1) * pageSize;

  const sortOrder = {
    newest: [desc(products.createdAt), desc(products.id)],
    oldest: [asc(products.createdAt), asc(products.id)],
    'price-asc': [asc(discountedPrice), desc(products.id)],
    'price-desc': [desc(discountedPrice), desc(products.id)],
  }[sort];

  // Fetch products for the current page
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
    .orderBy(...sortOrder)
    .limit(pageSize)
    .offset(offset);

    // Get IDs for products on the current page
    const productIds = productList.map((product) => product.id);
    
    // Fetch all available colors for product cards
    const colorsByProduct = await getProductColors(productIds);
    
    // Fetch images matching the selected color
    const selectedVariantImages =
      color && productIds.length > 0
        ? await db
            .select({
              productId: productVariants.productId,
              secureUrl: productImages.secureUrl,
            })
            .from(productVariants)
            .innerJoin(
              productImages,
              eq(productImages.variantId, productVariants.id),
            )
            .where(
              and(
                inArray(productVariants.productId, productIds),
                eq(productVariants.color, color),
              ),
            )
            .orderBy(
              asc(productImages.position),
              asc(productImages.id),
            )
        : [];
    
    // Map each product to its first matching variant image 
    const selectedImageByProduct = new Map<string, string>();
    
    for (const image of selectedVariantImages) {
      if (!selectedImageByProduct.has(image.productId)) {
        selectedImageByProduct.set(image.productId, image.secureUrl);
      }
    }
    
    // Prepare product cards with colors and images
    const productsWithColors = productList.map((product) => ({
      ...product,
      mainImage:
        selectedImageByProduct.get(product.id) ??
        product.mainImage,
      colors: colorsByProduct.get(product.id) ?? [],
    }));

  // Preserve filters when changing pages
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
    if (color) query.set('color', color);
    if (size) query.set('size', size);
    if (sort !== 'newest') {
      query.set('sort', sort);
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

          <p className="mt-2 mb-4 text-gray-500">
            Find something you will love.
          </p>

          {/* Search and Filters */}
          <form
            action="/shop"
            method="GET"
            className="mb-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
          >
            <label
              htmlFor="shop-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search products
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                id="shop-search"
                name="q"
                defaultValue={search}
                placeholder="Search products..."
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              {categoryId && (
                <input type="hidden" name="category" value={categoryId} />
              )}
              {minPrice !== undefined && (
                <input type="hidden" name="minPrice" value={minPrice} />
              )}
              {maxPrice !== undefined && (
                <input type="hidden" name="maxPrice" value={maxPrice} />
              )}
              {color && <input type="hidden" name="color" value={color} />}
              {size && <input type="hidden" name="size" value={size} />}

              <input type="hidden" name="sort" value={sort} />

              <button
                type="submit"
                className="w-full rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition  hover:bg-gray-800 sm:w-auto"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <ShopFilters
              categories={categoryList}
              search={search}
              categoryId={categoryId}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sort={sort}
              colors={colors}
              sizes={sizes}
              selectedColor={color}
              selectedSize={size}
            />

            <section className="min-w-0">
              {/* Results */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {productList.length} of {totalProducts} products
                </p>

                <form
                  action="/shop"
                  method="GET"
                  className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
                >
                  <input type="hidden" name="q" value={search} />

                  {categoryId && (
                    <input type="hidden" name="category" value={categoryId} />
                  )}

                  {minPrice !== undefined && (
                    <input type="hidden" name="minPrice" value={minPrice} />
                  )}

                  {maxPrice !== undefined && (
                    <input type="hidden" name="maxPrice" value={maxPrice} />
                  )}

                  {color && <input type="hidden" name="color" value={color} />}
                  {size && <input type="hidden" name="size" value={size} />}

                  <label
                    htmlFor="shop-grid-sort"
                    className="whitespace-nowrap text-sm font-medium"
                  >
                    Sort by
                  </label>

                  <select
                    id="shop-grid-sort"
                    name="sort"
                    defaultValue={sort}
                    className="min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest arrivals</option>
                    <option value="oldest">Oldest first</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {(search ||
                categoryId ||
                minPrice !== undefined ||
                maxPrice !== undefined ||
                color ||
                size) && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {[
                    ['q', search, `Search: ${search}`],
                    [
                      'category',
                      categoryId ? String(categoryId) : '',
                      `Category: ${
                        categoryList.find((c) => c.id === categoryId)?.name ??
                        ''
                      }`,
                    ],
                    [
                      'minPrice',
                      minPrice !== undefined ? String(minPrice) : '',
                      `Min: $${minPrice}`,
                    ],
                    [
                      'maxPrice',
                      maxPrice !== undefined ? String(maxPrice) : '',
                      `Max: $${maxPrice}`,
                    ],
                    ['color', color, `Color: ${color}`],
                    ['size', size, `Size: ${size}`],
                  ]
                    .filter(([, value]) => value !== '')
                    .map(([key, , label]) => {
                      const query = new URLSearchParams();

                      if (search) query.set('q', search);
                      if (categoryId) query.set('category', String(categoryId));
                      if (minPrice !== undefined)
                        query.set('minPrice', String(minPrice));
                      if (maxPrice !== undefined)
                        query.set('maxPrice', String(maxPrice));
                      if (color) query.set('color', color);
                      if (size) query.set('size', size);
                      if (sort !== 'newest') query.set('sort', sort);

                      query.delete(key);

                      return (
                        <Link
                          key={key}
                          href={`/shop?${query.toString()}`}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                        >
                          {label} ×
                        </Link>
                      );
                    })}
                </div>
              )}

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
                <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {productsWithColors.map((product) => (
                    <ProductCard key={product.id} product={product} selectedColor={color}/>
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
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
