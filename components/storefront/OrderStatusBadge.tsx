import type { OrderStatus } from "@/app/db/schema";

const styles = {
    Processing: 'bg-yellow-50 text-yellow-600',
    Shipped: 'bg-green-50 text-green-600',
    Delivered: 'bg-blue-50 text-blue-600',
    Cancelled: 'bg-red-50 text-red-600',
} satisfies Record<OrderStatus, string>;

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
    return (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
            {status}
        </span>
    )
}