import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdminUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await requireAdminUser();
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Utilisateur";

  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader displayName={displayName} role={role} />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
