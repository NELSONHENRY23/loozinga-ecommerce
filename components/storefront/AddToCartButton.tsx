
"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "./CartProvider";

type Props = {
  product: {
    id: string;
    name: string;
    color: string;
    variantId: string | null;
    size: string | null;
    price: number;
    offer: number;
    image: string | null;
  };
  requiresSize: boolean;
};

export default function AddToCartButton({ product, requiresSize }: Props) {
  const { items, addItem, loaded } = useCart();

  const canAdd = product.variantId !== null && (!requiresSize || product.size !== null);

  // Check whether this exact color variant is already in the cart.
  const added = items.some(
    (item) =>
      item.id === product.id &&
     item.variantId === product.variantId &&
     item.color === product.color &&
      item.size === product.size,
  );

  function handleAdd() {
    if(!loaded ||!canAdd) return;
    addItem(product);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!loaded ||!canAdd}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {
      !loaded ? (
        "Loading Cart..."
      ):
      added ? (
        <>
          <Check size={20} />
          Added — Add Another
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          {canAdd ? "Add to Cart" : "Select a Size"}
        </>
      )}
    </button>
  );
}
