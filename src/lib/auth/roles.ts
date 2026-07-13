import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/auth/types";

export function getRoleFromUser(user: User): UserRole {
  const role = user.app_metadata?.role;
  if (role === "OWNER" || role === "ARTIST" || role === "CUSTOMER") {
    return role;
  }
  return "CUSTOMER";
}
