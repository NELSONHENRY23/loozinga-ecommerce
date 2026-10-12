
'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export async function loginCustomer(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/account/login?error=Email and password are required');
  }

  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data.user) {
    redirect('/account/login?error=Invalid credentials or unconfirmed email');
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1);

  if (profile?.role !== 'Customer') {
    await supabase.auth.signOut();
    redirect('/account/login?error=Please use the administrator login');
  }

  redirect('/account');
}
