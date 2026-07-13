import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/database/client";
import { getStripe } from "@/lib/stripe/client";
import { releaseExpiredReservations } from "@/services/order.service";
import { notifyOrderPaid } from "@/services/notification.service";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider: "STRIPE",
        externalEventId: event.id,
      },
    },
  });

  if (existing?.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await prisma.webhookEvent.upsert({
    where: {
      provider_externalEventId: {
        provider: "STRIPE",
        externalEventId: event.id,
      },
    },
    create: {
      provider: "STRIPE",
      externalEventId: event.id,
      eventType: event.type,
      payload: JSON.parse(JSON.stringify(event)),
    },
    update: {},
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              paidAt: new Date(),
              stripePaymentIntentId:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
            },
          });
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (order) {
            await tx.artwork.update({
              where: { id: order.artworkId },
              data: { status: "SOLD" },
            });
            await tx.reservation.deleteMany({
              where: { artworkId: order.artworkId },
            });
          }
        });
        await notifyOrderPaid(orderId);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (order && order.paymentStatus === "PENDING_PAYMENT") {
          await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "FAILED", cancelledAt: new Date() },
          });
          await prisma.artwork.update({
            where: { id: order.artworkId, status: "RESERVED" },
            data: { status: "PUBLISHED" },
          });
          await prisma.reservation.deleteMany({
            where: { artworkId: order.artworkId },
          });
        }
      }
    }

    await releaseExpiredReservations();

    await prisma.webhookEvent.update({
      where: {
        provider_externalEventId: {
          provider: "STRIPE",
          externalEventId: event.id,
        },
      },
      data: { processed: true, processedAt: new Date() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    await prisma.webhookEvent.update({
      where: {
        provider_externalEventId: {
          provider: "STRIPE",
          externalEventId: event.id,
        },
      },
      data: { errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
