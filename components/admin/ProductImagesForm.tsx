'use client';

import Image from 'next/image';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';

import { uploadCloudinaryImage } from '@/utils/uploadCloudinary';
import {
  saveVariantImage,
  deleteVariantImage,
} from '@/app/admin/(protected)/products/image-actions';
import Link from 'next/link';

type ProductVariant = {
  id: string;
  color: string;
  image: {
    id: string;
    secureUrl: string;
  } | null;
};

type ProductImagesFormProps = {
  product: {
    id: string;
    name: string;
  };
  variants: ProductVariant[];
};

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductImagesForm({
  product,
  variants,
}: ProductImagesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [variantId, setVariantId] = useState(variants[0]?.id ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewState, setPreviewState] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const preview = previewState?.file === file ? previewState.url : '';

  const selectedVariant = variants.find((variant) => variant.id === variantId);

  useEffect(() => {
    const url = previewState?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [previewState]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!variantId) {
      setError('Add a color variant before uploading an image.');
      return;
    }

    if (!file) {
      setError('Choose an image first.');
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      setError('Choose a JPG, PNG, or WEBP image.');
      return;
    }

    startTransition(async () => {
      try {
        const uploaded = await uploadCloudinaryImage(file, product.id);

        const result = await saveVariantImage({
          productId: product.id,
          variantId,
          secureUrl: uploaded.secureUrl,
          publicId: uploaded.publicId,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setFile(null);
        setPreviewState(null);
        setMessage(result.message);
        router.refresh();
      } catch (cause) {
        console.error(cause);
        setError('Image upload failed. Please try again.');
      }
    });
  }

  function handleDelete() {
    if (!selectedVariant?.image) return;

    if (!window.confirm(`Remove the image for ${selectedVariant.color}?`)) {
      return;
    }

    setError('');
    setMessage('');

    startTransition(async () => {
      try {
        const result = await deleteVariantImage({
          productId: product.id,
          variantId,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setMessage(result.message);
        router.refresh();
      } catch (cause) {
        console.error(cause);
        setError('Could not remove this image.');
      }
    });
  }

  return (
    <div className="max-w-3xl p-6">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Manage Product</h1>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>

          <ChevronRight size={14} />
          <Link href="/admin/products" className="hover:text-blue-500">
            Product
          </Link>

          <ChevronRight size={14} />

          <span>Images</span>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-gray-800">
        Product Color Images
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        {product.name} — upload one image for each color.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-lg bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="variant" className="mb-2 block text-sm font-medium">
            Product color
          </label>

          <select
            id="variant"
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setFile(null);
              setError('');
              setMessage('');
            }}
            disabled={isPending || variants.length === 0}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {variants.length === 0 && (
              <option value="">No colors available</option>
            )}

            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.color}
              </option>
            ))}
          </select>
        </div>

        {selectedVariant?.image && !preview && (
          <div>
            <p className="mb-2 text-sm font-medium">
              Current {selectedVariant.color} image
            </p>

            <div className="relative aspect-square max-w-sm overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={selectedVariant.image.secureUrl}
                alt={`${product.name} - ${selectedVariant.color}`}
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="mt-3 inline-flex items-center gap-2 text-sm text-red-600 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Remove image
            </button>
          </div>
        )}

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-medium">
            {selectedVariant?.image
              ? 'Choose replacement image'
              : 'Upload image'}
          </label>

          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isPending || !variantId}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              setFile(selectedFile);
              setPreviewState(
                selectedFile
                  ? {
                      file: selectedFile,
                      url: URL.createObjectURL(selectedFile),
                    }
                  : null,
              );
              setError('');
              setMessage('');
            }}
            className="block w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>

        {preview && (
          <div className="relative aspect-square max-w-sm overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={preview}
              alt="Selected image preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending || !file || !variantId}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            'Saving image...'
          ) : (
            <>
              {selectedVariant?.image ? (
                <Check size={17} />
              ) : (
                <ImagePlus size={17} />
              )}
              {selectedVariant?.image ? 'Replace Image' : 'Save Image'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Color images</h2>

        <div className="mt-3 space-y-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                setVariantId(variant.id);
                setFile(null);
                setError('');
                setMessage('');
              }}
              className="flex w-full items-center justify-between rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50"
            >
              <span>{variant.color}</span>
              <span className="text-sm text-gray-500">
                {variant.image ? 'Image saved' : 'No image yet'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
