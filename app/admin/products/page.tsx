import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Images, Trash2 } from 'lucide-react';
import { products } from '@/data/products';

export default function ProductsPage() {
  return (
    <div className="p-5">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Products
        </h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>

          <span>/</span>

          <span>Products</span>
        </div>
      </div>

      {/* Products panel */}
      <section className="overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Products
          </h2>

          <Link
            href="/admin/products/new"
            className="rounded bg-[#26c281] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#20a66e]"
          >
            Add Product
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-sm">
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
              {products.map((product) => {
               
                return (
                  <tr
                    key={product.id}
                    className="border-t border-gray-100 transition hover:bg-gray-50"
                  >
                    {/* Product ID */}
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {product.id}
                    </td>

                    {/* Product image */}
                    <td className="px-5 py-4">
                    <div className="relative h-[72px] w-[72px] overflow-hidden rounded">
                        <Image
                        src={product.images.image}
                        alt={product.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                        />
                    </div>
                    </td>

                    {/* Name */}
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {product.name}
                    </td>

                    {/* Description */}
                    <td className="max-w-[280px] px-5 py-4 text-gray-700">
                      <p className="line-clamp-3">
                        {product.description}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 font-medium text-gray-700">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* Offer */}
                    <td className="px-5 py-4 text-gray-700">
                      {product.offer}%
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-gray-700">
                      {product.category}
                    </td>

                    {/* Color */}
                    <td className="px-5 py-4 text-gray-700">
                      {product.color}
                    </td>

                    {/* Manage Images */}
                    <td className="px-5 py-4">
                    <Link
                          href={`/admin/products/${product.id}/images`}
                          className="inline-flex w-fit items-center gap-2 rounded bg-amber-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-600"
                        >
                          <Images size={16} />
                          Manage Images
                        </Link>
                    </td>

                    {/* Edit */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-2 rounded bg-blue-500 px-3 py-2 text-white transition hover:bg-blue-600"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded bg-red-500 px-3 py-2 text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Temporary pagination */}
      <div className="mt-6 flex justify-center">
        <div className="flex overflow-hidden rounded border border-gray-300 bg-white">
          <button
            type="button"
            disabled
            className="border-r border-gray-300 px-4 py-2 text-sm text-gray-400"
          >
            Previous
          </button>

          <button
            type="button"
            className="border-r border-gray-300 bg-blue-500 px-4 py-2 text-sm text-white"
          >
            1
          </button>

          <button
            type="button"
            className="border-r border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            2
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}