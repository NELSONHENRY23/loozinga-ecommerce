import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react';

import { db } from '@/app/db';
import { orderItems, orders } from '@/app/db/schema';

import OrderStatusForm from '@/components/admin/OrderStatus';

type OrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  // Get the order 
  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);

  const order = orderResult[0];

  if (!order) {
    notFound();
  }

  // Get all items belonging to this order
  const items = await db.select({
    id: orderItems.id,
    productId: orderItems.productId,
    productName: orderItems.productName,
    quantity: orderItems.quantity,
    price: orderItems.price,
  })
  .from(orderItems)
  .where(eq(orderItems.orderId, order.id));

  return (
    <div className="p-5">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Order Details
        </h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>

          <span>/</span>

          <Link
            href="/admin/orders"
            className="hover:text-blue-500"
          >
            Orders
          </Link>

          <span>/</span>

          <span>{order.orderNumber}</span>
        </div>
      </div>

      {/* Back button */}
      <Link
        href="/admin/orders"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-blue-500"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Order summary */}
      <section className="mb-5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Order</p>

            <h2 className="text-xl font-semibold text-gray-700">
              {order.orderNumber}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Placed on {' '} {order.createdAt.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              order.orderStatus === 'Delivered'
                ? 'bg-green-50 text-green-600'
                : order.orderStatus === 'Shipped'
                  ? 'bg-blue-50 text-blue-600'
                  : order.orderStatus === 'Cancelled'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-yellow-50 text-yellow-600'
            }`}
          >
            {order.orderStatus}
          </span>
        </div>

        <div className='w-full max-w-xs'>

          <OrderStatusForm orderId={order.id} currentStatus={order.orderStatus} />

        </div>
      </section>

      {/* Customer / Address / Payment */}
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        {/* Customer */}
        <section className="bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500" />

            <h2 className="font-semibold text-gray-700">
              Customer
            </h2>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-700">
              {order.customerName}
            </p>

            <p className="text-gray-500">{order.email}</p>

            <p className="text-gray-500">{order.phone}</p>
          </div>
        </section>

        {/* Shipping address */}
        <section className="bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" />

            <h2 className="font-semibold text-gray-700">
              Shipping Address
            </h2>
          </div>

          <div className="space-y-1 text-sm text-gray-500">
            <p>{order.street}</p>
            <p>{order.city}</p>
            <p>{order.country}</p>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-blue-500" />

            <h2 className="font-semibold text-gray-700">
              Payment
            </h2>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>

              <span className="font-medium text-gray-700">
                {order.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>

              <span
                className={
                  order.paymentStatus === 'Paid'
                    ? 'font-medium text-green-600'
                    : 'font-medium text-yellow-600'
                }
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Ordered items */}
      <section className="overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <Package size={18} className="text-blue-500" />

          <h2 className="font-semibold text-gray-700">
            Order Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3 text-right">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {
              items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-gray-400"
                  >
                    No order items found.
                  </td>
                </tr>
              ) : (
              items.map((item) => {
                const price = Number(item.price)
                const subtotal = price * item.quantity;

                return (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-medium text-gray-700">
                    {item.productName}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    ${price.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-right font-medium text-gray-700">
                    ${subtotal.toFixed(2)}
                  </td>
                </tr>
                )
}))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end border-t border-gray-100 p-5">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="font-semibold text-gray-700">
                Total
              </span>

              <span className="text-lg font-semibold text-gray-700">
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}