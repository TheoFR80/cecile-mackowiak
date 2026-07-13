"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  markPackageReadyAction,
  updateChecklistFieldAction,
} from "@/app/admin/(dashboard)/expeditions/actions";
import {
  CHECKLIST_ITEMS,
  PHOTO_TYPES,
  type PackingChecklistField,
  type PackingPhotoType,
} from "@/schemas/packing.schema";
import {
  getApplicableChecklistItems,
  hasRequiredPhotos,
  isChecklistComplete,
} from "@/lib/packing/checklist-utils";
import type { Artwork, PackingChecklist, PackingPhoto } from "@prisma/client";

type Props = {
  orderId: string;
  artwork: Pick<Artwork, "hasCertificate" | "title">;
  checklist: PackingChecklist;
  photos: PackingPhoto[];
};

export function PackingChecklistForm({
  orderId,
  artwork,
  checklist: initialChecklist,
  photos: initialPhotos,
}: Props) {
  const [checklist, setChecklist] = useState(initialChecklist);
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [pendingField, startFieldTransition] = useTransition();
  const [pendingReady, startReadyTransition] = useTransition();
  const [uploadingType, setUploadingType] = useState<PackingPhotoType | null>(
    null
  );

  const items = useMemo(
    () => getApplicableChecklistItems(artwork.hasCertificate),
    [artwork.hasCertificate]
  );

  const checklistDone = isChecklistComplete(checklist, artwork);
  const photosDone = hasRequiredPhotos(photos);
  const isCompleted = Boolean(checklist.completedAt);

  function toggleField(field: PackingChecklistField, value: boolean) {
    setError(null);
    setChecklist((prev) => ({ ...prev, [field]: value }));
    startFieldTransition(async () => {
      const result = await updateChecklistFieldAction(orderId, field, value);
      if (result.error) {
        setError(result.error);
        setChecklist((prev) => ({ ...prev, [field]: !value }));
      }
    });
  }

  async function uploadPhoto(type: PackingPhotoType, file: File) {
    setError(null);
    setUploadingType(type);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("orderId", orderId);
      formData.set("type", type);

      const res = await fetch("/api/uploads/packing", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec upload");

      setPhotos((prev) => [
        ...prev.filter((p) => p.type !== type),
        {
          id: data.id,
          packingChecklistId: checklist.id,
          type,
          url: data.url,
          createdAt: new Date(),
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      setUploadingType(null);
    }
  }

  function handleMarkReady() {
    setError(null);
    startReadyTransition(async () => {
      const result = await markPackageReadyAction(orderId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setChecklist((prev) => ({ ...prev, completedAt: new Date() }));
    });
  }

  const checkboxClass =
    "mt-1 h-6 w-6 shrink-0 rounded border-stone-300 text-accent focus:ring-accent";

  return (
    <div className="space-y-10">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {isCompleted && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Colis validé le{" "}
          {checklist.completedAt
            ? new Date(checklist.completedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
          . Vous pouvez créer l&apos;étiquette d&apos;expédition.
        </p>
      )}

      <section>
        <h2 className="font-serif text-2xl text-ink">Étapes d&apos;emballage</h2>
        <p className="mt-2 text-sm text-stone-600">
          Cochez chaque étape pour {artwork.title}.
        </p>

        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-4"
            >
              <input
                type="checkbox"
                className={checkboxClass}
                checked={checklist[item.key]}
                disabled={isCompleted || pendingField}
                onChange={(e) => toggleField(item.key, e.target.checked)}
              />
              <div>
                <p className="font-medium text-ink">{item.label}</p>
                {item.hint && (
                  <p className="mt-1 text-sm text-stone-500">{item.hint}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-ink">Photos de preuve</h2>
        <p className="mt-2 text-sm text-stone-600">
          Prenez des photos depuis votre téléphone pour documenter l&apos;emballage.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PHOTO_TYPES.map((photoType) => {
            const existing = photos.find((p) => p.type === photoType.type);
            return (
              <div
                key={photoType.type}
                className="rounded-2xl border border-stone-200 bg-white p-4"
              >
                <p className="font-medium text-ink">
                  {photoType.label}
                  {photoType.required && (
                    <span className="ml-2 text-xs text-accent">Obligatoire</span>
                  )}
                </p>

                {existing && (
                  <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
                    <Image
                      src={existing.url}
                      alt={photoType.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                {!isCompleted && (
                  <label className="mt-3 inline-flex min-h-[48px] cursor-pointer items-center rounded-xl border border-stone-300 px-4 text-sm text-ink hover:border-ink">
                    {uploadingType === photoType.type
                      ? "Envoi…"
                      : existing
                        ? "Remplacer la photo"
                        : "Ajouter une photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      capture="environment"
                      className="sr-only"
                      disabled={uploadingType !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadPhoto(photoType.type, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {!isCompleted && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-sm text-stone-600">
            {checklistDone && photosDone
              ? "Tout est prêt — validez l'emballage pour débloquer l'étiquette."
              : !checklistDone
                ? "Cochez toutes les étapes ci-dessus."
                : "Ajoutez les photos obligatoires."}
          </p>
          <button
            type="button"
            onClick={handleMarkReady}
            disabled={!checklistDone || !photosDone || pendingReady}
            className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-ink px-8 text-base font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {pendingReady ? "Validation…" : "Le colis est prêt"}
          </button>
        </div>
      )}
    </div>
  );
}
