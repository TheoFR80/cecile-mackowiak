import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/public/CheckoutForm";
import { getPublishedArtworkBySlug } from "@/services/public-artwork.service";
import { releaseExpiredReservations } from "@/services/order.service";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);
  return {
    title: artwork
      ? `Commander — ${artwork.title}`
      : "Commande — Cécile Mackowiak",
  };
}

export default async function CommandePage({ params }: Props) {
  await releaseExpiredReservations();
  const { slug } = await params;
  const artwork = await getPublishedArtworkBySlug(slug);

  if (!artwork) notFound();

  if (artwork.shippingClass === "QUOTE_REQUIRED") {
    redirect(
      `/contact?tableau=${encodeURIComponent(artwork.title)}&slug=${artwork.slug}`
    );
  }

  const primary = artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">Commander</h1>
      <p className="mt-2 text-stone-600">{artwork.title}</p>
      <div className="mt-10">
        <CheckoutForm
          artwork={{
            slug: artwork.slug,
            title: artwork.title,
            priceCents: artwork.priceCents,
            imageUrl: primary?.url,
          }}
        />
      </div>
    </section>
  );
}
