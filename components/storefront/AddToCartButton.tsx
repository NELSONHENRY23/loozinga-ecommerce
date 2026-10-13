"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

import { useCart } from "./CartProvider"; 

type Props = {
    product: {
        id: string;
        name: string;
        price: number;
        offer: number;
        image: string | null;
    }
}

export default function AddToCartButton({product,}: Props){
    const {addItem} = useCart();
    const [added, setAdded] = useState(false);

    function handleAdd(){
        addItem(product);
        setAdded(true);
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
    )
}