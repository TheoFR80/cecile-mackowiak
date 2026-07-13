import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/client";
import { verifySendcloudSignature } from "@/lib/sendcloud/webhook";
import { handleSendcloudParcelWebhook } from "@/services/shipment.service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("Sendcloud-Signature");

  if (
    process.env.SENDCLOUD_WEBHOOK_SECRET &&
    !verifySendcloudSignature(rawBody, signature)
  ) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const eventId =
    (payload.id as string | undefined) ??
    (payload.parcel as { id?: number } | undefined)?.id?.toString() ??
    `${Date.now()}`;

  const existing = await prisma.webhookEvent.findUnique({
    where: {
      provider_externalEventId: {
        provider: "SENDCLOUD",
        externalEventId: eventId,
      },
    },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  await handleSendcloudParcelWebhook(
    payload as Parameters<typeof handleSendcloudParcelWebhook>[0]
  );

  await prisma.webhookEvent.create({
    data: {
      provider: "SENDCLOUD",
      externalEventId: eventId,
      eventType: "parcel.status_changed",
      payload: JSON.parse(rawBody),
      processedAt: new Date(),
    },
  });

  return NextResponse.json({ received: true });
}
