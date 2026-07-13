"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ARTWORK_CATEGORIES,
  ARTWORK_ORIENTATIONS,
  ARTWORK_SUPPORTS,
  ARTWORK_TECHNIQUES,
  centsToEuros,
} from "@/schemas/artwork.schema";
import {
  calculatePackageDimensions,
  classifyShipping,
} from "@/lib/shipping/package-dimensions";
import { saveArtworkAction, createDraftArtworkAction } from "@/app/admin/(dashboard)/tableaux/actions";

export type WizardImage = {
  id: string;
  url: string;
  publicId?: string;
  preview: string;
  isPrimary: boolean;
  uploading?: boolean;
};

export type WizardInitialData = {
  artworkId: string;
  title: string;
  description: string;
  priceEuros: number;
  year: number | null;
  category: string;
  technique: string;
  support: string;
  orientation: string;
  isFramed: boolean;
  hasCertificate: boolean;
  isSigned: boolean;
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  weightKg: number | null;
  packageWidthCm: number | null;
  packageHeightCm: number | null;
  packageDepthCm: number | null;
  packageWeightKg: number | null;
  shippingClass: string;
  images: WizardImage[];
};

const STEPS = [
  "Photos",
  "Informations",
  "Dimensions",
  "Expédition",
  "Vérification",
];

type Props = {
  initial?: WizardInitialData;
};

export function ArtworkWizard({ initial }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [artworkId, setArtworkId] = useState(initial?.artworkId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<WizardImage[]>(initial?.images ?? []);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceEuros, setPriceEuros] = useState(
    initial?.priceEuros ? String(initial.priceEuros) : ""
  );
  const [year, setYear] = useState(initial?.year ? String(initial.year) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [technique, setTechnique] = useState(initial?.technique ?? "");
  const [support, setSupport] = useState(initial?.support ?? "");
  const [orientation, setOrientation] = useState(initial?.orientation ?? "");
  const [isFramed, setIsFramed] = useState(initial?.isFramed ?? false);
  const [hasCertificate, setHasCertificate] = useState(
    initial?.hasCertificate ?? false
  );
  const [isSigned, setIsSigned] = useState(initial?.isSigned ?? true);

  const [widthCm, setWidthCm] = useState(
    initial?.widthCm ? String(initial.widthCm) : ""
  );
  const [heightCm, setHeightCm] = useState(
    initial?.heightCm ? String(initial.heightCm) : ""
  );
  const [depthCm, setDepthCm] = useState(
    initial?.depthCm ? String(initial.depthCm) : "2"
  );
  const [weightKg, setWeightKg] = useState(
    initial?.weightKg ? String(initial.weightKg) : ""
  );

  const [packageWidthCm, setPackageWidthCm] = useState(
    initial?.packageWidthCm ? String(initial.packageWidthCm) : ""
  );
  const [packageHeightCm, setPackageHeightCm] = useState(
    initial?.packageHeightCm ? String(initial.packageHeightCm) : ""
  );
  const [packageDepthCm, setPackageDepthCm] = useState(
    initial?.packageDepthCm ? String(initial.packageDepthCm) : ""
  );
  const [packageWeightKg, setPackageWeightKg] = useState(
    initial?.packageWeightKg ? String(initial.packageWeightKg) : ""
  );
  const [shippingClass, setShippingClass] = useState(
    initial?.shippingClass ?? "STANDARD"
  );

  useEffect(() => {
    if (!artworkId && !initial) {
      createDraftArtworkAction().then((res) => {
        if (res.artworkId) setArtworkId(res.artworkId);
        else if (res.error) setError(res.error);
      });
    }
  }, [artworkId, initial]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || !artworkId) return;
    setError(null);

    for (const file of Array.from(fileList)) {
      const tempId = crypto.randomUUID();
      const preview = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { id: tempId, url: "", preview, isPrimary: prev.length === 0, uploading: true },
      ]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("artworkId", artworkId);

      try {
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Échec");

        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? { ...img, url: data.url, publicId: data.publicId, uploading: false }
              : img
          )
        );
      } catch (err) {
        setImages((prev) => prev.filter((img) => img.id !== tempId));
        setError(err instanceof Error ? err.message : "Téléversement impossible");
      }
    }
  }

  function setPrimary(id: string) {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })));
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function calculatePackage() {
    const w = parseFloat(widthCm);
    const h = parseFloat(heightCm);
    const d = parseFloat(depthCm) || 2;
    const kg = parseFloat(weightKg);
    if (!w || !h || !kg) {
      setError("Renseignez d'abord les dimensions de l'œuvre.");
      return;
    }
    const pkg = calculatePackageDimensions({
      widthCm: w,
      heightCm: h,
      depthCm: d,
      weightKg: kg,
    });
    setPackageWidthCm(String(Math.round(pkg.widthCm)));
    setPackageHeightCm(String(Math.round(pkg.heightCm)));
    setPackageDepthCm(String(Math.round(pkg.depthCm)));
    setPackageWeightKg(String(Math.max(kg + 0.5, kg)));
    setShippingClass(classifyShipping(pkg));
    setError(null);
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!images.length || images.some((i) => i.uploading || !i.url)) {
        setError("Ajoutez au moins une photo (téléversement terminé).");
        return false;
      }
    }
    if (step === 1) {
      if (!title.trim() || !description.trim() || !priceEuros) {
        setError("Renseignez le titre, la description et le prix.");
        return false;
      }
    }
    if (step === 2) {
      if (!widthCm || !heightCm || !weightKg) {
        setError("Renseignez largeur, hauteur et poids.");
        return false;
      }
    }
    if (step === 3) {
      if (!packageWidthCm || !packageHeightCm || !packageDepthCm || !packageWeightKg) {
        setError("Renseignez les dimensions du colis.");
        return false;
      }
    }
    setError(null);
    return true;
  }

  async function handleSave(publish: boolean) {
    if (!validateStep()) return;
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("artworkId", artworkId);
    formData.set("publish", String(publish));
    formData.set("title", title);
    formData.set("description", description);
    formData.set("priceEuros", priceEuros);
    if (year) formData.set("year", year);
    if (category) formData.set("category", category);
    if (technique) formData.set("technique", technique);
    if (support) formData.set("support", support);
    if (orientation) formData.set("orientation", orientation);
    formData.set("isFramed", String(isFramed));
    formData.set("hasCertificate", String(hasCertificate));
    formData.set("isSigned", String(isSigned));
    formData.set("widthCm", widthCm);
    formData.set("heightCm", heightCm);
    formData.set("depthCm", depthCm || "2");
    formData.set("weightKg", weightKg);
    formData.set("packageWidthCm", packageWidthCm);
    formData.set("packageHeightCm", packageHeightCm);
    formData.set("packageDepthCm", packageDepthCm);
    formData.set("packageWeightKg", packageWeightKg);
    formData.set("shippingClass", shippingClass);
    formData.set(
      "images",
      JSON.stringify(
        images.map((img, i) => ({
          url: img.url,
          publicId: img.publicId,
          altText: title,
          position: i,
          isPrimary: img.isPrimary,
        }))
      )
    );

    const result = await saveArtworkAction({}, formData);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!publish) {
      router.push("/admin/tableaux?saved=1");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-300 px-4 py-4 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  const labelClass = "block text-base font-medium text-ink";
  const btnPrimary =
    "min-h-[52px] rounded-xl bg-ink px-6 py-4 text-base font-medium text-white hover:bg-stone-800 disabled:opacity-60";
  const btnSecondary =
    "min-h-[52px] rounded-xl border border-stone-300 px-6 py-4 text-base text-ink hover:border-ink disabled:opacity-60";

  return (
    <div className="space-y-8">
      <nav aria-label="Étapes" className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-4 py-2 text-sm ${
              i === step
                ? "bg-ink text-white"
                : i < step
                  ? "bg-stone-200 text-stone-700"
                  : "bg-stone-100 text-stone-400"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </nav>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-ink">Photos du tableau</h2>
          <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white p-8 text-center hover:border-accent">
            <span className="text-lg font-medium text-ink">Ajouter des photos</span>
            <span className="mt-2 text-sm text-stone-500">
              Appareil photo, galerie ou glisser-déposer
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-stone-200 bg-white"
              >
                <div className="relative aspect-[4/5] bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview || img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm">
                      Envoi…
                    </div>
                  )}
                  {img.isPrimary && (
                    <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs text-white">
                      Principale
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-3">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(img.id)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Photo principale
                    </button>
                  )}
                  {idx > 0 && (
                    <button type="button" onClick={() => moveImage(img.id, -1)} className="rounded-lg border px-3 py-2 text-sm">
                      ↑
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(img.id, 1)} className="rounded-lg border px-3 py-2 text-sm">
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-5">
          <h2 className="font-serif text-2xl text-ink">Informations principales</h2>
          <div>
            <label className={labelClass}>Titre</label>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea className={inputClass} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Prix (€)</label>
              <input className={inputClass} type="number" min="1" step="0.01" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Année</label>
              <input className={inputClass} type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Catégorie</label>
              <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">—</option>
                {ARTWORK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Technique</label>
              <select className={inputClass} value={technique} onChange={(e) => setTechnique(e.target.value)}>
                <option value="">—</option>
                {ARTWORK_TECHNIQUES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Support</label>
              <select className={inputClass} value={support} onChange={(e) => setSupport(e.target.value)}>
                <option value="">—</option>
                {ARTWORK_SUPPORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Orientation</label>
              <select className={inputClass} value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                <option value="">—</option>
                {ARTWORK_ORIENTATIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-base">
              <input type="checkbox" checked={isFramed} onChange={(e) => setIsFramed(e.target.checked)} className="h-5 w-5" />
              Encadré
            </label>
            <label className="flex items-center gap-3 text-base">
              <input type="checkbox" checked={hasCertificate} onChange={(e) => setHasCertificate(e.target.checked)} className="h-5 w-5" />
              Certificat d&apos;authenticité
            </label>
            <label className="flex items-center gap-3 text-base">
              <input type="checkbox" checked={isSigned} onChange={(e) => setIsSigned(e.target.checked)} className="h-5 w-5" />
              Signé
            </label>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <h2 className="font-serif text-2xl text-ink">Dimensions de l&apos;œuvre</h2>
          <p className="text-stone-600">Mesures en centimètres, poids en kilogrammes.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Largeur (cm)</label>
              <input className={inputClass} type="number" min="1" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Hauteur (cm)</label>
              <input className={inputClass} type="number" min="1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Profondeur (cm)</label>
              <input className={inputClass} type="number" min="0" step="0.1" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Poids approximatif (kg)</label>
              <input className={inputClass} type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <h2 className="font-serif text-2xl text-ink">Informations d&apos;expédition</h2>
          <button type="button" onClick={calculatePackage} className={btnSecondary}>
            Calculer les dimensions conseillées du colis
          </button>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Largeur colis (cm)</label>
              <input className={inputClass} type="number" value={packageWidthCm} onChange={(e) => setPackageWidthCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Hauteur colis (cm)</label>
              <input className={inputClass} type="number" value={packageHeightCm} onChange={(e) => setPackageHeightCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Profondeur colis (cm)</label>
              <input className={inputClass} type="number" value={packageDepthCm} onChange={(e) => setPackageDepthCm(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Poids colis (kg)</label>
              <input className={inputClass} type="number" step="0.1" value={packageWeightKg} onChange={(e) => setPackageWeightKg(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Type de livraison</label>
            <select className={inputClass} value={shippingClass} onChange={(e) => setShippingClass(e.target.value)}>
              <option value="STANDARD">Standard</option>
              <option value="OVERSIZE">Grand format</option>
              <option value="QUOTE_REQUIRED">Devis requis</option>
            </select>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-2xl text-ink">Vérification</h2>
          <p><strong>{title}</strong> — {priceEuros} €</p>
          <p className="text-stone-600">{description}</p>
          <p>{images.length} photo(s) · {widthCm}×{heightCm} cm · Colis {packageWidthCm}×{packageHeightCm}×{packageDepthCm} cm</p>
          <p className="text-sm text-stone-500">Livraison : {shippingClass}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        {step > 0 && (
          <button type="button" className={btnSecondary} onClick={() => setStep((s) => s - 1)}>
            Revenir en arrière
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              if (validateStep()) setStep((s) => s + 1);
            }}
          >
            Continuer
          </button>
        ) : (
          <>
            <button
              type="button"
              className={btnSecondary}
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              {saving ? "Enregistrement…" : "Enregistrer comme brouillon"}
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={saving}
              onClick={() => handleSave(true)}
            >
              {saving ? "Publication…" : "Publier le tableau"}
            </button>
          </>
        )}
        <Link href="/admin/tableaux" className={`${btnSecondary} inline-flex items-center justify-center`}>
          Annuler
        </Link>
      </div>
    </div>
  );
}
