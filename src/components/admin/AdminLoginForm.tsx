"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import {
  loginAction,
  requestPasswordResetAction,
  type AuthActionState,
} from "@/lib/auth/actions";

const initialState: AuthActionState = {};

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/admin";
  const urlError = searchParams.get("error");
  const resetSent = searchParams.get("reset");

  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialState
  );
  const [resetState, resetFormAction, resetPending] = useActionState(
    requestPasswordResetAction,
    initialState
  );

  const errorMessage =
    loginState.error ??
    (urlError === "unauthorized"
      ? "Ce compte n'a pas accès à l'administration."
      : undefined);

  return (
    <div className="space-y-10">
      <form action={loginFormAction} className="space-y-6">
        <input type="hidden" name="redirect" value={redirect} />

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-base font-medium text-ink"
          >
            Adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-4 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-base font-medium text-ink"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-4 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <button
          type="submit"
          disabled={loginPending}
          className="w-full min-h-[52px] rounded-xl bg-ink px-6 py-4 text-base font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loginPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <details className="rounded-xl border border-stone-200 bg-white p-5">
        <summary className="cursor-pointer text-base font-medium text-ink">
          Mot de passe oublié
        </summary>
        <form action={resetFormAction} className="mt-5 space-y-4">
          {resetSent && !resetState.error && (
            <p className="text-sm text-green-700">
              Si un compte existe, un e-mail de réinitialisation a été envoyé.
            </p>
          )}
          {resetState.error && (
            <p role="alert" className="text-sm text-red-700">
              {resetState.error}
            </p>
          )}
          <input
            name="email"
            type="email"
            placeholder="Votre e-mail"
            required
            className="w-full rounded-xl border border-stone-300 px-4 py-4 text-base"
          />
          <button
            type="submit"
            disabled={resetPending}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 py-3 text-base text-ink hover:border-ink disabled:opacity-60"
          >
            {resetPending ? "Envoi…" : "Recevoir un lien"}
          </button>
        </form>
      </details>
    </div>
  );
}
