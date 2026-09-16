'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Trash2, X } from 'lucide-react';

import { uploadCloudinaryImage } from '@/utils/uploadCloudinary';
import {
  deleteProductImage,
  saveProductImages,
} from '@/app/admin/products/image-actions';

type ExistingImage = {
  id: string;
  position: number;
  secureUrl: string;
  createdAt: Date;
};

type ProductImagesFormProps = {
  product: {
    id: string;
    name: string;
  };

  existingImages: ExistingImage[];
};

const allowedImageTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const imageSlots = [
  {
    position: 0,
    label: 'Main Image',
  },
  {
    position: 1,
    label: 'Image 1',
  },
  {
    position: 2,
    label: 'Image 2',
  },
  {
    position: 3,
    label: 'Image 3',
  },
  {
    position: 4,
    label: 'Image 4',
  },
];

export default function ProductImagesForm({
  product,
  existingImages,
}: ProductImagesFormProps) {

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  
  const [error, setError] = useState('');

  const [files, setFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  // save database / cloudinary images.
  const[existingUrls, setExistingUrls] = useState<string[]>(
    Array.from({length: 5}, (_, position) => existingImages.find((image) => image.position === position)?.secureUrl ?? '')
  )

  // Local browser previews for files that have not been uploaded yet.
const [selectedPreviews, setSelectedPreviews] = useState<string[]>(['','','','','']);
 
  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    position: number,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');

    if(!allowedImageTypes.includes(file.type)){
      setError('Only JPG, JPEG, PNG, WEBP images are allowed.');

      event.target.value = '';
      return;
    }

    // Revoke previous unsaved preview for this slot.
    const oldPreview = selectedPreviews[position];

    if(oldPreview.startsWith('blob:')){
      URL.revokeObjectURL(oldPreview,)
    }

    const previewUrl = URL.createObjectURL(file);

    setFiles((previous) => {
      const updated = [...previous];

      updated[position] = file;

      return updated;
    });

    
    setSelectedPreviews((previous) => {
      const updated = [...previous];

      updated[position] = previewUrl;

      return updated;
    });
  
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    const selectedImages = files
      .map((file, position) =>
        file
          ? {
              file,
              position,
            }
          : null,
      )
      .filter(
        (
          item,
        ): item is {
          file: File;
          position: number;
        } => item !== null,
      );

    if (selectedImages.length === 0) {
      setError('Choose at least one image to update.');
      return;
    }

    startTransition(async () => {
      try {
        const uploaded = await Promise.all(
          selectedImages.map(async ({ file, position }) => {
            const image = await uploadCloudinaryImage(file, product.id);
            return{
              position,
              secureUrl: image.secureUrl,
              publicId: image.publicId,
            };
          },
        ),
        );

        const result = await saveProductImages({
          productId: product.id,
          images: uploaded,
        });

        if (!result?.success) {
          setError(result?.message ?? 'Failed to save images.');
          return;
        }

        
        router.replace('/admin/products');

      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : 'One or more images could not be uploaded.',
        );
      }
    });
    
  }

  function handleDeleteImage(position: number) {
    setError('');

    /*
      If this slot has a newly selected file, only remove the local file.

      Do not delete the exisiting database image.
    */
   if(files[position]){
    const preview = selectedPreviews[position];

    if(preview.startsWith('blob:')){
      URL.revokeObjectURL(preview);
    }

    setFiles((previous) => {
      const updated = [...previous,];

      updated[position] = null;

      return updated;
    });

    setSelectedPreviews((previous) => {
      const updated = [...previous,];

      updated[position] = '';

      return updated;
    });

    return;
   }

   // No new file. Delete the saved image.
   if(!existingUrls[position]){return;}

    startTransition(async () => {
      try {
        const result = await deleteProductImage({
          productId: product.id,
          position,
        });

        if (!result?.success) {
          setError(result?.message ?? 'Image could not be deleted.');
          return;
        }

        setExistingUrls((previous) => {
          const updated = [...previous,];

          updated[position] = '';

          return updated;
        });

        router.refresh();
      } catch (error) {
        console.error(error);

        setError('Image could not be deleted.');
      }
    });
  }

  return (
    <div className="p-6">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Edit Product Images
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Home / Products / Edit Images
        </p>
      </div>

      {/* Images panel */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-700">Update Product Images</h2>

          <p className="mt-1 text-sm text-gray-500">
            {product.name} • Product ID: {product.id}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {imageSlots.map(({ position, label }) => {
              const preview = selectedPreviews[position] || existingUrls[position];

              const hasNewFile = Boolean(files[position]);

              return (
                <div
                  key={position}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {label}
                    </label>

                    {preview && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDeleteImage(position)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        {
                          hasNewFile ? 'Remove' : 'Delete'
                        }
                      </button>
                    )}
                  </div>

                  {/* Image preview */}
                  <div className="relative mb-3 flex h-44 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
                    {!preview ? (
                      <span className="text-sm text-gray-400">No image</span>
                    ) : (
                      <Image
                        src={preview}
                        alt={label}
                        fill
                        unoptimized
                        className="rounded-md object-cover"
                      />
                    )}
                  </div>

                  {/* File input */}
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    disabled={isPending}
                    onChange={(event) => handleImageChange(event, position)}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={17} />

              {isPending ? 'Updating...' : 'Update Images'}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
