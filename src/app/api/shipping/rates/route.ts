import { NextResponse } from "next/server";
import { shippingRateRequestSchema } from "@/schemas/checkout.schema";
import { getPublishedArtworkBySlug } from "@/services/public-artwork.service";
import { getShippingQuoteForArtwork } from "@/services/shipping-quote.service";
import { releaseExpiredReservations } from "@/services/order.service";

export async function POST(request: Request) {
  await releaseExpiredReservations();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = shippingRateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const artwork = await getPublishedArtworkBySlug(parsed.data.artworkSlug);
  if (!artwork) {
    return NextResponse.json(
      { error: "Œuvre indisponible" },
      { status: 404 }
    );
  }

  const estimate = await getShippingQuoteForArtwork(artwork, {
    countryCode: parsed.data.countryCode,
    postalCode: parsed.data.postalCode,
    street1: parsed.data.street1 ?? "1 rue Example",
    city: parsed.data.city ?? "Paris",
  });

  return NextResponse.json({
    priceCents: estimate.priceCents,
    currency: estimate.currency,
    label: estimate.label,
    available: estimate.available,
    provider: estimate.provider,
    carrier: estimate.rate?.carrier ?? null,
    serviceName: estimate.rate?.serviceName ?? null,
    formatted: estimate.available
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(estimate.priceCents / 100)
      : null,
  });
}
