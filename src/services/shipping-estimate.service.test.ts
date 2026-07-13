import { describe, expect, it } from "vitest";
import { estimateShippingPrice } from "@/services/shipping-estimate.service";

const baseArtwork = {
  shippingClass: "STANDARD" as const,
  packageWeightKg: 2,
  priceCents: 50000,
};

describe("estimateShippingPrice", () => {
  it("refuse les devis manuels", () => {
    const result = estimateShippingPrice(
      { ...baseArtwork, shippingClass: "QUOTE_REQUIRED" },
      "FR"
    );
    expect(result.available).toBe(false);
  });

  it("refuse hors zone UE", () => {
    const result = estimateShippingPrice(baseArtwork, "US");
    expect(result.available).toBe(false);
  });

  it("applique le tarif France standard", () => {
    const result = estimateShippingPrice(baseArtwork, "FR");
    expect(result.available).toBe(true);
    expect(result.priceCents).toBe(1500);
  });

  it("majore le grand format", () => {
    const result = estimateShippingPrice(
      { ...baseArtwork, shippingClass: "OVERSIZE" },
      "FR"
    );
    expect(result.priceCents).toBe(1500 + 3500);
  });

  it("majore les colis lourds", () => {
    const result = estimateShippingPrice(
      { ...baseArtwork, packageWeightKg: 12 },
      "FR"
    );
    expect(result.priceCents).toBe(1500 + 400);
  });
});
