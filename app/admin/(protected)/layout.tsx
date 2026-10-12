import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/utils/superbase/require-admin";

export default async function ProtectedAdminLayout({children,}:Readonly<{children: React.ReactNode}>){
    await requireAdmin();

    return <AdminShell>{children}</AdminShell>
}