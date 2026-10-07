import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { eq, sql } from 'drizzle-orm';

import { db } from "@/app/db";
import { orders, profiles  } from "@/app/db/schema";
import { createAdminClient } from "@/utils/superbase/admin";

type UsersPageProps = {
  searchParams: Promise<{search?: string;}>;
};

export default async function UsersPage({searchParams}: UsersPageProps){
  const params = await searchParams;

  const search = typeof params.search === 'string' ? params.search.trim().toLowerCase() : '';

  const supabaseAdmin = createAdminClient();

  
  const {
    data: authData,
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }
  
  const authUsers = authData.users;

  const profileList = await db
    .select()
    .from(profiles);

  const orderStats = await db
    .select({
      email: orders.email,
      totalOrders: sql<number>`count(*)`,
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .groupBy(orders.email);

  const users = authUsers.map((authUser) => {
    const profile = profileList.find(
      (profile) => profile.id === authUser.id,
    );

    const stats = orderStats.find(
      (stat) =>
        stat.email.toLowerCase() ===
        authUser.email?.toLowerCase(),
    );

    return {
      id: authUser.id,
      name: profile?.name ?? 'User',
      email: authUser.email ?? '',
      phone: profile?.phone ?? '',
      role: profile?.role ?? 'User',
      joinedDate: authUser.created_at,
      totalOrders: Number(stats?.totalOrders ?? 0),
      totalSpent: Number(stats?.totalSpent ?? 0),
      status:
        authUser.banned_until
          ? 'Blocked'
          : 'Active',
    };
  });

  const filteredUsers = users.filter((user) => {
    if (!search) return true;

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });
  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Users
        </h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link
            href="/admin"
            className="transition hover:text-blue-500"
          >
            Home
          </Link>

          <span>/</span>

          <span>Users</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-md bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-700">
            User List
          </h2>

          <form method="GET">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search users..."
                className="w-64 rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-400"
              />
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spent</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">
                        {user.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {user.phone || '-'}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {new Date(
                        user.joinedDate,
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {user.totalOrders}
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      ${user.totalSpent.toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-md p-2 text-blue-500 transition hover:bg-blue-50"
                          title="View user"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}