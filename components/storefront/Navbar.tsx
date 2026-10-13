"use client";

import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";

import { useCart } from "./CartProvider";

export default function Navbar(){
    const { itemCount } = useCart();

    return(
        <header className="sticky top-0 z-100 w-full border-b border-gray-200 bg-white shadow-md">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
                <Link 
                   href="/"
                   className="flex items-center gap-2 font-bold text-xl text-gray-900"
                >
                    <Store size={24}/>
                    <span>Loozinga</span>
                </Link>

                <div className="flex items-center gap-5">
                   <Link 
                     href="/"
                     className="text-sm font-medium text-gray-700 hover:text-black"
                   >
                      Home
                   </Link>

                   <Link 
                     href="/account"
                     className="text-sm font-medium text-gray-700 hover:text-black"
                   >
                      Account
                   </Link>

                   <Link
            href="/cart"
            aria-label={`Shopping cart with ${itemCount} items`}
            className="relative text-gray-700 hover:text-black"
          >
            <ShoppingCart size={22} />

            {itemCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
                </div>
            </nav>

        </header>
    )
}