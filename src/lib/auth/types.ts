export type UserRole = "OWNER" | "ARTIST" | "CUSTOMER";

export const ADMIN_ROLES: UserRole[] = ["OWNER", "ARTIST"];

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Administrateur technique",
  ARTIST: "Artiste",
  CUSTOMER: "Client",
};
