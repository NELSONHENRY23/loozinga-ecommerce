
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/superbase/server';

export async function logoutCustomer() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error('Failed to sign out. Please try again.');
  }

  redirect('/account/login');
}
