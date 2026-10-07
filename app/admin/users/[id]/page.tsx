import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq, sql } from 'drizzle-orm';

import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CalendarDays,
  ShoppingBag,
  Wallet,
} from 'lucide-react';

import { db } from '@/app/db';
import { orders, profiles } from '@/app/db/schema';
import { createAdminClient } from '@/utils/superbase/admin';

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  const supabaseAdmin = createAdminClient();

  const {
    data: authData,
    error: authError,
  } = await supabaseAdmin.auth.admin.getUserById(id);

  if (authError || !authData.user) {
    notFound();
  }

  const authUser = authData.user;

  const profileResult = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, authUser.id))
    .limit(1);

  const profile = profileResult[0];

  const userEmail = authUser.email ?? '';

  const orderStatsResult = await db
    .select({
      totalOrders: sql<number>`count(*)`,
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(eq(orders.email, userEmail));

  const orderStats = orderStatsResult[0];

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      orderStatus: orders.orderStatus,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.email, userEmail))
    .orderBy(sql`${orders.createdAt} desc`)
    .limit(5);

  const name =
    profile?.name ?? 'User';

  const phone =
    profile?.phone ?? '';

  const role =
    profile?.role ?? 'User';

  const status =
    authUser.banned_until
      ? 'Blocked'
      : 'Active';

  const totalOrders =
    Number(orderStats?.totalOrders ?? 0);

  const totalSpent =
    Number(orderStats?.totalSpent ?? 0);

  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          User Details
        </h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link
            href="/admin"
            className="transition hover:text-blue-500"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/admin/users"
            className="transition hover:text-blue-500"
          >
            Users
          </Link>

          <span>/</span>

          <span>{name}</span>
        </div>
      </div>

      {/* Back */}
      <Link
        href="/admin/users"
        className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-blue-500"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      {/* User summary */}
      <section className="mb-5 rounded-md bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <User size={26} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                {name}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {role}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === 'Active'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {status}
          </span>
        </div>
      </section>

      {/* Information cards */}
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        {/* Contact */}
        <section className="rounded-md bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-700">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail
                size={17}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Email
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {userEmail || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone
                size={17}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {phone || '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="rounded-md bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-700">
            Account Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarDays
                size={17}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Joined
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {new Date(
                    authUser.created_at,
                  ).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Account Status
              </p>

              <p className="mt-1 text-sm font-medium text-gray-600">
                {status}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Role
              </p>

              <p className="mt-1 text-sm font-medium text-gray-600">
                {role}
              </p>
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="rounded-md bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-700">
            Activity
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShoppingBag
                size={17}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Total Orders
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {totalOrders}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Wallet
                size={17}
                className="mt-0.5 text-gray-400"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Total Spent
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Orders */}
      <section className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-700">
            Recent Orders
          </h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <ShoppingBag
              size={30}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-sm text-gray-400">
              No orders found for this user.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">
                    Order
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>

                  <th className="px-5 py-3">
                    Total
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {order.orderNumber}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {order.createdAt.toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      ${Number(order.total).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {order.orderStatus}
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}