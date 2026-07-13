"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import {
  packingChecklistFieldSchema,
  type PackingChecklistField,
} from "@/schemas/packing.schema";
import {
  markPackageReady,
  updateChecklistField,
} from "@/services/packing.service";

export type PackingActionResult = { error?: string; success?: boolean };

export async function updateChecklistFieldAction(
  orderId: string,
  field: PackingChecklistField,
  value: boolean
): Promise<PackingActionResult> {
  await requireAdminUser();

  const parsed = packingChecklistFieldSchema.safeParse(field);
  if (!parsed.success) return { error: "Champ invalide" };

  try {
    await updateChecklistField(orderId, parsed.data, value);
    revalidatePath(`/admin/expeditions/${orderId}`);
    revalidatePath("/admin/expeditions");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function markPackageReadyAction(
  orderId: string
): Promise<PackingActionResult> {
  const { user } = await requireAdminUser();

  try {
    await markPackageReady(orderId, user.id);
    revalidatePath(`/admin/expeditions/${orderId}`);
    revalidatePath(`/admin/commandes/${orderId}`);
    revalidatePath("/admin/expeditions");
    revalidatePath("/admin/commandes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }
}
