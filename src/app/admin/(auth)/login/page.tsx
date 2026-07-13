import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isSupabaseConfigured } from "@/lib/auth/config";

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            Espace privé
          </p>
          <h1 className="mt-3 font-serif text-3xl text-ink">Connexion</h1>
          <p className="mt-3 text-stone-600">
            Accédez à la gestion des tableaux et des commandes.
          </p>
        </div>

        {!configured && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900"
          >
            <p className="font-medium">Configuration Supabase requise</p>
            <p className="mt-2">
              Créez un projet sur{" "}
              <a
                href="https://supabase.com/dashboard"
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                supabase.com
              </a>{" "}
              puis copiez les clés dans le fichier <code>.env</code> local.
            </p>
          </div>
        )}

        <Suspense fallback={<p className="text-center text-stone-500">Chargement…</p>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
