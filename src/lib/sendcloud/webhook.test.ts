import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { eurosToCents } from "@/lib/sendcloud/mappers";
import {
  mapSendcloudStatus,
  verifySendcloudSignature,
} from "@/lib/sendcloud/webhook";

describe("sendcloud webhook", () => {
  it("mappe les statuts connus", () => {
    expect(mapSendcloudStatus("IN_TRANSIT")).toBe("IN_TRANSIT");
    expect(mapSendcloudStatus("DELIVERED")).toBe("DELIVERED");
    expect(mapSendcloudStatus("READY_TO_SEND")).toBe("LABEL_CREATED");
  });

  it("vérifie la signature HMAC", () => {
    const secret = "test-secret";
    const body = '{"parcel":{"id":1}}';
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    process.env.SENDCLOUD_WEBHOOK_SECRET = secret;
    expect(verifySendcloudSignature(body, signature)).toBe(true);
    expect(verifySendcloudSignature(body, "invalid")).toBe(false);
    delete process.env.SENDCLOUD_WEBHOOK_SECRET;
  });
});

describe("sendcloud mappers", () => {
  it("convertit euros en centimes", () => {
    expect(eurosToCents("12.50")).toBe(1250);
    expect(eurosToCents("0")).toBe(0);
  });
});
