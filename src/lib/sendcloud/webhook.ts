import { createHmac, timingSafeEqual } from "crypto";
import type { ShippingStatus } from "@prisma/client";

export function verifySendcloudSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.SENDCLOUD_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signatureHeader, "utf8")
    );
  } catch {
    return expected === signatureHeader;
  }
}

const STATUS_MAP: Record<string, ShippingStatus> = {
  READY_TO_SEND: "LABEL_CREATED",
  ANNOUNCED: "LABEL_CREATED",
  ANNOUNCING: "LABEL_CREATED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  CANCELLED: "CANCELLED",
  RETURNED: "RETURNED",
};

export function mapSendcloudStatus(code?: string): ShippingStatus {
  if (!code) return "PENDING";
  return STATUS_MAP[code.toUpperCase()] ?? "IN_TRANSIT";
}
