'use client'

import { useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";

import { users } from '@/data/users';

export default function UsersPage(){
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredUsers = users.filter((user) => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
            const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

            return matchesSearch && matchesStatus;
    });

    return(
        <div className="p-5">
               {/* Page heading */}
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
      
      {/* Users panel */}
      <section className="overflow-hidden rounded-md bg-white shadow-sm">
        {/* Panel heading + filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-700">
            User List
          </h2>

          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search users..."
                className="w-64 rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-blue-400"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none transition focus:border-blue-400"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">
                  Joined
                </th>
                <th className="px-5 py-3">
                  Orders
                </th>
                <th className="px-5 py-3">
                  Total Spent
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">
                        {user.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {user.email}
                      </p>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-gray-500">
                      {user.phone}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-gray-500">
                      {user.joinedDate}
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-4 text-gray-500">
                      {user.totalOrders}
                    </td>

                    {/* Total spent */}
                    <td className="px-5 py-4 font-medium text-gray-700">
                      ${user.totalSpent.toFixed(2)}
                    </td>

                    {/* Status */}
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

                    {/* Action */}
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
    )

}