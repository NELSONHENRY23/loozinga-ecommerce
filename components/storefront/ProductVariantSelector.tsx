
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import ProductGallery from "@/components/storefront/ProductGallery";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import { getColorHex } from "@/utils/color-swatches";

type Variant = {
  id: string;
  color: string;
  image: {
    id: string;
    secureUrl: string;
    position: number;
  } | null;
  sizes: string[];
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
  };
  variants: Variant[];
  legacyImages: GalleryImage[];
  initialColor?: string;
};

export default function ProductVariantSelector({
  product,
  variants,
  legacyImages,
  initialColor = "",
}: Props) {
  const initialVariant = 
      variants.find(
        (variant) => variant.color.toLowerCase() === initialColor.toLowerCase(),
      ) ?? variants[0];
      
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.id ?? "",
  );

  const [selectedSize, setSelectedSize] = useState("");

  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );

  // Products without variants continue using their existing images.
  const images = selectedVariant
    ? selectedVariant.image
      ? [selectedVariant.image]
      : []
    : legacyImages;

  const selectedColor = selectedVariant?.color ?? '';
  const avaialbleSizes = selectedVariant?.sizes ?? [];

  function handleVariantChange(variantId: string){
    setSelectedVariantId(variantId);
    setSelectedSize("");
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Left: Product Gallery */}
      <div className="min-w-0">
        <ProductGallery
          key={selectedVariant?.id ?? 'legacy'}
          productName={`${product.name} - ${selectedColor}`}
          images={images}
        />
      </div>

      {/* Right: Product options */}
      <div className="min-w-0 space-x-7 lg:pt-4">
        
      {variants.length > 0 && (
        <>
        <div>
          <h2 className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-900">
            Color: 
            <span className="font-normal">{selectedColor}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const hex = getColorHex(variant.color);
              
              const lightColors = [
                "#FFFFFF",
                "#FFFDD0",
                "#D1D5DB",
                "#C0C0C0",
                "#87CEEB",
                "#E5E7EB",
              ]

              const isLight = lightColors.includes(hex.toUpperCase());
              return(
              <button
              key={variant.id}
              type="button"
              onClick={() => handleVariantChange(variant.id)}
              aria-label={`Select ${variant.color}`}
              aria-pressed={isSelected}
              title={variant.color}
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                isSelected
                  ? "border-gray-900"
                  : "border-transparent"
              }`}
            >
              <span
                className="flex h-full w-full items-center justify-center rounded-full border border-gray-300"
                style={{ backgroundColor: hex }}
              >
                {isSelected && (
                  <Check
                    size={18}
                    strokeWidth={3}
                    className={
                      isLight
                        ? "text-gray-900"
                        : "text-white"
                    }
                  />
                )}
              </span>
            </button>
              );
})}
          </div>

          {!selectedVariant?.image && (
            <p className="mt-2 text-sm text-amber-700">
              An image has not been added for this color yet.
            </p>
          )}
        </div>

        <div className="pt-5 sm:pt-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Available Sizes
          </h2>

          {
            avaialbleSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {
                  avaialbleSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                        selectedSize === size
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 bg-white hover:border-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))
                }
              </div>
            ):(
              <p className="text-sm text-gray-500">
              No sizes have been added for this color yet.
            </p>
            )
          }
        </div>
        </>
      )}

      <div className="pt-3 sm:pt-4">
      <AddToCartButton
      requiresSize={avaialbleSizes.length > 0}
        product={{
          id: product.id,
          name: product.name,
          color: selectedColor,
          variantId: selectedVariant?.id ?? null,
          size: selectedSize || null,
          price: product.price,
          offer: product.offer,
          image: images[0]?.secureUrl ?? null,
        }}
      />
      </div>
      </div>
    </div>
  );
}
