'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/app/db';
import { orders, type OrderStatus, type PaymentStatus} from '@/app/db/schema';

import { requireAdmin } from '@/utils/superbase/require-admin';

const allowedOrderStatuses: OrderStatus [] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

// UPDATE ORDER STATUS

export async function updateOrderStatus(orderId: string, status: OrderStatus){
    // verify administrator before performing any database work
    await requireAdmin();

    if(!orderId){
        return {
            success: false,
            message: 'Invalid order Id',
        }
    }

    if(!allowedOrderStatuses.includes(status)){
        return {
            success: false,
            message: 'Invalid order status',
        }
    }

   try {
    const [updatedOrder] = await db.update(orders).set({
        orderStatus: status,
        updatedAt: new Date(),
    }).where(eq(orders.id, orderId)).returning({id: orders.id});

    if(!updatedOrder){
        return {
            success: false,
            message: 'Order not found',
        }
    }
    revalidatePath('/admin/orders');
    revalidatePath('/admin/orders/[id]');
    revalidatePath('/admin/users');

    return {
        success: true,
        message: 'Order status updated successfully',
    }
    
   } catch (error) {
    console.error('UPDATE ORDER STATUS ERROR:', error);

    return {
        success: false,
        message: 'Failed to update order status',
    }
   } 
}

// UPDATE PAYMENT STATUS

export async function updatePaymentStatus(orderId: string, status: PaymentStatus){
    // verify administrator before performing any database work
    await requireAdmin();

    const allowedPaymentStatuses: PaymentStatus [] = ['Paid', 'Pending'];

    if(!orderId){
        return{
            success: false,
            message: 'Invalid order Id',
        }
    }

    if(!allowedPaymentStatuses.includes(status)){
        return{
            success: false,
            message: 'Invalid payment status',
        }
    }

    try {
        const [updatedOrder] = await db.update(orders).set(
            {
                paymentStatus: status,
                updatedAt: new Date(),
            }
        )
        .where(eq(orders.id, orderId))
        .returning({id: orders.id,});

        if(!updatedOrder){
            return{
                success: false,
                message: 'Order not found',
            }
        }

        revalidatePath('/admin/orders');
        revalidatePath('/admin/orders/[id]');
        
        return {
            success: true,
            message: 'Payment status updated successfully.',
        };

    } catch (error) {
        console.error('UPDATE PAYMENT STATUS ERROR:', error);

        return{
            success: false,
            message: 'Failed to update payment status.'
        }
    }

}