import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import AdminShell from "@/components/admin/AdminShell";
import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';
import { createClient } from '@/utils/superbase/server';

export default async function ProtectedAdminLayout({children,}:Readonly<{children: React.ReactNode}>){
    const supabase = await createClient();

  // Verify the signed JWT without a separate Auth API request.
  const {data, error} = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== 'string') {
    redirect('/admin/login');
  }

  // Read the trusted role from Supabase database
  const [profile] = await db
    .select({ name: profiles.name, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  // Non-admin users cannot access admin pages
  if (profile?.role !== 'Administrator') {
    redirect('/account');
  }

    return <AdminShell adminName={profile?.name ?? 'Admin'}>{children}</AdminShell>
}