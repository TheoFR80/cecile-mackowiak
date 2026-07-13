import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArtworkGallery } from "@/components/public/ArtworkGallery";
import { formatArtworkPrice } from "@/schemas/artwork.schema";
import {
  formatDimensions,
  getPublishedArtworkBySlug,
} from "@/services/public-artwork.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);
  if (!artwork) return { title: "Œuvre introuvable" };

  const primary = artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];

  return {
    title: `${artwork.title} — Cécile Mackowiak`,
    description: artwork.description.slice(0, 160),
    openGraph: {
      title: artwork.title,
      description: artwork.description.slice(0, 160),
      images: primary?.url ? [{ url: primary.url }] : [],
      type: "website",
    },
  };
}

const SHIPPING_LABELS: Record<string, string> = {
  STANDARD: "Livraison standard calculée au moment de l'achat",
  OVERSIZE: "Grand format — tarif sur devis transporteur",
  QUOTE_REQUIRED: "Devis de livraison sur demande",
};

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);
  if (!artwork) notFound();

  const dimensions = formatDimensions(artwork);
  const packageDims = formatDimensions({
    widthCm: artwork.packageWidthCm,
    heightCm: artwork.packageHeightCm,
    depthCm: artwork.packageDepthCm,
  });

  const contactHref = `/contact?tableau=${encodeURIComponent(artwork.title)}&slug=${artwork.slug}`;

  return (
    <article className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/galerie"
        className="text-sm text-accent hover:underline"
      >
        ← Retour à la galerie
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <ArtworkGallery images={artwork.images} title={artwork.title} />

        <div>
          <h1 className="font-serif text-4xl text-ink">{artwork.title}</h1>
          {artwork.year && (
            <p className="mt-2 text-stone-500">{artwork.year}</p>
          )}
          <p className="mt-6 text-2xl font-medium text-accent">
            {formatArtworkPrice(artwork.priceCents)}
          </p>

          <p className="mt-8 leading-relaxed text-stone-600">
            {artwork.description}
          </p>

          <dl className="mt-10 space-y-3 border-t border-stone-200 pt-8 text-sm">
            {artwork.technique && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Technique</dt>
                <dd className="text-ink">{artwork.technique}</dd>
              </div>
            )}
            {artwork.support && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Support</dt>
                <dd className="text-ink">{artwork.support}</dd>
              </div>
            )}
            {dimensions && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Dimensions</dt>
                <dd className="text-ink">{dimensions}</dd>
              </div>
            )}
            {artwork.weightKg && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Poids</dt>
                <dd className="text-ink">{artwork.weightKg} kg</dd>
              </div>
            )}
            {packageDims && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-500">Colis</dt>
                <dd className="text-ink">{packageDims}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Encadré</dt>
              <dd className="text-ink">{artwork.isFramed ? "Oui" : "Non"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Certificat</dt>
              <dd className="text-ink">
                {artwork.hasCertificate ? "Inclus" : "Non"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">Livraison</dt>
              <dd className="text-right text-ink">
                {SHIPPING_LABELS[artwork.shippingClass] ?? artwork.shippingClass}
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {artwork.shippingClass === "QUOTE_REQUIRED" ? (
              <Link
                href={contactHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-ink px-8 text-sm text-white hover:bg-stone-800"
              >
                Demander un devis de livraison
              </Link>
            ) : (
              <Link
                href={`/commande/${artwork.slug}`}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-ink px-8 text-sm text-white hover:bg-stone-800"
              >
                Acheter ce tableau
              </Link>
            )}
            <Link
              href={contactHref}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-stone-300 px-8 text-sm text-ink hover:border-ink"
            >
              Demander un renseignement
            </Link>
            <Link
              href="/livraison"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-stone-300 px-8 text-sm text-stone-600 hover:border-ink"
            >
              En savoir plus sur la livraison
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
