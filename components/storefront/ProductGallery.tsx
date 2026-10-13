
"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  secureUrl: string;
  position: number;
};

type ProductGalleryProps = {
  productName: string;
  images: GalleryImage[];
};

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  return (
    <div className="min-w-0 space-y-4">
      <div className="relative isolate aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
        {selectedImage ? (
          <Image
            src={selectedImage.secureUrl}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            fill
            priority
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={selectedIndex === index}
              className={`relative isolate aspect-square overflow-hidden rounded-lg border-2 transition ${
                selectedIndex === index
                  ? "border-gray-900"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image
                src={image.secureUrl}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
