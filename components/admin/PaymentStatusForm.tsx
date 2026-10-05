'use client';

import { use, useState, useTransition } from "react";

import { updatePaymentStatus } from "@/app/admin/orders/actions";
import type { PaymentStatus } from "@/app/db/schema";

type PaymentStatusFormProps = {
    orderId: string;
    currentStatus: PaymentStatus;
}
const paymentStatuses: PaymentStatus[] = [
    'Paid',
    'Pending'
]

export default function PaymentStatusForm({
    orderId,
    currentStatus
}: PaymentStatusFormProps){
    const [status, setStatus] = useState<PaymentStatus>(currentStatus);

    const [message, setMessage] = useState('');

    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();

        setMessage('');

        startTransition(async() => {

            const result = await updatePaymentStatus(orderId, status);

            setMessage(result?.message ?? '');
        })
    }
    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
                <label htmlFor="paymentStatus" className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Status
                </label>
                <select 
                id="paymentStatus" 
                value={status} 
                disabled={isPending} 
                onChange={(event) => setStatus(event.target.value as PaymentStatus)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400">
                    {
                        paymentStatuses.map((paymentStatus) => (
                            <option value={paymentStatus} key={paymentStatus}>
                                {paymentStatus}
                            </option>
                        ))
                    }
                </select>

                
            </div>

            <button
            type="submit"
            disabled={isPending || status === currentStatus}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
{
isPending ? 'Updating...' : 'Update Payment'
}
            </button>
            {
                message && (
                    <p className="text-sm text-gray-500">
                        {message}
                    </p>
                )
            }
        </form>
    )

}
