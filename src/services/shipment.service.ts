import { prisma } from "@/lib/database/client";
import { isSendcloudConfigured } from "@/lib/sendcloud/client";
import {
  addressInputToShippingAddress,
  artworkToPackage,
  buildShippingRateInput,
} from "@/lib/sendcloud/mappers";
import { SendcloudShippingProvider } from "@/lib/sendcloud/provider";
import { getSenderAddress } from "@/lib/sendcloud/sender-config";
import { getShippingProvider } from "@/lib/shipping";
import { isPackageReadyForLabel } from "@/lib/packing/checklist-utils";
import { mapSendcloudStatus } from "@/lib/sendcloud/webhook";
import {
  notifyOrderDelivered,
  notifyOrderShipped,
} from "@/services/notification.service";

export type CreateLabelResult =
  | { ok: true; labelUrl?: string; trackingNumber?: string }
  | { ok: false; error: string };

export async function listOrdersForAdmin() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      shippingAddress: true,
      shipment: true,
      customer: true,
    },
    take: 100,
  });
}

export async function getOrderForAdmin(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      artwork: { include: { images: true } },
      shippingAddress: true,
      shipment: true,
      customer: true,
      packingChecklist: { include: { photos: true } },
    },
  });
}

export async function createShippingLabelForOrder(
  orderId: string
): Promise<CreateLabelResult> {
  const order = await getOrderForAdmin(orderId);

  if (!order) return { ok: false, error: "Commande introuvable" };
  if (order.paymentStatus !== "PAID") {
    return { ok: false, error: "Le paiement doit être confirmé avant l'étiquette." };
  }
  if (!isPackageReadyForLabel(order.packingChecklist)) {
    return {
      ok: false,
      error: "Validez d'abord la checklist emballage (« Le colis est prêt »).",
    };
  }
  if (order.shipment?.labelUrl) {
    return {
      ok: true,
      labelUrl: order.shipment.labelUrl,
      trackingNumber: order.shipment.trackingNumber ?? undefined,
    };
  }
  if (!order.shippingAddress) {
    return { ok: false, error: "Adresse de livraison manquante." };
  }
  if (!order.shippingMethodId && isSendcloudConfigured()) {
    return {
      ok: false,
      error: "Option d'expédition introuvable — recalculez la livraison.",
    };
  }

  const to = addressInputToShippingAddress({
    firstName: order.shippingAddress.firstName,
    lastName: order.shippingAddress.lastName,
    email: order.customer?.email ?? "client@example.com",
    phone: order.shippingAddress.phone ?? undefined,
    street1: order.shippingAddress.street1,
    street2: order.shippingAddress.street2 ?? undefined,
    postalCode: order.shippingAddress.postalCode,
    city: order.shippingAddress.city,
    countryCode: order.shippingAddress.countryCode,
  });

  const pkg = artworkToPackage(order.artwork);
  const from = getSenderAddress();

  const provider =
    order.artwork.shippingClass === "QUOTE_REQUIRED"
      ? getShippingProvider("manual_quote")
      : isSendcloudConfigured()
        ? new SendcloudShippingProvider()
        : getShippingProvider("manual_quote");

  let shippingMethodId = order.shippingMethodId;

  if (!shippingMethodId && provider.name === "sendcloud") {
    const rate = await (provider as SendcloudShippingProvider).getBestRate(
      buildShippingRateInput(order.artwork, from, to)
    );
    if (!rate) {
      return { ok: false, error: "Aucune option Sendcloud disponible pour ce colis." };
    }
    shippingMethodId = rate.id;
  }

  if (!shippingMethodId) {
    return {
      ok: false,
      error: "Devis manuel requis — contactez le transporteur.",
    };
  }

  const result = await provider.createShipment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    from,
    to,
    package: pkg,
    shippingMethodId,
    reference: (order.artworkPriceCents / 100).toFixed(2),
  });

  await prisma.$transaction([
    prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        provider:
          provider.name === "sendcloud" ? "SENDCLOUD" : "MANUAL_QUOTE",
        providerShipmentId: result.providerShipmentId,
        carrier: order.shippingCarrier ?? result.carrier,
        serviceName: order.shippingServiceName ?? result.serviceName,
        shippingMethodId,
        trackingNumber: result.trackingNumber ?? null,
        trackingUrl: result.trackingUrl ?? null,
        labelUrl: result.labelUrl ?? null,
        status: "LABEL_CREATED",
        priceCents: order.shippingPriceCents,
      },
      update: {
        providerShipmentId: result.providerShipmentId,
        carrier: order.shippingCarrier ?? result.carrier,
        serviceName: order.shippingServiceName ?? result.serviceName,
        shippingMethodId,
        trackingNumber: result.trackingNumber ?? null,
        trackingUrl: result.trackingUrl ?? null,
        labelUrl: result.labelUrl ?? null,
        status: "LABEL_CREATED",
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: "LABEL_CREATED",
        fulfillmentStatus: "READY",
      },
    }),
  ]);

  await notifyOrderShipped(order.id);

  return {
    ok: true,
    labelUrl: result.labelUrl,
    trackingNumber: result.trackingNumber,
  };
}

export async function handleSendcloudParcelWebhook(payload: {
  parcel?: { id?: number; status?: { code?: string; message?: string } };
  parcel_id?: number;
  status?: { id?: number; message?: string };
}) {
  const parcelId = payload.parcel?.id ?? payload.parcel_id;
  if (!parcelId) return;

  const shipment = await prisma.shipment.findFirst({
    where: { providerShipmentId: String(parcelId) },
  });
  if (!shipment) return;

  const statusCode =
    payload.parcel?.status?.code ??
    payload.status?.message ??
    payload.parcel?.status?.message;

  const internalStatus = mapSendcloudStatus(statusCode);

  const orderUpdate: {
    shippingStatus: typeof internalStatus;
    fulfillmentStatus?: "DELIVERED" | "SHIPPED";
  } = { shippingStatus: internalStatus };

  if (internalStatus === "DELIVERED") {
    orderUpdate.fulfillmentStatus = "DELIVERED";
  } else if (internalStatus === "IN_TRANSIT") {
    orderUpdate.fulfillmentStatus = "SHIPPED";
  }

  await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: internalStatus },
    }),
    prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        providerStatus: statusCode ?? "unknown",
        internalStatus,
        message: payload.parcel?.status?.message ?? payload.status?.message,
        eventDate: new Date(),
        payload: JSON.parse(JSON.stringify(payload)),
      },
    }),
    prisma.order.update({
      where: { id: shipment.orderId },
      data: orderUpdate,
    }),
  ]);

  if (internalStatus === "DELIVERED") {
    await notifyOrderDelivered(shipment.orderId);
  }
}
