"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth/supabase/server";
import { syncUserFromAuth } from "@/lib/auth/sync-user";
import { getRoleFromUser } from "@/lib/auth/roles";
import { ADMIN_ROLES } from "@/lib/auth/types";

export type AuthActionState = {
  error?: string;
};

function assertSupabaseConfigured() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "Supabase n'est pas encore configuré. Ajoutez les clés dans le fichier .env.";
  }
  return null;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  const configError = assertSupabaseConfigured();
  if (configError) {
    return { error: configError };
  }

  if (!email || !password) {
    return { error: "Veuillez renseigner votre e-mail et votre mot de passe." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const role = getRoleFromUser(data.user);

  if (!ADMIN_ROLES.includes(role)) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'administration." };
  }

  await syncUserFromAuth(data.user);
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  const configError = assertSupabaseConfigured();
  if (configError) {
    return { error: configError };
  }

  if (!email) {
    return { error: "Veuillez renseigner votre adresse e-mail." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/admin/login?reset=1`,
  });

  if (error) {
    return { error: "Impossible d'envoyer l'e-mail. Réessayez plus tard." };
  }

  return {};
}
