
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { addProductVariant } from
  '@/app/admin/(protected)/products/variant-actions';

type Variant = {
  id: string;
  color: string;
};

type Props = {
  productId: string;
  variants: Variant[];
};

export default function ProductVariantsForm({
  productId,
  variants,
}: Props) {
  const router = useRouter();

  const [color, setColor] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    startTransition(async () => {
      const result = await addProductVariant({
        productId,
        color,
      });

      setMessage(result.message);

      if (result.success) {
        setColor('');
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Available Colors
        </h2>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">
            No colors added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-lg border border-gray-200 p-3"
              >
                {variant.color}
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-lg bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">
          Add New Color
        </h2>

        <label
          htmlFor="color"
          className="mb-2 block text-sm font-medium"
        >
          Color Name
        </label>

        <input
          id="color"
          type="text"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          placeholder="e.g. Black"
          maxLength={100}
          required
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={isPending || !color.trim()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Adding...' : 'Add Color'}
        </button>

        {message && (
          <p role="status" className="mt-3 text-sm">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
