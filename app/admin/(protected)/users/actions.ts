"use server"

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { profiles } from "@/app/db/schema";
import { createAdminClient } from "@/utils/superbase/admin";
import { requireAdmin } from "@/utils/superbase/require-admin";

type CustomerActionResult = {
    success: boolean;
    message: string;
}

export async function setCustomerBlocked(targetUserId:string, shouldBlock: boolean): Promise<CustomerActionResult> {
    // Verify the signed-in administrator
    let admin: Awaited<ReturnType<typeof requireAdmin>>;

    try {
        admin = await requireAdmin();
    } catch (error) {
        if(error instanceof Error){
            if(error.message === 'Unauthorized'){
                return{
                    success: false,
                    message: 'Your session has expired. Please sign in again.',
                }
            }

            if(error.message === 'Forbidden'){
                return{
                    success: false,
                    message: 'You do not have permission to manage customers.',
                }
            }
        }

        // Do not hide unexpected database or authentication failures.
        throw error;
    }

    // Verify the target user ID
    if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            targetUserId
        )
    ) {
        return {
            success: false,
            message: 'Invalid customer ID.',
        };
    }

    // Prevent blocking yourself
    if(targetUserId === admin.id){
        return{
            success: false,
            message: 'You cannot block your own account.'
        }
    }

    // Verify the target account exists and is a customer.
    const adminSupabase = createAdminClient();

    const {
        data: {user: targetUser},
        error: targetError,
    } = await adminSupabase.auth.admin.getUserById(targetUserId);

    if(targetError || !targetUser){
        return{
            success: false,
            message: 'The selected account could not be found.'
        }
    }

    const [targetProfile] = await db.select({role: profiles.role})
                            .from(profiles)
                            .where(eq(profiles.id, targetUserId))
                            .limit(1);

    if(targetProfile?.role !== 'Customer'){
        return{
            success: false,
            message: 'Only customer accounts can be blocked.'
        }
    }

    // Apply or remove the supabase Auth Ban
    const {error: updateError} = await adminSupabase.auth.admin.updateUserById(targetUserId, {
        ban_duration: shouldBlock ? '876000h' : 'none',
    });

    if(updateError){
        return{
            success: false,
            message: 'Could not update the customer account. Please try again.'
        }
    }

    // Refresh the customer list and detail page
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${targetUserId}`);

    return{
        success: true,
        message: shouldBlock 
        ? 'Customer blocked successfully.'
        : 'Customer unblocked successfully.',
    }
}