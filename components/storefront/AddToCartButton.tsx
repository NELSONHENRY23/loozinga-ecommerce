
"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "./CartProvider";

type Props = {
  product: {
    id: string;
    name: string;
    color: string;
    variantId: string | null;
    price: number;
    offer: number;
    image: string | null;
  };
};

export default function AddToCartButton({ product }: Props) {
  const { items, addItem } = useCart();

  // Check whether this exact color variant is already in the cart.
  const added = items.some(
    (item) =>
      item.id === product.id &&
      (product.variantId
        ? item.variantId === product.variantId
        : item.color === product.color),
  );

  function handleAdd() {
    addItem(product);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-gray-700"
    >
      {added ? (
        <>
          <Check size={20} />
          Added — Add Another
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Add to Cart
        </>
      )}
    </button>
  );
}
