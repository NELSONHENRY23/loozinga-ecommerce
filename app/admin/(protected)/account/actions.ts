'use server';


import { revalidatePath } from 'next/cache';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';
import { requireAdmin } from '@/utils/superbase/require-admin';
import { eq } from 'drizzle-orm';

// UPDATE ADMIN PROFILE 

export async function updateProfile(formData: FormData) {
  // Authorization must happend before database writes
  const user = await requireAdmin();
  
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!name || name.length > 150) {
    return {
      success: false,
      message: 'Name must be between 1 and 150 charaters.',
    };
  }

  if(phone.length > 50){
    return{
      success: false,
      message: 'Phone number is too long.'
    }
  }

  try {
   const updated = await db.update(profiles)
   .set({
    name,
    phone: phone || null,
    updatedAt: new Date(),
   })
   .where(eq(profiles.id, user.id))
   .returning({id: profiles.id});

   if(updated.length === 0){
    return{
      success: false,
      message: 'Administrator profile not found.',
    }
   }

    revalidatePath('/admin/account');
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'Profile updated successfully.',
    };
  } catch (error) {
    console.error('UPDATE_PROFILE_ERROR:', error);

    return {
      success: false,
      message: 'Failed to update profile.',
    };
  }
}

// UPDATE ADMIN PASSWORD

export async function updatePassword(formData: FormData) {
  // Only an authorized administrator can use this action
  await requireAdmin();

  const newPassword = String(formData.get('newPassword') ?? '');

  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if(!newPassword || !confirmPassword){
    return {
      success: false,
      message: 'Both password fields are required.'
    }
  }

  if(newPassword.length < 8){
    return{
      success: false,
      message: 'Password must be at least 8 charaters.',
    }
  }

  if(newPassword !== confirmPassword){
    return {success: false,
    message: 'Password do not match'
    }
  }

  const supabase = await createClient();

  const {data: { user }, error: userError, } = await supabase.auth.getUser();

  if(userError || !user){
    return {
      success: false,
      message: 'You must be logged in'
      }
  }

  const { error }= await supabase.auth.updateUser({password: newPassword,});

  if(error){
    console.error('UPDATE PASSWORD ERROR:', error);

    if (error.code === 'same_password') {
      return {
        success: false,
        message: 'New password must be different from your current password.',
      };
    }
    
    return {
      success: false,
      message: 'Failed to update password.'
    }
  }

  return{
    success: true,
    message: 'Password updated successfully.'
  }
}