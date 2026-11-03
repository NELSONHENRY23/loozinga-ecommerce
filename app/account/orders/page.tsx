import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { orders } from "@/app/db/schema";
import { requireActiveCustomer } from "@/utils/superbase/require-active-customer";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import Pagination from "@/components/admin/Pagination";
import OrderStatusBadge from "@/components/storefront/OrderStatusBadge";

export const dynamic = "force-dynamic";

const pageSize = 10;

type Props = {
    searchParams: Promise<{page?: string | string[]}>;   
}

export default async function CustomerOrdersPage({searchParams}:Props) {
    const user = await requireActiveCustomer();

    const params = await searchParams;
    const rawPage = Array.isArray(params.page)
  ? params.page[0]
  : params.page;

const requestedPage = Number(rawPage ?? 1);

const validPage =
  Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

const [countResult] = await db.select({total: count()})
                            .from(orders)
                            .where(eq(orders.userId, user.id));
    
const totalOrders = countResult?.total ?? 0;
const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
const currentPage = Math.min(validPage, totalPages);
const offset = (currentPage - 1) * pageSize;

const orderList = await db.select({
                                id: orders.id,
                                orderNumber: orders.orderNumber,
                                total: orders.total,
                                orderStatus: orders.orderStatus,
                                paymentStatus: orders.paymentStatus,
                                createdAt: orders.createdAt,
                            })
                            .from(orders)
                            .where(eq(orders.userId, user.id))
                            .orderBy(desc(orders.createdAt), desc(orders.id))
                            .limit(pageSize)
                            .offset(offset);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar/>

            <main className="mx-auto max-w-4xl px-5 py-12">
                <Link href="/account" className="text-sm text-gray-500 hover:text-black">
                  ← Back to account   
                </Link>

                <h1 className="mb-8 mt-4 text-3xl font-bold">My Orders</h1>

                {
                    orderList.length === 0 ? (
                        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                            <h2 className="text-xl font-semibold">No orders yet</h2>
                            <p className="mt-3 text-gray-500">Your orders will appear here.</p>
                            <Link href="/shop" className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 text-white hover:bg-gray-700">
                                Start Shopping
                            </Link>
                        </div>
                    )
                    :
                    (
                        <div className="space-y-4">
                            {
                                orderList.map((order) => (
                                    <Link 
                                        key={order.id} 
                                        href= {`/account/orders/${order.id}`}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                                    >
                                        <div>
                                            <p className="font-semibold">{order.orderNumber}</p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {
                                                    order.createdAt.toLocaleDateString('en-US', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })
                                                }
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <OrderStatusBadge status={order.orderStatus}/>
                                            <span className="font-bold">
                                                ${Number(order.total).toFixed(2)}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>
                    )
                }

                <p className="mt-6 text-center text-sm text-gray-500">
                    Showing {orderList.length} of {totalOrders} orders
                    {' · '}
                    Page {currentPage} of {totalPages}
                </p>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/account/orders"
                />
            </main>

            <Footer/>
        </div>
    )
}