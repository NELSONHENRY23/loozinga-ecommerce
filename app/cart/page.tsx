
"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import Navbar from "@/components/storefront/Navbar";
import { useCart } from "@/components/storefront/CartProvider";

export default function CartPage(){
    const {
        items,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
    } = useCart();

    return (

    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="mb-8 text-3xl font-bold">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              Your cart is empty
            </h2>

            <p className="mt-3 text-gray-500">
              Discover something you love.
            </p>

            <Link
              href="/#products"
              className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const unitPrice =
                  item.price *
                  (1 - item.offer / 100);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm sm:flex-row"
                  >
                    <Link
                      href={`/products/${item.id}`}
                      className="relative block aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 128px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-gray-400">
                          No image
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-semibold hover:underline"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-2 font-bold">
                          ${unitPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            className="p-3 hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-10 text-center">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={item.quantity >= 99}
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            className="p-3 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={17} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Clear Cart
              </button>
            </section>

            <aside className="rounded-xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="mb-6 text-xl font-bold">
                Order Summary
              </h2>

              <div className="flex justify-between text-gray-600">
                <span>Items ({itemCount})</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="mt-5 flex justify-between border-t border-gray-200 pt-5 text-lg font-bold">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Shipping and any applicable taxes will
                be calculated at checkout.
              </p>

              <div className="mt-6 rounded-lg bg-gray-100 p-4 text-center text-sm text-gray-600">
                Checkout coming in Phase 4
              </div>

              <Link
                href="/#products"
                className="mt-4 block text-center text-sm font-medium text-gray-700 hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}