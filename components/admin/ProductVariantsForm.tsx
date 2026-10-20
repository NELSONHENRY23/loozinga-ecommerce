'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus } from 'lucide-react';

import {
  addProductVariant,
  saveProductVariantSizes,
} from '@/app/admin/(protected)/products/variant-actions';

type Variant = {
  id: string;
  color: string;
  sizes: string[];
};

type VariantStatus = {
  pending: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

type Props = {
  productId: string;
  variants: Variant[];
};

export default function ProductVariantsForm({ productId, variants }: Props) {
  const router = useRouter();

  const [color, setColor] = useState('');
  const [sizeDrafts, setSizeDrafts] = useState<Record<string, string[]>>(
    () => Object.fromEntries(
      variants.map((variant) => [variant.id, variant.sizes]),
    )
  ) 

  const [savedSizes, setSavedSizes] = useState<Record<string, string[]>>(
    () => Object.fromEntries(
      variants.map((variant) => [variant.id, variant.sizes]),
    ),
  );

  const [newSizeInputs, setNewSizeInputs] = useState<Record<string, string>>(
    {},
  )
  const [variantStatuses, setVariantStatuses] = useState<Record<string, VariantStatus>>({});
  const [isAddingColor, setIsAddingColor] = useState(false);
const [addColorMessage, setAddColorMessage] = useState('');

  function setVariantStatus(variantId: string, status: VariantStatus){
    setVariantStatuses((current) => ({...current, [variantId]: status}));
  }

  function addSize(variant: Variant){
    const size = (newSizeInputs[variant.id] ?? '').trim();

    if(!size){
      setVariantStatus(variant.id, {
        pending: false,
        message: 'Enter a size first.',
        type: 'error',
      });
      return;
    }

    const currentSizes = sizeDrafts[variant.id] ?? variant.sizes;

    if(currentSizes.some(
      (existing) => existing.toLowerCase() === size.toLowerCase(),
    )){
      setVariantStatus(variant.id, {
        pending: false,
        message: `Size ${size} already exists`,
        type: 'error',
      });
      return;
    }

    if(currentSizes.length >= 30){
      setVariantStatus(variant.id, {
        pending: false,
        message: 'A color can have at mostt 30 sizes.',
        type: 'error',
      });

      return;
    }

    setSizeDrafts((current) => ({...current, [variant.id]: [...(current[variant.id] ?? variant.sizes), size],
    }));

    setNewSizeInputs((current) => ({
      ...current, [variant.id]: '',
    }
  ));

  setVariantStatus(variant.id, {
    pending: false,
    message: `Size ${size} added. Save to apply your changes.`,
    type: 'info',
  })
  }

  function removeSize(variant: Variant, sizeToRemove: string){
    setSizeDrafts((current) => ({
      ...current,
      [variant.id]: (current[variant.id] ?? variant.sizes).filter(
        (size) => size !== sizeToRemove,
      ) 
    }));

    setVariantStatus(variant.id, {
      pending: false,
      message: `Size ${sizeToRemove} removed from the draft Save to apply changes.`,
      type: 'info',
    });
  }

  async function handleSaveSizes(variant:Variant) {
    const sizes = sizeDrafts[variant.id] ?? variant.sizes;
    const previouslySaved = savedSizes[variant.id] ?? variant.sizes;

    const unchanged = 
          sizes.length === previouslySaved.length &&
          sizes.every(
            (size, index) => size.toLowerCase() === previouslySaved[index].toLowerCase(),
          );

    if(unchanged){
      setVariantStatus(variant.id, {
        pending: false,
        message: 'No changes to save. Add or remove a size first.',
        type: 'info',
      });
      return;
    }

    setVariantStatus(variant.id, {
      pending: true,
      message: '',
      type: 'info',
    });

    try {
      const result = await saveProductVariantSizes({
        productId,
        variantId: variant.id,
        sizes,
      });

      setVariantStatus(variant.id, {
        pending: false,
        message: result.message,
        type: result.success ? 'success' : 'error',
      });

      if(result.success){
        setSavedSizes((current) => ({
          ...current,
          [variant.id]: [...sizes],
        }));

        router.refresh();
      }
    } catch {
      setVariantStatus(variant.id, {
        pending: true,
        message: 'Failed to save sizes. Please try again.',
        type: 'error',
      })
    }
  }

  async function handleAddColor(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddColorMessage('');

    if(!color.trim()){
      setAddColorMessage('Enter a color name first.');
      return;
    }

    setIsAddingColor(true);

    try {
      const result = await addProductVariant({
        productId,
        color,
      });

      setAddColorMessage(result.message);

      if(result.success){
        setColor('');
        router.refresh();
      }
    } catch {
      setAddColorMessage('Failed to add color. Please try again.')
    }finally{
      setIsAddingColor(false);
    }
  }
 
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Colors and Sizes</h2>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">No colors added yet.</p>
        ) : (
          <div className="space-y-5">
            {variants.map((variant) => {
              const sizes = sizeDrafts[variant.id] ?? variant.sizes;
              const status = variantStatuses[variant.id];

            return (
              <div
                key={variant.id}
                className="rounded-lg border border-gray-200 p-3"
              >
                <h3 className="font-semibold text-gray-800">{variant.color}</h3>

                <p
                  className="mb-3 mt-3 text-sm font-medium text-gray-700"
                >
                  Available Sizes
                </p>

                {
                  sizes.length == 0 ? 
                  (
                    <p className="text-sm text-gray-500">
                      No sizes added yet.
                    </p>
                  )
                  :
                  (
                    <div className="flex flex-wrap gap-2">
                        {
                          sizes.map((size) => (
                            <span
                             key={size}
                             className='group inline-flex items-center gap-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800'
                             >
                              {size}

                              <button
                                type='button'
                                aria-label={`Remove size ${size} from ${variant.color}`}
                                title={`Remove ${size}`}
                                onClick={() => removeSize(variant, size)}
                                disabled={Boolean(status?.pending)}
                                className='ml-1 rounded p-0.5 text-gray-400 opacity-0 transition hover:bg-red-600 focus:opacity-100 focus:ring-2 focus:ring-red-500 group-hover:opacity-100 disabled:cursor-not-allowed'
                              >
                                <X size={14}/>
                              </button>
                            </span>
                          ))
                        }
                    </div>
                  )
                }

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                <input
                  type="text"
                  value={newSizeInputs[variant.id] ?? ''}
                  onChange={(event) =>
                    setNewSizeInputs((current) => ({
                      ...current,
                      [variant.id]: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => {
                    if(event.key === 'Enter'){
                      event.preventDefault();
                      addSize(variant);
                    }
                  }}
                  placeholder="Enter a size, e.g. 45 or XL"
                  maxLength={50}
                  disabled={Boolean(status?.pending) || sizes.length >= 30}
                  aria-label={`New size for ${variant.color}`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:flex-1"
                />

                <button
                  type="button"
                  onClick={() => addSize(variant)}
                  disabled={Boolean(status?.pending) || sizes.length >= 30 || !(newSizeInputs[variant.id] ?? '').trim() }
                  className="inline-flex flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16}/>
                  Add Size
                </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveSizes(variant)}
                  disabled={Boolean(status?.pending)}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {
                    status?.pending ? 'Saving..' : 'Save sizes'
                  }
                </button>

                {
                  status?.message && (
                    <p 
                      role='status'
                      aria-live='polite'
                      className={`mt-3 text-sm ${
                        status.type === 'success' 
                        ? 'text-green-700'
                        : status.type === 'error'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      
                      }`}
                    >
                      {status.message}
                    </p>
                  )
                }

              </div>
              );
})}
          </div>
        )}

      </section>

      <form onSubmit={handleAddColor} className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add New Color</h2>

        <label htmlFor="color" className="mb-2 block text-sm font-medium">
          Color Name
        </label>

        <input
          id="color"
          type="text"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          placeholder="e.g. Red"
          maxLength={100}
          required
          disabled={isAddingColor}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        />

        <button
          type="submit"
          disabled={isAddingColor || !color.trim()}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isAddingColor ? 'Adding...' : 'Add Color'}
        </button>

        {
        addColorMessage && (
          <p role="status" aria-live='polite' className={`mt-3 text-sm
            ${addColorMessage.toLowerCase().includes('successfully')
              ? 'text-green-700'
              : 'text-red-600'

            }
          `}>
            {addColorMessage}
          </p>
        )}
      </form>
    </div>
  );
}
