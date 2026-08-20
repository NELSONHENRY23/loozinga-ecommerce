'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const imageFields = [
  { key: 'image', label: 'Main Image' },
  { key: 'image1', label: 'Image 1' },
  { key: 'image2', label: 'Image 2' },
  { key: 'image3', label: 'Image 3' },
  { key: 'image4', label: 'Image 4' },
];

export default function EditProductImagesPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [images, setImages] = useState({
    image: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [previews, setPreviews] = useState({
    image: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
  });

  function handleImageChange(event, key) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImages((previousImages) => ({
      ...previousImages,
      [key]: file,
    }));

    const previewUrl = URL.createObjectURL(file);

    setPreviews((previousPreviews) => ({
      ...previousPreviews,
      [key]: previewUrl,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log('Product ID:', productId);
    console.log('New images:', images);

    // TODO: Upload images

    router.push('/admin/products');
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Product Images</h1>

        <p className="mt-1 text-sm text-gray-500">
          Home / Products / Edit Images
        </p>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-700">Update Product Images</h2>
          <p className="mt-1 text-sm text-gray-500">Product Id: {productId}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {imageFields.map((field) => (
              <div key={field.key}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <div className="mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {previews[field.key] ? (
                    <Image
                      src={previews[field.key]}
                      alt={`${field.label} preview`}
                      width={640}
                      height={640}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        No new image selected
                      </p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange(event, field.key)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                />

                {images[field.key] && (
                  <p className="mt-2 text-xs text-gray-500">
                    {images[field.key].name}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Upload Images
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
