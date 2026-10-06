'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/utils/superbase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=Email and password are required');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('SUPABASE_LOGIN_ERROR:', {
      message: error.message,
      code: error.code,
      status: error.status,
    });
  
    redirect(
      `/admin/login?error=${encodeURIComponent(
        `${error.code ?? 'auth_error'}: ${error.message}`,
      )}`,
    );
  }
  redirect('/admin');
}