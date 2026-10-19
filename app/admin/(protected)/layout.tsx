import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import AdminShell from "@/components/admin/AdminShell";
import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export default async function ProtectedAdminLayout({children,}:Readonly<{children: React.ReactNode}>){
    const supabase = await createClient();

  // Verify the currently signed-in user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  // Read the trusted role from Supabase database
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  // Non-admin users cannot access admin pages
  if (profile?.role !== 'Administrator') {
    redirect('/account');
  }

    return <AdminShell>{children}</AdminShell>
}