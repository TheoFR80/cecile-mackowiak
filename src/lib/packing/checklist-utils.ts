import type { Artwork, PackingChecklist, PackingPhoto } from "@prisma/client";
import {
  CHECKLIST_ITEMS,
  PHOTO_TYPES,
} from "@/schemas/packing.schema";

export function getApplicableChecklistItems(
  hasCertificate: boolean,
  options: { includeAfterLabel?: boolean } = {}
) {
  return CHECKLIST_ITEMS.filter((item) => {
    if (item.afterLabel && !options.includeAfterLabel) return false;
    if (item.requiresCertificate && !hasCertificate) return false;
    return true;
  });
}

export function isChecklistComplete(
  checklist: PackingChecklist,
  artwork: Pick<Artwork, "hasCertificate">,
  options: { includeAfterLabel?: boolean } = {}
): boolean {
  const items = getApplicableChecklistItems(artwork.hasCertificate, options);

  for (const item of items) {
    if (!checklist[item.key]) return false;
  }

  return true;
}

export function hasRequiredPhotos(photos: PackingPhoto[]): boolean {
  const uploaded = new Set(photos.map((p) => p.type));
  return PHOTO_TYPES.filter((p) => p.required).every((p) =>
    uploaded.has(p.type)
  );
}

export function isPackageReadyForLabel(
  checklist: Pick<PackingChecklist, "completedAt"> | null | undefined
): boolean {
  return Boolean(checklist?.completedAt);
}
