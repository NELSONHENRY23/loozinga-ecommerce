
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/superbase/server';

export async function registerCustomer(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(
    formData.get('confirmPassword') ?? '',
  );

  if (!name || name.length > 150) {
    redirect(
      '/account/register?error=Enter a valid name',
    );
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    redirect(
      '/account/register?error=Enter a valid email',
    );
  }

  if (password.length < 8) {
    redirect(
      '/account/register?error=Password must have at least 8 characters',
    );
  }

  if (password !== confirmPassword) {
    redirect(
      '/account/register?error=Passwords do not match',
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/account/login`
          : undefined,
    },
  });

  if (error) {
    // Avoid exposing account-existence details.
    redirect(
      '/account/register?error=Registration could not be completed',
    );
  }

  redirect('/account/login?registered=1');
}
