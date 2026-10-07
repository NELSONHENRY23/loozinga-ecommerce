'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export async function updateProfile(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!name) {
    return {
      success: false,
      message: 'Name is required.',
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      message: 'You must be logged in.',
    };
  }

  try {
    await db
      .insert(profiles)
      .values({
        id: user.id,
        name,
        phone: phone || null,
        role: 'Administrator',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name,
          phone: phone || null,
          updatedAt: new Date(),
        },
      });

    revalidatePath('/admin/account');

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