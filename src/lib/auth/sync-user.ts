import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/database/client";
import { getRoleFromUser } from "@/lib/auth/roles";

export async function syncUserFromAuth(user: User) {
  const role = getRoleFromUser(user);
  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email?.split("@")[0] ??
    null;

  await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      displayName,
      role,
      lastLoginAt: new Date(),
      isActive: true,
    },
    update: {
      email: user.email ?? "",
      displayName,
      role,
      lastLoginAt: new Date(),
      isActive: true,
    },
  });
}
