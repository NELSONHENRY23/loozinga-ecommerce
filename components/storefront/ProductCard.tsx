import Link from 'next/link';
import Image from 'next/image';

import { getColorHex } from '@/utils/color-swatches';

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    offer: number;
    categoryName: string | null;
    mainImage: string | null;
    colors?: string[];
  };
  selectedColor?: string;
};

export default function ProductCard({
  product,
  selectedColor = '',
}: ProductCardProps) {
  const hasOffer = product.offer > 0 && product.offer <= 100;

  const discountedPrice = hasOffer
    ? product.price * (1 - product.offer / 100)
    : product.price;

  const productUrl = selectedColor
    ? `/products/${product.id}?color=${encodeURIComponent(selectedColor)}`
    : `/products/${product.id}`;

  return (
    <Link
      href={productUrl}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
    >
      {' '}
      <div className="relative aspect-square bg-gray-100">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}

        {hasOffer && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            -{product.offer}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {product.categoryName ?? 'Uncategorized'}
        </p>

        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-900 sm:text-base">
          {product.name}
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <span className="text-base font-bold text-gray-900 sm:text-lg">
            ${discountedPrice.toFixed(2)}
          </span>

          {hasOffer && (
            <span className="text-sm text-gray-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-xs text-gray-500">Available colors</p>

            <div className="flex flex-wrap items-center gap-2">
              {product.colors.map((color) => {
                const isSelected = 
                      selectedColor.toLowerCase() === color.toLowerCase();

                return (
                  <span
                    key={color}
                    title={color}
                    aria-label={color}
                    className={`inline-block h-5 w-5 rounded-full border border-gray-300 transition 
                      ${
                        isSelected
                          ? 'ring-2 ring-gray-900 ring-offset-2'
                          : 'ring-1 ring-gray-100'
                      }
                      `}
                    style={{ backgroundColor: getColorHex(color) }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
