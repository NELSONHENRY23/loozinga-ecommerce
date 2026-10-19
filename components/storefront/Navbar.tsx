"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, Store, X } from "lucide-react";

import { useCart } from "./CartProvider";

export default function Navbar(){
    const { itemCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);

    function closeMenu(){
      setMenuOpen(false);
    }

    return(
        <header className="sticky top-0 z-100 w-full border-b border-gray-200 bg-white shadow-md">
            <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
               
                {/* Store Logo */}
                <Link 
                   href="/"
                   onClick={closeMenu}
                   className="flex shrink-0 items-center gap-2 font-bold text-xl text-gray-900"
                >
                    <Store size={24} aria-hidden="true"/>
                    <span>Loozinga</span>
                </Link>

                {/* Desktop navigation */}
                <div className="hidden sm:flex items-center gap-5">
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
            <ShoppingCart size={22} aria-hidden="true"/>

            {itemCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-5 sm:hidden">
            <Link 
              href="/cart"
              aria-label={`Shopping cart with ${itemCount} items`}
            className="relative text-gray-700"
            >
              <ShoppingCart size={22} aria-hidden="true" />

{itemCount > 0 && (
  <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
    {itemCount > 99 ? "99+" : itemCount}
  </span>
)}
            </Link>

            <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md p-1 text-gray-700 transition hover:bg-gray-100"
          >
            {menuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
            </nav>

            {/* Mobile navigation menu */}
      {menuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-5 py-3 sm:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col">
            <Link
              href="/"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/#products"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black"
            >
              Shop
            </Link>

            <Link
              href="/account"
              onClick={closeMenu}
              className="rounded-md px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black"
            >
              Account
            </Link>
          </div>
        </div>
      )}
      
        </header>
    )
}