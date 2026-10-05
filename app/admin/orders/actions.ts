'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/app/db';
import { orders, type OrderStatus, type PaymentStatus} from '@/app/db/schema';


const allowedOrderStatuses: OrderStatus [] = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];


export async function updateOrderStatus(orderId: string, status: OrderStatus){
    if(!orderId){
        return {
            success: false,
            message: 'Invalid order',
        }
    }

    if(!allowedOrderStatuses.includes(status)){
        return {
            success: false,
            message: 'Invalid order status',
        }
    }

   try {
    const updatedOrder = await db.update(orders).set({
        orderStatus: status,
        updatedAt: new Date(),
    }).where(eq(orders.id, orderId)).returning({id: orders.id});

    if(updatedOrder.length === 0){
        return {
            success: false,
            message: 'Order not found',
        }
    }
    revalidatePath('/admin/orders');
    revalidatePath('/admin/orders/[id]');

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

export async function updatePaymentStatus(orderId: string, status: PaymentStatus){
    const allowedPaymentStatuses: PaymentStatus [] = ['Paid', 'Pending'];

    if(!orderId){
        return{
            success: false,
            message: 'Invalid order',
        }
    }

    if(!allowedPaymentStatuses.includes(status)){
        return{
            success: false,
            message: 'Invalid payment status',
        }
    }

    try {
        const updatedOrder = await db.update(orders).set(
            {
                paymentStatus: status,
                updatedAt: new Date(),
            }
        )
        .where(eq(orders.id, orderId))
        .returning({id: orders.id,});

        if(updatedOrder.length === 0){
            return{
                success: false,
                message: 'Order not found',
            }
        }

        revalidatePath('/admin/orders');
        revalidatePath('/admin/orders/[id]');
        
    } catch (error) {
        console.error('UPDATE PAYMENT STATUS ERROR:', error);

        return{
            success: false,
            message: 'Failed to update payment status.'
        }
    }

}