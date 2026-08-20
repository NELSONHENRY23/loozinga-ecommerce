'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { products } from '@/data/products';

type ImageKey = "image" | "image1"| "image2"| "image3"| "image4";

type ProductImages = Record<ImageKey, File | null>;

type ImagePreviews = Record<ImageKey, string>;

const imageFields: { key: ImageKey; label: string;}[] = [
  { key: 'image', label: 'Main Image' },
  { key: 'image1', label: 'Image 1' },
  { key: 'image2', label: 'Image 2' },
  { key: 'image3', label: 'Image 3' },
  { key: 'image4', label: 'Image 4' },
];


export default function EditProductImagesPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const product = products.find(
    (product) => product.id === Number(productId)
  )

  const [images, setImages] = useState<ProductImages>({
    image: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [previews, setPreviews] = useState<ImagePreviews>({
    image: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
  });


  function handleImageChange(event: ChangeEvent<HTMLInputElement>, key: ImageKey) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();

    Object.entries(images).forEach(([key, file]) => {
        if(file){
            formData.append(key, file);
        }
    })

    console.log('Updating product:', productId);
    
    for(const [key, value] of formData.entries()){
        console.log(key, value);
    }

    // TODO: Upload images

  }

  if (!product) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Product Not Found
          </h1>
  
          <p className="mt-2 text-sm text-gray-500">
            The product you are trying to edit does not exist.
          </p>
  
          <button
            onClick={() => router.push('/admin/products')}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
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
          <p className="mt-1 text-sm text-gray-500">{product.name} * Product Id: {productId}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {imageFields.map((field) => (
              <div key={field.key} className="rounded-lg border border-gray-200 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <div className="mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                  {
                    <Image
                      src={previews[field.key] || product.images[field.key]}
                      alt={`${field.label} preview`}
                      width={640}
                      height={640}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                 }
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageChange(event, field.key)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                />

                {images[field.key] ? (
                  <p className="mt-2 text-xs text-gray-500">
                   New image: {images[field.key]?.name}
                  </p>
                ):(
                    <p className="mt-2 text-xs text-gray-400">
    Current image will be kept
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
