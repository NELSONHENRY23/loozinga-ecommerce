import Link from 'next/link';
import { Eye } from 'lucide-react';
import { orders } from '@/data/orders';

export default function OrdersPage() {
  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Orders</h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-blue-500">
            Home
          </Link>
          <span>/</span>
          <span>Orders</span>
        </div>
      </div>

      {/* Orders Table */}
      <section className="overflow-hidden bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semi-bold text-gray-700">Order List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">Order Id</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-4 align-middle font-medium text-gray-700">
                    {order.id}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div>
                      <p className="font-medium text-gray-700">
                        {order.customer}
                      </p>

                      <p className="text-xs text-gray-400">{order.email}</p>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle text-gray-600">
                    {order.date}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle font-medium text-gray-700">
                    ${order.total.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="space-y-1">
                      <p className="text-gray-600">{order.paymentMethod}</p>

                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <div className="flex justify-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-md p-2 text-blue-500 transition"
                        title="View order"
                      >
                        <Eye size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
