import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { sql } from 'drizzle-orm';

import { db } from '@/app/db';
import { orders, profiles } from '@/app/db/schema';
import { createAdminClient } from '@/utils/superbase/admin';
import Pagination from '@/components/admin/Pagination';

export const dynamic = 'force-dynamic';

const pageSize = 10;
const authBatchSize = 1000;

type UsersPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
  }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;

  // Search Input
  const search = typeof params.search === 'string' ? params.search.trim() : '';

  const searchTerm = search.toLowerCase();

  // Validate requested page
  const requestedPage = Number(params.page ?? 1);

  const validPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  // Fetch all supabase Auth users in batches.
  // Search must run before page slicing
  const supabaseAdmin = createAdminClient();

  type AuthUser = NonNullable<
    Awaited<ReturnType<typeof supabaseAdmin.auth.admin.listUsers>>['data']
  >['users'][number];

  const authUsers: AuthUser[] = [];
  let authPage = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: authPage,
      perPage: authBatchSize,
    });

    if (error) {
      throw new Error(error.message);
    }

    const batch = data.users;
    authUsers.push(...batch);

    if (batch.length < authBatchSize) {
      break;
    }

    authPage++;
  }

  // Fetch user profiles
  const profileList = await db.select().from(profiles);

  // Group order statistics by user ID
  const orderStats = await db
    .select({
      userId: orders.userId,
      totalOrders: sql<number>`count(*)`,
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .groupBy(orders.userId);

  // Build lookup maps for efficient matching
  const profileMap = new Map(
    profileList.map((profile) => [profile.id, profile]),
  );

  const statsMap = new Map(orderStats.map((stats) => [stats.userId, stats]));

  // Combin Auth, Pofiles, and Orders
  const users = authUsers.map((authUser) => {
    const profile = profileMap.get(authUser.id);

    const stats = statsMap.get(authUser.id);

    return {
      id: authUser.id,
      name: profile?.name ?? 'User',
      email: authUser.email ?? '',
      phone: profile?.phone ?? '',
      role: profile?.role ?? 'User',
      joinedDate: authUser.created_at,
      totalOrders: Number(stats?.totalOrders ?? 0),
      totalSpent: Number(stats?.totalSpent ?? 0),
      status: authUser.banned_until ? 'Blocked' : 'Active',
    };
  });

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;

    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  // Pagination calculations
  const totalUsers = filteredUsers.length;

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  // Clamp the requested page
  const currentPage = Math.min(validPage, totalPages);

  const offset = (currentPage - 1) * pageSize;

  const paginatedUsers = filteredUsers.slice(offset, offset + pageSize);

  const start = totalPages === 0 ? 0 : offset + 1;
  const end = Math.min(offset + pageSize, totalUsers);

  return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Users</h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link href="/admin" className="transition hover:text-blue-500">
            Home
          </Link>

          <span>/</span>

          <span>Users</span>
        </div>
      </div>

      <section className="overflow-hidden rounded-md bg-white shadow-sm">
        {/* Header and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-700">User List</h2>

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
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">{user.name}</p>

                      <p className="mt-1 text-xs text-gray-400">{user.email}</p>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {user.phone || '-'}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                      {new Date(user.joinedDate).toLocaleDateString('en-US', {
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

      {/* Result Information */}
      <p className="mt-4 text-center text-sm text-gray-500">
        Showing {start}-{end} of {totalUsers} users
        {' · '}
        Page {currentPage} of {totalPages}
      </p>

      {/* Shared Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/admin/users"
        queryParams={{ search }}
      />
    </div>
  );
}
