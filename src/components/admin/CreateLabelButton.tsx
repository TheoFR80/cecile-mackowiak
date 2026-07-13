"use client";

import { useState, useTransition } from "react";
import { createLabelAction } from "@/app/admin/(dashboard)/commandes/actions";

type Props = {
  orderId: string;
  existingLabelUrl?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

export function CreateLabelButton({
  orderId,
  existingLabelUrl,
  trackingNumber,
  trackingUrl,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [labelUrl, setLabelUrl] = useState(existingLabelUrl ?? null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createLabelAction(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.labelUrl) setLabelUrl(result.labelUrl);
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {labelUrl ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700">Étiquette prête.</p>
          <a
            href={labelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[52px] items-center rounded-xl bg-ink px-8 text-base font-medium text-white hover:bg-stone-800"
          >
            Télécharger l&apos;étiquette
          </a>
          {(trackingNumber || trackingUrl) && (
            <p className="text-sm text-stone-600">
              Suivi : {trackingNumber ?? trackingUrl}
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleCreate}
          disabled={pending}
          className="inline-flex min-h-[52px] items-center rounded-xl bg-ink px-8 text-base font-medium text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer l'étiquette d'expédition"}
        </button>
      )}
    </div>
  );
}
