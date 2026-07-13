"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ContactFormInner() {
  const params = useSearchParams();
  const tableau = params.get("tableau");
  const defaultMessage = tableau
    ? `Bonjour,\n\nJe souhaiterais des renseignements concernant le tableau « ${tableau} ».\n\n`
    : "";

  return (
    <form className="mt-10 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      {tableau && (
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-ink">
            Tableau concerné
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            readOnly
            defaultValue={tableau}
            className="mt-2 w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-stone-600"
          />
        </div>
      )}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          defaultValue={defaultMessage}
          className="mt-2 w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <button
        type="submit"
        className="w-full min-h-[48px] rounded-full bg-ink py-3 text-sm text-white transition hover:bg-stone-800"
      >
        Envoyer
      </button>
      <p className="text-xs text-stone-400">
        L&apos;envoi par e-mail sera activé prochainement. En attendant, vos
        messages seront enregistrés côté serveur.
      </p>
    </form>
  );
}

export function ContactForm() {
  return (
    <Suspense fallback={<p className="mt-10 text-stone-500">Chargement…</p>}>
      <ContactFormInner />
    </Suspense>
  );
}
