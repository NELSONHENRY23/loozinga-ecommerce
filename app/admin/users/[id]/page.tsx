import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    CalendarDays,
    ShoppingBag,
    Wallet,
} from 'lucide-react';

import { users } from '@/data/users';

type UserDetailsPageProps = {
    params: Promise<{id: string;}>;
}

export default async function UserDetailsPage({params,}: UserDetailsPageProps){
    const { id } = await params;

    const user = users.find(
        (user) => user.id === Number(id)
    )

    if(!user){notFound();}

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
  
            <span>{user.name}</span>
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
              {/* Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <User size={26} />
              </div>
  
              <div>
                <h2 className="text-lg font-semibold text-gray-700">
                  {user.name}
                </h2>
  
                <p className="mt-1 text-sm text-gray-400">
                  User #{user.id}
                </p>
              </div>
            </div>
  
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                user.status === 'Active'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {user.status}
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
                    {user.email}
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
                    {user.phone}
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
                    {user.joinedDate}
                  </p>
                </div>
              </div>
  
              <div>
                <p className="text-xs text-gray-400">
                  Account Status
                </p>
  
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {user.status}
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
                    {user.totalOrders}
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
                    ${user.totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
  
        {/* Orders */}
        <section className="overflow-hidden rounded-md bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-700">
              Recent Orders
            </h2>
          </div>
  
          <div className="px-5 py-10 text-center">
            <ShoppingBag
              size={30}
              className="mx-auto mb-3 text-gray-300"
            />
  
            <p className="text-sm text-gray-400">
              This user&apos;s orders will appear here when we
              connect the backend.
            </p>
          </div>
        </section>
      </div>
    )
}