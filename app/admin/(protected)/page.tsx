import Link from 'next/link';

import {
  Boxes,
  ShoppingCart,
  Users,
  Wallet,
  Eye,
  TrendingUp,
  BadgeCheck,
  Clock3,
} from 'lucide-react';

import { count, desc, eq, sql } from 'drizzle-orm';

import { db } from '@/app/db';
import { orders, products, profiles } from '@/app/db/schema';

import StatCard from '@/components/admin/StatCard';
import { requireAdmin } from '@/utils/superbase/require-admin';

export const dynamic = 'force-dynamic';

const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

export default async function AdminDashboardPage() {
  await requireAdmin();

  const orderStatsResult = await db
    .select({
      totalOrders: count(),
      gross: sql<string>`
        coalesce(
          sum(${orders.total}) filter (
            where ${orders.orderStatus} <> 'Cancelled'
          ),
          0
        )
      `,
      paid: sql<string>`
        coalesce(
          sum(${orders.total}) filter (
            where ${orders.orderStatus} <> 'Cancelled'
              and ${orders.paymentStatus} = 'Paid'
          ),
          0
        )
      `,
      pending: sql<string>`
        coalesce(
          sum(${orders.total}) filter (
            where ${orders.orderStatus} <> 'Cancelled'
              and ${orders.paymentStatus} = 'Pending'
          ),
          0
        )
      `,
    })
    .from(orders);
  const [productCountResult] = await db
    .select({ total: count() })
    .from(products);
  const [customerCountResult] = await db
    .select({ total: count() })
    .from(profiles)
    .where(eq(profiles.role, 'Customer'));
  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      city: orders.city,
      country: orders.country,
      total: orders.total,
      paymentStatus: orders.paymentStatus,
      orderStatus: orders.orderStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt), desc(orders.id))
    .limit(5);
  const orderStats = orderStatsResult[0];
  const totalOrders = orderStats?.totalOrders ?? 0;
  const grossOrderValue = Number(orderStats?.gross ?? 0);
  const paidRevenue = Number(orderStats?.paid ?? 0);
  const outstandingPayments = Number(orderStats?.pending ?? 0);
  const totalProducts = productCountResult?.total ?? 0;
  const totalCustomers = customerCountResult?.total ?? 0;

  const stats = [
    {
      title: 'Orders',
      value: totalOrders,
      color: 'bg-[#2784c7]',
      icon: ShoppingCart,
    },
    {
      title: 'Paid Revenue',
      value: formatMoney(paidRevenue),
      color: 'bg-[#f0a43c]',
      icon: Wallet,
    },
    {
      title: 'Customers',
      value: totalCustomers,
      color: 'bg-[#1a2732]',
      icon: Users,
    },
    {
      title: 'Products',
      value: totalProducts,
      color: 'bg-[#26c281]',
      icon: Boxes,
    },
  ];

  const financialStats = [
    {
      title: 'Gross Order Value',
      value: formatMoney(grossOrderValue),
      description: 'Non-cancelled orders',
      icon: TrendingUp,
      iconStyle: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Paid Revenue',
      value: formatMoney(paidRevenue),
      description: 'Paid, non-cancelled orders',
      icon: BadgeCheck,
      iconStyle: 'bg-green-50 text-green-600',
    },
    {
      title: 'Outstanding Payments',
      value: formatMoney(outstandingPayments),
      description: 'Pending, non-cancelled orders',
      icon: Clock3,
      iconStyle: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>

        {/* Main statistics */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Sales Overview */}
        <section className="mt-7">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Sales Overview
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {financialStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-md border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.iconStyle}`}
                    >
                      <Icon size={23} strokeWidth={1.8} />
                    </div>
                  </div>

                  <p className="mt-3 text-2xl font-semibold text-gray-700">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Orders */}
        <section
          id="orders"
          className="mt-7 overflow-hidden bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Recent Orders
            </h2>

            <Link
              href="/admin/orders"
              className="text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-700">
                          {order.orderNumber}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-700">
                            {order.customerName}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {order.city}, {order.country}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {order.createdAt.toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-700">
                          {formatMoney(Number(order.total))}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              order.paymentStatus === 'Paid'
                                ? 'text-green-600'
                                : 'text-yellow-600'
                            }
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
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

                        <td className="px-5 py-4 text-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex rounded-md p-2 text-blue-500 transition hover:bg-blue-50"
                            title="View order"
                          >
                            <Eye size={18} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 text-center">
          <Link
            href="/admin/orders"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Showing the latest 5 orders · View all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
