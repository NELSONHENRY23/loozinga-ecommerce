import {
  Boxes,
  Download,
  ShoppingCart,
  ThumbsUp,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";

const stats = [
  {
    title: "Download",
    value: 25,
    color: "bg-[#57889c]",
    icon: Download,
  },
  {
    title: "Purchased",
    value: 18,
    color: "bg-[#d1b993]",
    icon: ShoppingCart,
  },
  {
    title: "Order",
    value: 31,
    color: "bg-[#1a2732]",
    icon: ThumbsUp,
  },
  {
    title: "stock",
    value: 142,
    color: "bg-[#26c281]",
    icon: Boxes,
  },
];

const orders = [
  {
    id: 101,
    status: "Paid",
    userId: 12,
    date: "2026-08-17",
    phone: "+211 912 345 678",
    address: "Juba",
  },
  {
    id: 102,
    status: "On Hold",
    userId: 18,
    date: "2026-08-17",
    phone: "+211 923 456 789",
    address: "Juba",
  },
  {
    id: 103,
    status: "Delivered",
    userId: 23,
    date: "2026-08-16",
    phone: "+211 955 123 456",
    address: "Munuki",
  },
  {
    id: 104,
    status: "Paid",
    userId: 27,
    date: "2026-08-16",
    phone: "+211 977 654 321",
    address: "Kator",
  },
  {
    id: 105,
    status: "On Hold",
    userId: 30,
    date: "2026-08-15",
    phone: "+211 988 222 111",
    address: "Juba",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>

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

        <section id="orders" className="mt-7 overflow-hidden bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[225px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order Id</th>
                  <th className="px-5 py-4">Order Status</th>
                  <th className="px-5 py-4">User Id</th>
                  <th className="px-5 py-4">Order Date</th>
                  <th className="px-5 py-4">User Phone</th>
                  <th className="px-5 py-4">User Address</th>
                  <th className="px-5 py-4">Edit</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4">{order.id}</td>
                    <td className="px-5 py-4">{order.status}</td>
                    <td className="px-5 py-4">{order.userId}</td>
                    <td className="px-5 py-4">{order.date}</td>
                    <td className="px-5 py-4">{order.phone}</td>
                    <td className="px-5 py-4">{order.address}</td>
                    <td className="px-5 py-4">
                      <button className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 flex justify-center">
          <div className="flex overflow-hidden rounded border border-gray-300 bg-white">
            <button className="border-r border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
              Previous
            </button>
            <button className="border-r border-blue-300 bg-blue-500 px-4 py-2 text-sm text-white">
              1
            </button>
            <button className="border-r border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
              2
            </button>
            <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}