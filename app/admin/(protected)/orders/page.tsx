import Link from 'next/link';
import { Eye } from 'lucide-react';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/app/db';
import { orders } from '@/app/db/schema';
import Pagination from '@/components/admin/Pagination';

export const dynamic = 'force-dynamic';

type OrdersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    status?: string | string[];
    payment?: string | string[];
  }>;
};

const pageSize = 10;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  // Read current page from URL
  const params = await searchParams;

  const search = typeof params.search === 'string' ? params.search.trim() : '';

  const status = typeof params.status === 'string' ? params.status : '';

  const payment = typeof params.payment === 'string' ? params.payment : '';

  const filter = and(
    search
      ? or(
          ilike(orders.orderNumber, `%${search}%`),
          ilike(orders.customerName, `%${search}%`),
          ilike(orders.email, `%${search}%`),
        )
      : undefined,

    status === 'Processing' ||
      status === 'Shipped' ||
      status === 'Delivered' ||
      status === 'Cancelled'
      ? eq(orders.orderStatus, status)
      : undefined,

    payment === 'Paid' || payment === 'Pending'
      ? eq(orders.paymentStatus, payment)
      : undefined,
  );

  const requestedPage = Number(params.page ?? 1);

  const validPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  // count all orders in the database
  const countResult = await db
    .select({ total: count() })
    .from(orders)
    .where(filter);
  const totalOrders = countResult[0].total ?? 0;

  // calculate the total number of pages
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  // Prevent requests beyond the last page.
  const currentPage = Math.min(validPage, totalPages);

  // calculate how many orders to skip
  const offset = (currentPage - 1) * pageSize;

  // List orders
  const orderList = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      email: orders.email,
      createdAt: orders.createdAt,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      orderStatus: orders.orderStatus,
    })
    .from(orders)
    .where(filter)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

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

      <form
        method="GET"
        className="mb-5 grid gap-3 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        {/* Search */}
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search order, customer, email..."
          className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />

        {/* Order Status */}
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
        >
          <option value="">All order statuses</option>

          <option value="Processing">Processing</option>

          <option value="Shipped">Shipped</option>

          <option value="Delivered">Delivered</option>

          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Payment Status */}
        <select
          name="payment"
          defaultValue={payment}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
        >
          <option value="">All payment statuses</option>

          <option value="Paid">Paid</option>

          <option value="Pending">Pending</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            Filter
          </button>

          <Link
            href="/admin/orders"
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </Link>
        </div>
      </form>

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
              {orderList.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orderList.map((order) => (
                  <tr key={order.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-4 align-middle font-medium text-gray-700">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div>
                        <p className="font-medium text-gray-700">
                          {order.customerName}
                        </p>

                        <p className="text-xs text-gray-400">{order.email}</p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 align-middle text-gray-600">
                      {order.createdAt.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 align-middle font-medium text-gray-700">
                      ${Number(order.total).toFixed(2)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Result Information */}
      <p className="mt-4 text-sm text-gray-500 text-center">
        Showing {orderList.length} of {totalOrders} orders
        {' · '}
        Page {currentPage} of {totalPages}
      </p>

      {/* Pagination UI */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/orders"
        queryParams={{
          search,
          status,
          payment,
        }}
      />
    </div>
  );
}
