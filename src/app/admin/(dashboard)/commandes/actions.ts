"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import { createShippingLabelForOrder } from "@/services/shipment.service";

export type ShipmentActionResult = {
  error?: string;
  labelUrl?: string;
  trackingNumber?: string;
};

export async function createLabelAction(
  orderId: string
): Promise<ShipmentActionResult> {
  await requireAdminUser();

  const result = await createShippingLabelForOrder(orderId);
  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${orderId}`);

  return {
    labelUrl: result.labelUrl,
    trackingNumber: result.trackingNumber,
  };
}
