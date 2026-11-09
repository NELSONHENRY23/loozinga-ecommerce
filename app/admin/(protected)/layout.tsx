import { redirect } from 'next/navigation';

import AdminShell from "@/components/admin/AdminShell";
import { getAdminContext } from '@/utils/superbase/require-admin';

export default async function ProtectedAdminLayout({children,}:Readonly<{children: React.ReactNode}>){
  const result = await getAdminContext();

  if (result.status === 'unauthenticated') {
    redirect('/admin/login');
  }

  if (result.status === 'forbidden') {
    redirect('/account');
  }

    return <AdminShell adminName={result.admin.name ?? 'Admin'}>{children}</AdminShell>
}