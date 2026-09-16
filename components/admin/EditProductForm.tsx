'use client';

import {
  ChangeEvent,
  FormEvent,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

import { updateProduct } from '@/app/admin/products/actions';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  offer: number | null;
  color: string | null;
  categoryId: number | null;
};

type Category = {
  id: number;
  name: string;
};

type EditProductFormProps = {
  product: Product;
  categories: Category[];
};

export default function EditProductForm({
  product,
  categories,
}: EditProductFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState('');

  const [formData, setFormData] =
    useState({
      name: product.name,
      description:
        product.description ?? '',
      price: String(product.price),
      offer: String(
        product.offer ?? 0,
      ),
      color: product.color ?? '',
      categoryId: product.categoryId
        ? String(product.categoryId)
        : '',
    });

  function handleChange(
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
    >,
  ) {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    startTransition(async () => {
      try {
        const result =
          await updateProduct(
            product.id,
            {
              name: formData.name,
              description:
                formData.description,

              price: Number(
                formData.price,
              ),

              offer: Number(
                formData.offer || 0,
              ),

              color: formData.color,

              categoryId: Number(
                formData.categoryId,
              ),
            },
          );

        if (!result.success) {
          setError(result.message);
          return;
        }

        // After successful update,
        // return to products page.
        router.replace(
          '/admin/products',
        );
      } catch (error) {
        console.error(
          'UPDATE PRODUCT ERROR:',
          error,
        );

        setError(
          'Failed to update product.',
        );
      }
    });
  }

  return (
    <div className="p-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Home / Products / Edit Product
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-700">
            Product Details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Product ID: {product.id}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {/* Product name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <input
              type="text"
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="categoryId"
              value={
                formData.categoryId
              }
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={String(
                      category.id,
                    )}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color
            </label>

            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Offer */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Special Offer / Sale %
            </label>

            <input
              type="number"
              name="offer"
              value={formData.offer}
              onChange={handleChange}
              min="0"
              max="100"
              step="1"
              disabled={isPending}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />

              {isPending
                ? 'Updating...'
                : 'Update Product'}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                router.push(
                  '/admin/products',
                )
              }
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={17} />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}