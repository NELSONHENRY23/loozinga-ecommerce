import 'server-only';

import { redirect } from 'next/navigation';

import { createAdminClient } from '@/utils/superbase/admin';
import { createClient } from '@/utils/superbase/server';
import { isUserBlocked } from '@/utils/superbase/user-status';

export async function requireActiveCustomer() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/account/login');
  }

  const {
    data: { user: authUser },
    error: adminError,
  } = await createAdminClient().auth.admin.getUserById(user.id);

  if (adminError || !authUser) {
    await supabase.auth.signOut();
    redirect(
      `/account/login?error=${encodeURIComponent('Unable to verify your account. Please sign in again.')}`,
    );
  }

  if (isUserBlocked(authUser.banned_until)) {
    await supabase.auth.signOut();
    redirect(
      `/account/login?error=${encodeURIComponent(
        'Your account is blocked. Please contact support for assistance.',
      )}`,
    );
  }

  return user;
}
