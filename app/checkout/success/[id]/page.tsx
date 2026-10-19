import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { CheckCircle2 } from 'lucide-react';

import { db } from '@/app/db';
import { orders } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';
import Navbar from '@/components/storefront/Navbar';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderSuccessPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/account/login');
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const [order] = await db
    .select({
      orderNumber: orders.orderNumber,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      orderStatus: orders.orderStatus,
    })
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, user.id)))
    .limit(1);

    if(!order){
      notFound();
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-5 py-16">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <CheckCircle2 size={60} className="mx-auto text-green-600" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>
          <p className="mt-3 text-gray-600">
            Thank you for shopping with Loozinga.
          </p>

          <div className="mt-8 space-y-4 rounded-lg bg-gray-50 p-6 text-left">
            <div className="flex justify-between gap-4">
              <span>Order Number</span>
              <strong>{order.orderNumber}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Total</span>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Payment Method</span>
              <strong>{order.paymentMethod}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Payment Status</span>
              <strong>{order.paymentStatus}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span>Order Status</span>
              <strong>{order.orderStatus}</strong>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}
