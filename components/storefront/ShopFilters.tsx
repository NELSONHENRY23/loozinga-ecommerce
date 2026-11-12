'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Category = {
  id: number;
  name: string;
};

type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc';

type ShopFiltersProps = {
  categories: Category[];
  search: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort: SortOption;
  colors: string[];
  sizes: string[];
  selectedColor: string;
  selectedSize: string;
};

type FilterFieldsProps = Pick<
  ShopFiltersProps,
  | 'categories'
  | 'categoryId'
  | 'minPrice'
  | 'maxPrice'
  | 'colors'
  | 'sizes'
  | 'selectedColor'
  | 'selectedSize'
> & {
  // FilterFields is used by both layouts, so their control IDs must be unique.
  idPrefix: 'desktop' | 'mobile';
};

function FilterFields({
  idPrefix,
  categories,
  categoryId,
  minPrice,
  maxPrice,
  colors,
  sizes,
  selectedColor,
  selectedSize,
}: FilterFieldsProps) {
  return (
    <>
      <div>
        <label
          htmlFor={`${idPrefix}-shop-category`}
          className="mb-2 block text-sm font-medium"
        >
          Category
        </label>

        <select
          id={`${idPrefix}-shop-category`}
          name="category"
          defaultValue={categoryId ?? ''}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Price range</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${idPrefix}-shop-min-price`}
              className="mb-2 block text-sm"
            >
              Min price
            </label>

            <input
              id={`${idPrefix}-shop-min-price`}
              type="number"
              name="minPrice"
              min="0"
              step="0.01"
              defaultValue={minPrice}
              placeholder="0.00"
              className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-shop-max-price`}
              className="mb-2 block text-sm"
            >
              Max price
            </label>

            <input
              id={`${idPrefix}-shop-max-price`}
              type="number"
              name="maxPrice"
              min="0"
              step="0.01"
              defaultValue={maxPrice}
              placeholder="Any"
              className="w-full min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-shop-color`}
          className="mb-2 block text-sm font-medium"
        >
          Color
        </label>

        <select
          name="color"
          id={`${idPrefix}-shop-color`}
          defaultValue={selectedColor}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
        >
          <option value="">All colors</option>
          {colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-shop-size`}
          className="mb-2 block text-sm font-medium"
        >
          Size
        </label>

        <select
          name="size"
          id={`${idPrefix}-shop-size`}
          defaultValue={selectedSize}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
        >
          <option value="">All sizes</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

export default function ShopFilters({
  categories,
  search,
  categoryId,
  minPrice,
  maxPrice,
  sort,
  colors,
  sizes,
  selectedColor,
  selectedSize,
}: ShopFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile filter trigger */}
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="mobile-shop-filters"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-5 py-3.5 font-medium transition-colors hover:bg-gray-50"
        >
          <span aria-hidden="true">☰</span>
          Filters
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <aside
            id="mobile-shop-filters"
            role="dialog"
            aria-modal="true"
            aria-label="Shop filters"
            className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">Filters</h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close filters"
                className="rounded-lg px-3 py-2 text-xl"
              >
                ×
              </button>
            </div>

            <form
              action="/shop"
              method="GET"
              className="flex min-h-0 flex-1 flex-col"
            >
              <input type="hidden" name="sort" value={sort} />

              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                <input type="hidden" name="q" value={search} />

                <FilterFields
                  idPrefix="mobile"
                  categories={categories}
                  categoryId={categoryId}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  colors={colors}
                  sizes={sizes}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                />
              </div>

              <div className="space-y-3 border-t bg-white p-5">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white"
                >
                  Apply Filters
                </button>

                <Link
                  href="/shop"
                  className="block rounded-lg border px-5 py-3 text-center font-medium"
                >
                  Clear Filters
                </Link>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <form
          action="/shop"
          method="GET"
          className="sticky top-24 space-y-6 rounded-xl border border-gray-200 bg-white p-5"
        >
          <input type="hidden" name="sort" value={sort} />

          <h2 className="text-xl font-bold">Filter Products</h2>

          <input type="hidden" name="q" value={search} />

          <FilterFields
            idPrefix="desktop"
            categories={categories}
            categoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            colors={colors}
            sizes={sizes}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700"
            >
              Apply Filters
            </button>

            <Link
              href="/shop"
              className="block rounded-lg border border-gray-300 px-5 py-3 text-center font-medium transition hover:bg-gray-50"
            >
              Clear Filters
            </Link>
          </div>
        </form>
      </aside>
    </>
  );
}
