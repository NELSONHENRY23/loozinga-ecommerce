import Link from 'next/link';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';
import { logoutCustomer } from './logout/actions';
import { LogOut } from 'lucide-react';
import { createAdminClient } from '@/utils/superbase/admin';

export const dynamic = 'force-dynamic';

function getCurrentTime() {
  return Date.now();
}

export default async function CustomerAccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !user.email) {
    redirect('/account/login');
  }

  // Check whether the authnticated customer has been blocked.
  const adminSupabase = createAdminClient();

  const {data: {user: authUser}, error: adminError,} = await adminSupabase.auth.admin.getUserById(user.id);

  // Fail closed if the account status cannot be verified.
  if(adminError || !authUser){
    await supabase.auth.signOut();

    redirect(
      `account/login?error=${encodeURIComponent('Unable to verify your account. Please sign in again.')}`
    )
  }

  const bannedUntil = authUser.banned_until
    ? new Date(authUser.banned_until).getTime()
    : 0;

  const isBlocked = bannedUntil > getCurrentTime();

  if (isBlocked) {
    await supabase.auth.signOut();

    redirect(
      `/account/login?error=${encodeURIComponent(
          'Your account is blocked. Please contact support for assistance.'
      )}`
  );
  }

  // Retrieve the customer's profile.
  const [profile] = await db
    .select({
      name: profiles.name,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

    // Customers must not access the customer account page as administrators.
  if (profile?.role !== 'Customer') {
    redirect('/admin/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <section className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">My Account</h1>

        <p className="mt-5 text-gray-700">Welcome, {profile.name}.</p>

        <p className="mt-2 text-sm text-gray-500">Email: {user.email}</p>

        <p className="mt-1 text-sm text-gray-500">Account type: Customer</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-blue-500 hover:underline"
          >
            Back to Home
          </Link>

          <form action={logoutCustomer}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
