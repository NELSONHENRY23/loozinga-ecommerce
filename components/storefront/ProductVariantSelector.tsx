
"use client";

import { useState } from "react";
import ProductGallery from "@/components/storefront/ProductGallery";
import AddToCartButton from "@/components/storefront/AddToCartButton";

type Variant = {
  id: string;
  color: string;
  image: {
    id: string;
    secureUrl: string;
    position: number;
  } | null;
};

type GalleryImage = {
  id: string;
  secureUrl: string;
  position: number;
};

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    offer: number;
    color: string;
  };
  variants: Variant[];
  legacyImages: GalleryImage[];
};

export default function ProductVariantSelector({
  product,
  variants,
  legacyImages,
}: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id ?? "",
  );

  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  // Products without variants continue using their existing images.
  const images = selectedVariant
    ? selectedVariant.image
      ? [selectedVariant.image]
      : []
    : legacyImages;

  const selectedColor = selectedVariant?.color ?? product.color;

  return (
    <div className="space-y-6">
      {variants.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold">
            Color: <span className="font-normal">{selectedColor}</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                aria-pressed={selectedVariantId === variant.id}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  selectedVariantId === variant.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white hover:border-gray-600"
                }`}
              >
                {variant.color}
              </button>
            ))}
          </div>

          {!selectedVariant?.image && (
            <p className="mt-2 text-sm text-amber-700">
              An image has not been added for this color yet.
            </p>
          )}
        </div>
      )}

      <ProductGallery
        productName={`${product.name} - ${selectedColor}`}
        images={images}
      />

      <AddToCartButton
        product={{
          id: product.id,
          name: product.name,
          color: selectedColor,
          variantId: selectedVariant?.id ?? null,
          price: product.price,
          offer: product.offer,
          image: images[0]?.secureUrl ?? null,
        }}
      />
    </div>
  );
}
