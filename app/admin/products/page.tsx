import { and, count, desc, eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { Images, Pencil } from 'lucide-react';

import { db } from '@/app/db';
import { categories, productImages, products } from '@/app/db/schema';
import DeleteProductButton from '@/components/DeleteProductButton';
import Pagination from '@/components/admin/Pagination';
/*
  Admin products should always use
  current database information.
 */
export const dynamic = 'force-dynamic';

const pageSize = 10;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  /*
    IMPORTANT:
   Query database inside the page.
   
    This makes Next.js fetch the current
    products whenever this page renders.
   */
    
    // Read the current page from URL
    const params = await searchParams;

    const requestedPage = Number(params.page ?? 1);

    const validPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    // Count all products in the database
    const countResult = await db.select({total: count()}).from(products);
    const totalProducts = countResult[0]?.total ?? 0;

    // Calculate the total number of pages.
    const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

    // Prevent requests eyond the last page.
    const currentPage = Math.min(validPage, totalPages);

    // calculate how many products to skip
    const offset = (currentPage - 1) * pageSize;
    
  const productList = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      offer: products.offer,
      color: products.color,

      categoryName: categories.name,

      mainImage: productImages.secureUrl,
    })
    .from(products)

    .leftJoin(categories, eq(products.categoryId, categories.id))

    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.position, 0),
      ),
    )

    .orderBy(desc(products.createdAt), desc(products.id)).limit(pageSize).offset(offset);

  return (
    <div className="p-5">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Products</h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>

          <span>/</span>

          <span>Products</span>
        </div>
      </div>

      <section className="overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-700">Products</h2>

          <Link
            href="/admin/products/new"
            className="rounded bg-[#26c281] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#20a66e]"
          >
            Add Product
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[325px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Product ID</th>

                <th className="px-5 py-4">Image</th>

                <th className="px-5 py-4">Product Name</th>

                <th className="px-5 py-4">Product Description</th>

                <th className="px-5 py-4">Price</th>

                <th className="px-5 py-4">Offer</th>

                <th className="px-5 py-4">Category</th>

                <th className="px-5 py-4">Color</th>

                <th className="px-5 py-4">Images</th>

                <th className="px-5 py-4">Edit</th>

                <th className="px-5 py-4">Delete</th>
              </tr>
            </thead>

            <tbody>
              {productList.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                productList.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {product.id}
                    </td>

                    <td className="px-5 py-4">
                      {product.mainImage ? (
                        <div className="relative h-[72px] w-[72px] overflow-hidden rounded">
                          <Image
                            src={product.mainImage}
                            alt={product.name}
                            fill
                            sizes="72px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-[72px] w-[72px] items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-400">
                          No image
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {product.name}
                    </td>

                    <td className="max-w-[280px] px-5 py-4 text-gray-700">
                      <p className="line-clamp-3">{product.description}</p>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {product.offer}%
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {product.categoryName ?? 'Uncategorized'}
                    </td>

                    <td className="px-5 py-4 text-gray-700">{product.color}</td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}/images`}
                        className="inline-flex w-fit items-center gap-2 rounded bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600"
                      >
                        <Images size={16} />
                        Manage Images
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-2 rounded bg-blue-500 px-3 py-2 text-white transition hover:bg-blue-600"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* pagination UI */}
  
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  basePath="/admin/products"
/>
    </div>
  );
}
