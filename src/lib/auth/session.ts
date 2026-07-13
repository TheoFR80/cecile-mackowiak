import { redirect } from "next/navigation";
import { ADMIN_ROLES } from "@/lib/auth/types";
import { getRoleFromUser } from "@/lib/auth/roles";
import { createClient } from "@/lib/auth/supabase/server";
import { syncUserFromAuth } from "@/lib/auth/sync-user";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  const role = getRoleFromUser(user);

  if (!ADMIN_ROLES.includes(role)) {
    redirect("/admin/login?error=unauthorized");
  }

  await syncUserFromAuth(user);

  return { user, role };
}

export async function requireOwnerUser() {
  const { user, role } = await requireAdminUser();

  if (role !== "OWNER") {
    redirect("/admin?error=owner_only");
  }

  return { user, role };
}
