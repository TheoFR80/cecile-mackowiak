"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ShippingClass } from "@prisma/client";
import { requireAdminUser } from "@/lib/auth/session";
import {
  artworkWizardSchema,
} from "@/schemas/artwork.schema";
import {
  createDraftArtwork,
  getArtworkById,
  updateArtworkStatus,
  upsertArtworkFromWizard,
} from "@/services/artwork.service";

export type ActionResult = {
  error?: string;
  artworkId?: string;
};

export async function createDraftArtworkAction(): Promise<ActionResult> {
  await requireAdminUser();
  try {
    const artwork = await createDraftArtwork();
    return { artworkId: artwork.id };
  } catch {
    return { error: "Impossible de créer le brouillon." };
  }
}

export async function saveArtworkAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdminUser();

  const artworkId = String(formData.get("artworkId") ?? "") || null;
  const publish = formData.get("publish") === "true";

  let images: unknown;
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    return { error: "Photos invalides." };
  }

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    priceEuros: formData.get("priceEuros"),
    year: formData.get("year") || null,
    category: formData.get("category") || null,
    technique: formData.get("technique") || null,
    support: formData.get("support") || null,
    orientation: formData.get("orientation") || null,
    isFramed: formData.get("isFramed") === "true",
    hasCertificate: formData.get("hasCertificate") === "true",
    isSigned: formData.get("isSigned") !== "false",
    widthCm: formData.get("widthCm"),
    heightCm: formData.get("heightCm"),
    depthCm: formData.get("depthCm") || 0,
    weightKg: formData.get("weightKg"),
    packageWidthCm: formData.get("packageWidthCm"),
    packageHeightCm: formData.get("packageHeightCm"),
    packageDepthCm: formData.get("packageDepthCm"),
    packageWeightKg: formData.get("packageWeightKg"),
    shippingClass: formData.get("shippingClass") || "STANDARD",
    images,
  };

  const parsed = artworkWizardSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Formulaire incomplet.";
    return { error: first };
  }

  try {
    const artwork = await upsertArtworkFromWizard(
      artworkId,
      {
        ...parsed.data,
        shippingClass: parsed.data.shippingClass as ShippingClass,
      },
      publish ? "PUBLISHED" : "DRAFT"
    );

    revalidatePath("/admin");
    revalidatePath("/admin/tableaux");
    revalidatePath("/galerie");

    if (publish) {
      redirect(`/admin/tableaux?published=1`);
    }

    return { artworkId: artwork.id };
  } catch {
    return { error: "Enregistrement impossible. Réessayez." };
  }
}

export async function changeArtworkStatusAction(
  id: string,
  status: "PUBLISHED" | "DRAFT" | "SOLD" | "ARCHIVED"
): Promise<ActionResult> {
  await requireAdminUser();
  try {
    await updateArtworkStatus(id, status);
    revalidatePath("/admin/tableaux");
    revalidatePath("/admin");
    return {};
  } catch {
    return { error: "Action impossible." };
  }
}

export async function loadArtworkForEdit(id: string) {
  await requireAdminUser();
  return getArtworkById(id);
}
