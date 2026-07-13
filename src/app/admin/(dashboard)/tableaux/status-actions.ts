"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import { updateArtworkStatus } from "@/services/artwork.service";

export async function publishArtworkFormAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("id"));
  await updateArtworkStatus(id, "PUBLISHED");
  revalidatePath("/admin/tableaux");
  revalidatePath("/admin");
}

export async function hideArtworkFormAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("id"));
  await updateArtworkStatus(id, "DRAFT");
  revalidatePath("/admin/tableaux");
}

export async function markSoldArtworkFormAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("id"));
  await updateArtworkStatus(id, "SOLD");
  revalidatePath("/admin/tableaux");
}
