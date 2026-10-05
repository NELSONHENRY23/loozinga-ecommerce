'use client';

import { useState, useTransition } from "react";

import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/app/db/schema";


type OrderStatusFormProps = {
    orderId: string;
    currentStatus: OrderStatus;
}

const orderStatuses: OrderStatus[] = [
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
]

export default function OrderStatusForm({
    orderId,
    currentStatus
}: OrderStatusFormProps){
    const [status, setStatus] = useState<OrderStatus>(currentStatus);

    const [message, setMessage] = useState('');

    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();

        startTransition(async() => {
            const result = await updateOrderStatus(orderId, status);

            setMessage(result.message);
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <label htmlFor="orderStatus" className="mb-2 block text-sm font-medium text-gray-700">
                    Order Status
                </label>

                <select id="orderStatus" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} disabled={isPending} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400">
                    {
                        orderStatuses.map((orderStatus) => (
                            <option key={orderStatus} value={orderStatus}>
                                {orderStatus}
                            </option>
                        ))
                    }
                </select>

                <button
                 type="submit"
                 disabled={
                    isPending || status === currentStatus
                 }
                 className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {
                        isPending ? 'Updating...' : 'Update Status'
                    }
                </button>

                {
                    message && (
                        <p className="text-sm text-gray-500">
                            {message}
                        </p>
                    )
                }
            </div>
        </form>
    )
}