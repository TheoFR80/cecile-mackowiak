import { NextResponse } from "next/server";
import { checkoutSchema } from "@/schemas/checkout.schema";
import {
  attachStripeSessionToOrder,
  createCheckoutOrder,
} from "@/services/order.service";
import { notifyOrderPending } from "@/services/notification.service";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { prisma } from "@/lib/database/client";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Formulaire incomplet" },
      { status: 400 }
    );
  }

  const checkout = await createCheckoutOrder(
    parsed.data.artworkSlug,
    parsed.data
  );

  if (!checkout.ok) {
    return NextResponse.json({ error: checkout.error }, { status: 409 });
  }

  if (!isStripeConfigured()) {
    await notifyOrderPending(checkout.orderId);
    return NextResponse.json({
      mode: "pending",
      orderNumber: checkout.orderNumber,
      message:
        "Commande enregistrée. Le paiement en ligne sera activé très prochainement.",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: checkout.orderId },
    include: { artwork: { include: { images: { orderBy: { position: "asc" } } } } },
  });

  if (!order?.artwork) {
    return NextResponse.json({ error: "Commande invalide" }, { status: 500 });
  }

  const artwork = order.artwork;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: parsed.data.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: checkout.artworkPriceCents,
          product_data: {
            name: artwork?.title ?? "Tableau original",
            images: artwork?.images[0]?.url ? [artwork.images[0].url] : [],
          },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          unit_amount: checkout.shippingPriceCents,
          product_data: { name: "Frais de livraison" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: checkout.orderId,
      orderNumber: checkout.orderNumber,
      artworkId: artwork?.id ?? "",
    },
    success_url: `${siteUrl}/commande/succes?order=${checkout.orderNumber}`,
    cancel_url: `${siteUrl}/commande/annulee?order=${checkout.orderNumber}`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  await attachStripeSessionToOrder(
    checkout.orderId,
    checkout.reservationId,
    session.id
  );

  return NextResponse.json({
    mode: "stripe",
    url: session.url,
    orderNumber: checkout.orderNumber,
  });
}
