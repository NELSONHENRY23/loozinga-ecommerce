'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { ImagePlus, Save, X } from 'lucide-react';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  offer: string;
  category: string;
  color: string;
};

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  offer: '',
  category: 'clothing',
  color: '',
};

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setImages((previous: (File | null)[]) => {
      const updatedImages = [...previous];
      updatedImages[index] = file;

      return updatedImages;
    });
  }

  function removeImage(index: number) {
    setImages((previous: (File | null)[]) => {
      const updatedImages = [...previous];
      updatedImages[index] = null;
      return updatedImages;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log('Product information: ', formData);
    console.log('Product images: ', images);

    alert('Form is working! We will connect it to database later.');

    // Clear the form after submission
    setFormData(initialFormData);
    setImages([null, null, null, null, null]);
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

          {/* Images */}
          <section className="bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Product Images
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Add a main image and up to four additional product images
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image, index) => (
                  <ImageUpload
                    key={index}
                    index={index}
                    image={image}
                    onChange={handleImageChange}
                    onRemove={removeImage}
                  />
                ))}
              </div>
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
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="clothing">clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="footwear">Footwear</option>
                  <option value="specials">Specials</option>
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

          {/* Save panel */}
          <section className="bg-white p-6 shadow-sm">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded bg-blue-500 font-medium text-white transition hover:bg-blue-600"
            >
              <Save size={18} />
              Create Product
            </button>

            <p className="mt-3 text-center text-xs text-gray-400">
              Database saving will be added later
            </p>
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

/*
    Image upload box
*/

function ImageUpload({
  index,
  image,
  onChange,
  onRemove,
}: {
  index: number;
  image: File | null;
  onChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}) {
  const label = index === 0 ? 'Main Image' : `Image ${index}`;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
      {!image ? (
        <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-blue-400 hover:bg-blue-50">
          <ImagePlus size={28} />

          <span className="mt-2 text-sm">Choose image</span>

          <input
            type="file"
            accept="image/*"
            onChange={(event) => onChange(index, event)}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex h-36 flex-col items-center justify-center rounded border border-gray-200 bg-gray-50 p-3">
          <p className="max-w-full truncate text-sm font-medium text-gray-700">
            {image.name}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {(image.size / 1024).toFixed(1)} KB
          </p>

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="mt-4 flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
          >
            <X size={15} />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
