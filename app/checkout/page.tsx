'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/storefront/Navbar';
import { useCart } from '@/components/storefront/CartProvider';
import { placeOrder } from './actions';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || items.length === 0) return;

    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    setError('');

    try {
      const result = await placeOrder({
        customerName: String(form.get('customerName') ?? ''),
        phone: String(form.get('phone') ?? ''),
        street: String(form.get('street') ?? ''),
        city: String(form.get('city') ?? ''),
        country: String(form.get('country') ?? ''),
        items: items.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (!result.success || !result.orderId) {
        setError(result.message);
        return;
      }

      clearCart();
      router.replace(`/checkout/success/${result.orderId}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center">
            <p>Your shopping cart is empty</p>

            <Link
              href="/cart"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Return to Cart
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-xl bg-white p-6 shadow-sm lg:col-span-2"
            >
              <h2 className="text-xl font-semibold">Shipping Information</h2>

              <div>
                <label
                  htmlFor="customerName"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  required
                  min={2}
                  max={150}
                  autoComplete="name"
                  className="form-input"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  min={5}
                  max={50}
                  autoComplete="tel"
                  className="form-input"
                />
              </div>

              <div>
                <label
                  htmlFor="street"
                  className="mb-2 block text-sm font-medium"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  required
                  min={5}
                  max={250}
                  autoComplete="street-address"
                  className="form-input"
                />
              </div>

              <div className="grid gap-4 sm: grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    min={2}
                    max={100}
                    autoComplete="address-level2"
                    className="form-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="mb-2 block text-sm font-medium"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    min={2}
                    max={100}
                    autoComplete="country-name"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold">Payment Method</h3>

                <p className="mt-2 text-sm text-gray-600">
                  Cash on Delivery (COD)
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gray-900 px-6 py-4 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500">
                You must be signed in with a customer account to place an order.
              </p>
            </form>

            <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => {
                  const price = item.price * (1 - item.offer / 100);

                  return (
                    <div
                      key={`${item.id}-${item.variantId ?? item.color}`}
                      className="flex justify-between gap-4 text-sm"
                    >
                        <div>
                            <p>{item.name} x {item.quantity}</p>
                        
                        <p className='mt-1 text-xs text-gray-500'>

                            Color: {item.color || '-'}
                        </p>
                        </div>

                        <span className="font-medium">
                        $
                        {(
                          (Math.round(price * 100) / 100) *
                          item.quantity
                        ).toFixed(2)}
                      </span> 
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-between border-t pt-5 font-bold">
                <span>Estimated Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Final product prices are verified when your order is submitted.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
