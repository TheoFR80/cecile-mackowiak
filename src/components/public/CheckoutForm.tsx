"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatArtworkPrice } from "@/schemas/artwork.schema";

type ArtworkSummary = {
  slug: string;
  title: string;
  priceCents: number;
  imageUrl?: string;
};

type Props = {
  artwork: ArtworkSummary;
};

export function CheckoutForm({ artwork }: Props) {
  const [shippingCents, setShippingCents] = useState<number | null>(null);
  const [shippingLabel, setShippingLabel] = useState<string>("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street1: "",
    street2: "",
    postalCode: "",
    city: "",
    countryCode: "FR",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (["postalCode", "countryCode"].includes(field)) {
      setShippingCents(null);
    }
  }

  async function fetchShipping(): Promise<number | null> {
    if (!form.postalCode || form.postalCode.length < 4) {
      setError("Indiquez un code postal pour calculer la livraison.");
      return null;
    }
    setShippingLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkSlug: artwork.slug,
          countryCode: form.countryCode,
          postalCode: form.postalCode,
          street1: form.street1,
          city: form.city,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur livraison");
      if (!data.available) throw new Error(data.label);
      setShippingCents(data.priceCents);
      setShippingLabel(data.label);
      return data.priceCents as number;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setShippingCents(null);
      return null;
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let currentShipping = shippingCents;
    if (currentShipping === null) {
      currentShipping = await fetchShipping();
      if (currentShipping === null) return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, artworkSlug: artwork.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur commande");

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      window.location.href = `/commande/succes?order=${data.orderNumber}&pending=1`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setSubmitting(false);
    }
  }

  const totalCents =
    shippingCents !== null ? artwork.priceCents + shippingCents : null;

  const inputClass =
    "mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-5">
        <h2 className="font-serif text-2xl text-ink">Adresse de livraison</h2>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Prénom</label>
            <input
              required
              className={inputClass}
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nom</label>
            <input
              required
              className={inputClass}
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input
            type="email"
            required
            className={inputClass}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Téléphone</label>
          <input
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Adresse</label>
          <input
            required
            className={inputClass}
            value={form.street1}
            onChange={(e) => update("street1", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Complément</label>
          <input
            className={inputClass}
            value={form.street2}
            onChange={(e) => update("street2", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Code postal</label>
            <input
              required
              className={inputClass}
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ville</label>
            <input
              required
              className={inputClass}
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Pays</label>
          <select
            className={inputClass}
            value={form.countryCode}
            onChange={(e) => update("countryCode", e.target.value)}
          >
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="DE">Allemagne</option>
            <option value="ES">Espagne</option>
            <option value="IT">Italie</option>
            <option value="LU">Luxembourg</option>
            <option value="NL">Pays-Bas</option>
            <option value="PT">Portugal</option>
            <option value="AT">Autriche</option>
          </select>
        </div>
        <button
          type="button"
          onClick={fetchShipping}
          disabled={shippingLoading}
          className="min-h-[48px] rounded-xl border border-stone-300 px-6 py-3 text-sm hover:border-ink disabled:opacity-60"
        >
          {shippingLoading ? "Calcul…" : "Calculer les frais de livraison"}
        </button>
      </div>

      <div className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-serif text-2xl text-ink">Récapitulatif</h2>
        <div className="mt-6 flex gap-4">
          {artwork.imageUrl && (
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={artwork.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div>
            <p className="font-medium text-ink">{artwork.title}</p>
            <p className="mt-1 text-accent">
              {formatArtworkPrice(artwork.priceCents)}
            </p>
          </div>
        </div>
        <dl className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Tableau</dt>
            <dd>{formatArtworkPrice(artwork.priceCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">
              {shippingLabel || "Livraison"}
            </dt>
            <dd>
              {shippingCents !== null
                ? formatArtworkPrice(shippingCents)
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-medium">
            <dt>Total</dt>
            <dd className="text-accent">
              {totalCents !== null ? formatArtworkPrice(totalCents) : "—"}
            </dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full min-h-[52px] rounded-xl bg-ink py-4 text-base font-medium text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {submitting ? "Redirection…" : "Payer par carte bancaire"}
        </button>
        <p className="mt-4 text-center text-xs text-stone-400">
          Le tableau est réservé 30 minutes le temps du paiement.
        </p>
        <Link
          href={`/tableaux/${artwork.slug}`}
          className="mt-4 block text-center text-sm text-accent hover:underline"
        >
          ← Retour à l&apos;œuvre
        </Link>
      </div>
    </form>
  );
}
