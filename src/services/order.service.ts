import { prisma } from "@/lib/database/client";
import type { AddressInput } from "@/schemas/checkout.schema";
import { getShippingQuoteForArtwork } from "@/services/shipping-quote.service";

const RESERVATION_MINUTES = 30;

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CM-${y}${m}${d}-${rand}`;
}

export async function releaseExpiredReservations() {
  const now = new Date();
  const expired = await prisma.reservation.findMany({
    where: { expiresAt: { lt: now } },
    include: { artwork: true },
  });

  for (const res of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.delete({ where: { id: res.id } });
      if (res.artwork.status === "RESERVED") {
        await tx.artwork.update({
          where: { id: res.artworkId },
          data: { status: "PUBLISHED" },
        });
      }
      await tx.order.updateMany({
        where: {
          artworkId: res.artworkId,
          paymentStatus: "PENDING_PAYMENT",
          stripeCheckoutSessionId: res.stripeCheckoutSessionId ?? undefined,
        },
        data: { paymentStatus: "FAILED", cancelledAt: now },
      });
    });
  }
}

export type CreateCheckoutResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      reservationId: string;
      totalCents: number;
      shippingPriceCents: number;
      artworkPriceCents: number;
    }
  | { ok: false; error: string };

export async function createCheckoutOrder(
  artworkSlug: string,
  address: AddressInput
): Promise<CreateCheckoutResult> {
  await releaseExpiredReservations();

  const artwork = await prisma.artwork.findFirst({
    where: { slug: artworkSlug, status: "PUBLISHED" },
  });

  if (!artwork) {
    return { ok: false, error: "Ce tableau n'est plus disponible." };
  }

  if (artwork.shippingClass === "QUOTE_REQUIRED") {
    return {
      ok: false,
      error: "Ce tableau nécessite un devis de livraison. Contactez-nous.",
    };
  }

  const shipping = await getShippingQuoteForArtwork(artwork, address);
  if (!shipping.available) {
    return { ok: false, error: shipping.label };
  }

  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
  const orderNumber = generateOrderNumber();
  const totalCents = artwork.priceCents + shipping.priceCents;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const reserved = await tx.artwork.updateMany({
        where: { id: artwork.id, status: "PUBLISHED" },
        data: { status: "RESERVED" },
      });

      if (reserved.count === 0) {
        throw new Error("UNAVAILABLE");
      }

      const customer = await tx.customer.upsert({
        where: { email: address.email },
        create: {
          email: address.email,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone ?? null,
        },
        update: {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone ?? null,
        },
      });

      const shippingAddress = await tx.address.create({
        data: {
          customerId: customer.id,
          firstName: address.firstName,
          lastName: address.lastName,
          street1: address.street1,
          street2: address.street2 ?? null,
          postalCode: address.postalCode,
          city: address.city,
          countryCode: address.countryCode.toUpperCase(),
          phone: address.phone ?? null,
        },
      });

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          artworkId: artwork.id,
          shippingAddressId: shippingAddress.id,
          artworkPriceCents: artwork.priceCents,
          shippingPriceCents: shipping.priceCents,
          shippingMethodId: shipping.rate?.id ?? null,
          shippingCarrier: shipping.rate?.carrier ?? null,
          shippingServiceName: shipping.rate?.serviceName ?? shipping.label,
          totalCents,
          paymentStatus: "PENDING_PAYMENT",
        },
      });

      const reservation = await tx.reservation.create({
        data: {
          artworkId: artwork.id,
          expiresAt,
        },
      });

      return { order, reservation };
    });

    return {
      ok: true,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      reservationId: result.reservation.id,
      totalCents,
      shippingPriceCents: shipping.priceCents,
      artworkPriceCents: artwork.priceCents,
    };
  } catch (e) {
    if (e instanceof Error && e.message === "UNAVAILABLE") {
      return { ok: false, error: "Ce tableau vient d'être réservé par un autre client." };
    }
    return { ok: false, error: "Impossible de créer la commande. Réessayez." };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      artwork: { include: { images: true } },
      shippingAddress: true,
    },
  });
}

export async function attachStripeSessionToOrder(
  orderId: string,
  reservationId: string,
  sessionId: string
) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { stripeCheckoutSessionId: sessionId },
    }),
    prisma.reservation.update({
      where: { id: reservationId },
      data: { stripeCheckoutSessionId: sessionId },
    }),
  ]);
}
