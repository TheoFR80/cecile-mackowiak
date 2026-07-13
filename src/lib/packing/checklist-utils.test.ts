import { describe, expect, it } from "vitest";
import {
  getApplicableChecklistItems,
  hasRequiredPhotos,
  isChecklistComplete,
  isPackageReadyForLabel,
} from "@/lib/packing/checklist-utils";
import type { PackingChecklist, PackingPhoto } from "@prisma/client";

function emptyChecklist(
  overrides: Partial<PackingChecklist> = {}
): PackingChecklist {
  return {
    id: "chk_1",
    orderId: "ord_1",
    artworkPhotographed: false,
    certificateAdded: false,
    cornersProtected: false,
    surfaceProtected: false,
    innerProtectionAdded: false,
    reinforcedBoxUsed: false,
    emptySpacesFilled: false,
    packageClosed: false,
    labelAttached: false,
    completedAt: null,
    completedByUserId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("checklist-utils", () => {
  it("exclut le certificat si l'œuvre n'en a pas", () => {
    const items = getApplicableChecklistItems(false);
    expect(items.some((i) => i.key === "certificateAdded")).toBe(false);
  });

  it("inclut le certificat si l'œuvre en a un", () => {
    const items = getApplicableChecklistItems(true);
    expect(items.some((i) => i.key === "certificateAdded")).toBe(true);
  });

  it("exclut labelAttached avant création d'étiquette", () => {
    const items = getApplicableChecklistItems(false);
    expect(items.some((i) => i.key === "labelAttached")).toBe(false);
  });

  it("détecte checklist incomplète", () => {
    const checklist = emptyChecklist({ artworkPhotographed: true });
    expect(isChecklistComplete(checklist, { hasCertificate: false })).toBe(false);
  });

  it("détecte checklist complète sans certificat", () => {
    const checklist = emptyChecklist({
      artworkPhotographed: true,
      cornersProtected: true,
      surfaceProtected: true,
      innerProtectionAdded: true,
      reinforcedBoxUsed: true,
      emptySpacesFilled: true,
      packageClosed: true,
    });
    expect(isChecklistComplete(checklist, { hasCertificate: false })).toBe(true);
  });

  it("exige les photos obligatoires", () => {
    const photos: PackingPhoto[] = [
      {
        id: "p1",
        packingChecklistId: "chk_1",
        type: "ARTWORK_BEFORE_PACKING",
        url: "https://example.com/1.jpg",
        createdAt: new Date(),
      },
    ];
    expect(hasRequiredPhotos(photos)).toBe(false);

    photos.push({
      id: "p2",
      packingChecklistId: "chk_1",
      type: "SEALED_PACKAGE",
      url: "https://example.com/2.jpg",
      createdAt: new Date(),
    });
    expect(hasRequiredPhotos(photos)).toBe(true);
  });

  it("colis prêt uniquement si completedAt renseigné", () => {
    expect(isPackageReadyForLabel(null)).toBe(false);
    expect(isPackageReadyForLabel(emptyChecklist())).toBe(false);
    expect(
      isPackageReadyForLabel(emptyChecklist({ completedAt: new Date() }))
    ).toBe(true);
  });
});
