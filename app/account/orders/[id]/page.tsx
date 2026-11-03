import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { orderItems, orders } from '@/app/db/schema';
import { requireActiveCustomer } from '@/utils/superbase/require-active-customer';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import OrderStatusBadge from '@/components/storefront/OrderStatusBadge';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function CustomerOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await requireActiveCustomer();
  if (!uuidPattern.test(id)) notFound();

  // ownership check: the order must belong to the signed-in user.
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, user.id)))
    .limit(1);

  if (!order) notFound();

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      color: orderItems.color,
      size: orderItems.size,
      quantity: orderItems.quantity,
      price: orderItems.price,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <Link
          href="/account/orders"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to orders
        </Link>

        <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on{' '}
              {order.createdAt.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <OrderStatusBadge status={order.orderStatus} />
        </div>

        <div className="mb-6 grid gap-5 md:grid-cols-2">
          <section className="rounded bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-semibold">Shipping Address</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-800">{order.customerName}</p>
              <p>{order.street}</p>
              <p>
                {order.city}, {order.country}
              </p>
              <p>{order.phone}</p>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${
                    order.paymentStatus === 'Paid'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <h2 className="border-b border-gray-100 px-5 py-4 font-semibold">
            Items
          </h2>

          <div className="divide-y divide-gray-100">
            {
            items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500">
                No items were found for this order.
              </p>
            ) : (
            items.map((item) => {
              const unit = Number(item.price);

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
                >
                  <div>
                    {item.productId ? (
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium hover:underline"
                      >
                        {item.productName}
                      </Link>
                    ) : (
                      <p className="font-medium">{item.productName}</p>
                    )}

                    <p className="mt-1 text-sm text-gray-500">
                      {[
                        item.color && `Color: ${item.color}`,
                        item.size && `Size: ${item.size}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      ${unit.toFixed(2)} x {item.quantity}
                    </p>

                    <span className="font-semibold">
                      ${(unit * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            }))}
          </div>

          <div className="flex justify-between border-t border-gray-100 px-5 py-4 text-lg font-bold">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
