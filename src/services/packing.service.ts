import type { Artwork, PackingChecklist, PackingPhoto } from "@prisma/client";
import { prisma } from "@/lib/database/client";
import {
  getApplicableChecklistItems,
  hasRequiredPhotos,
  isChecklistComplete,
  isPackageReadyForLabel,
} from "@/lib/packing/checklist-utils";

import type { PackingChecklistField, PackingPhotoType } from "@/schemas/packing.schema";
import { notifyPackageReady } from "@/services/notification.service";

export async function getOrCreateChecklist(
  orderId: string
): Promise<ChecklistWithPhotos> {
  const existing = await prisma.packingChecklist.findUnique({
    where: { orderId },
    include: { photos: true },
  });

  if (existing) return existing;

  return prisma.packingChecklist.create({
    data: { orderId },
    include: { photos: true },
  });
}

export type ChecklistWithPhotos = PackingChecklist & { photos: PackingPhoto[] };

export {
  getApplicableChecklistItems,
  hasRequiredPhotos,
  isChecklistComplete,
  isPackageReadyForLabel,
} from "@/lib/packing/checklist-utils";

export async function listOrdersAwaitingPacking() {
  return prisma.order.findMany({
    where: {
      paymentStatus: "PAID",
      OR: [
        { packingChecklist: null },
        { packingChecklist: { completedAt: null } },
      ],
    },
    orderBy: { paidAt: "asc" },
    include: {
      artwork: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      packingChecklist: { include: { photos: true } },
      customer: true,
    },
    take: 50,
  });
}

export async function getPackingOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      artwork: { include: { images: true } },
      packingChecklist: { include: { photos: true } },
      shippingAddress: true,
      shipment: true,
      customer: true,
    },
  });
}

export async function updateChecklistField(
  orderId: string,
  field: PackingChecklistField,
  value: boolean
) {
  const checklist = await getOrCreateChecklist(orderId);

  if (checklist.completedAt) {
    throw new Error("Checklist déjà validée — modification impossible.");
  }

  return prisma.packingChecklist.update({
    where: { id: checklist.id },
    data: { [field]: value },
    include: { photos: true },
  });
}

export async function addPackingPhoto(
  orderId: string,
  type: PackingPhotoType,
  url: string
) {
  const checklist = await getOrCreateChecklist(orderId);

  if (checklist.completedAt) {
    throw new Error("Checklist déjà validée — modification impossible.");
  }

  await prisma.packingPhoto.deleteMany({
    where: { packingChecklistId: checklist.id, type },
  });

  return prisma.packingPhoto.create({
    data: {
      packingChecklistId: checklist.id,
      type,
      url,
    },
  });
}

export async function markPackageReady(orderId: string, userId: string) {
  const order = await getPackingOrder(orderId);
  if (!order) throw new Error("Commande introuvable");
  if (order.paymentStatus !== "PAID") {
    throw new Error("Commande non payée.");
  }

  const checklist = order.packingChecklist ?? (await getOrCreateChecklist(orderId));

  if (!isChecklistComplete(checklist, order.artwork)) {
    throw new Error("Cochez toutes les étapes de la checklist.");
  }

  if (!hasRequiredPhotos(checklist.photos)) {
    throw new Error("Ajoutez les photos obligatoires (avant emballage + colis fermé).");
  }

  await prisma.$transaction([
    prisma.packingChecklist.update({
      where: { id: checklist.id },
      data: {
        completedAt: new Date(),
        completedByUserId: userId,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: "READY" },
    }),
  ]);

  await notifyPackageReady(orderId);

  return { ok: true as const };
}
