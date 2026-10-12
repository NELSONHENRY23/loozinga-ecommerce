'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=Email and password are required');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if(error || !data.user){
    redirect('/admin/login?error=Invalid email or password',);
  }

  // Verify the account's database role.
  const [profile] = await db.select({role: profiles.role})
  .from(profiles)
  .where(eq(profiles.id, data.user.id))
  .limit(1);

  if(profile?.role !== 'Administrator'){
    // Do not keep a customer session in the admin login.
    await supabase.auth.signOut();

    redirect('/admin/login?error=This account is not authorized to access the admin dashboard',);
  
  }
  redirect('/admin');
}