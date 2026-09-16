'use client';

import { ChangeEvent, FormEvent, useTransition, useState } from 'react';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { createProduct } from '@/app/admin/products/actions';


type CategoryOption = {
  id: number;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
};

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  offer: string;
  categoryId: string;
  color: string;
};

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  offer: '0',
  categoryId: '',
  color: '',
};

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);


  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    startTransition(async () => {
      // create the database for product first
      const result = await createProduct({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        offer: formData.offer === '' ? 0 : Number(formData.offer),
        categoryId: Number(formData.categoryId),
        color: formData.color.trim(),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      // At this point PostgreSql has generated the UUID
      const productId = result.productId;

        // route to edit product images
        router.push(`/admin/products/${productId}/images`);
      
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
        {/* Left side */}
        <div className="space-y-6 xl:col-span-2">
          {/* General Information */}
          <section className="bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-700">
                General Information
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Enter the basic information for product.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <FormField label="Product Title" required>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  required
                  className="form-input"
                />
              </FormField>

              <FormField label="Description" required>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Enter product description"
                  required
                  className="form-input resize-none"
                />
              </FormField>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-700">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
              <FormField label="Price" required>
                <div className="relative">
                  <span className="absolute left-3 top1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="form-input pl-8"
                  />
                </div>
              </FormField>

              <FormField label="Special Offer / Sale">
                <div className="relative">
                  <input
                    type="number"
                    name="offer"
                    value={formData.offer}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    placeholder="0"
                    className="form-input pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    %
                  </span>
                </div>
              </FormField>
            </div>
          </section>   
        </div>

        {/* Right side */}
        <div className="space-y-6">
          <section className="bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Organization
              </h2>
            </div>

            <div className="space-y-5 p-6">
              <FormField label="Category" required>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={categories.length === 0}
                  className="form-input"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Color" required>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Black"
                  required
                  className="form-input"
                />
              </FormField>
            </div>
          </section>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          {/* Save panel */}
          <section className="bg-white p-6 shadow-sm">
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 font-medium text-white transition hover:bg-blue-600"
            >
              <Save size={18} />
              {isPending ? 'Creating...' : 'Create Product'}
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}

/*
    Reusable form field
*/

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-600">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

