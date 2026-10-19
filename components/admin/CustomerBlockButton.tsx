'use client'

import { startTransition, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCustomerBlocked } from "@/app/admin/(protected)/users/actions";

type CustomerBlockButtonProps = {
    userId: string;
    isBlocked: boolean;
}

export default function CustomerBlockButton({userId, isBlocked,}: CustomerBlockButtonProps){
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState('');

    function handleClick(){
        const action = isBlocked ? 'unblock' : 'block';

        const confirmed = window.confirm(`Are you sure you want to ${action} this customer?`);

        if(!confirmed) return;

        setMessage('');

        startTransition(async () => {
            const result = await setCustomerBlocked(userId, !isBlocked);

            setMessage(result.message);

            if(result.success){
                router.refresh();
            }
        })
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                className={`rounded-md px-4 py-2 text-sm text-white font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isBlocked
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
            >
                {
                    isPending
                    ? 'Please wait...'
                    : isBlocked
                    ? 'Unblock Customer'
                    : 'Block Customer'
                }

            </button>

            {
                message && (
                    <p role="status" className="text-sm text-gray-600">
                        {message}
                    </p>
                )
            }
        </div>
    )
}