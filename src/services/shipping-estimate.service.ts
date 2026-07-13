import type { Artwork, ShippingClass } from "@prisma/client";

const BASE_FRANCE_CENTS = 1500;
const BASE_EU_CENTS = 2500;
const OVERSIZE_SURCHARGE_CENTS = 3500;

export type ShippingEstimate = {
  priceCents: number;
  currency: string;
  label: string;
  available: boolean;
};

export function estimateShippingPrice(
  artwork: Pick<
    Artwork,
    "shippingClass" | "packageWeightKg" | "priceCents"
  >,
  countryCode: string
): ShippingEstimate {
  if (artwork.shippingClass === "QUOTE_REQUIRED") {
    return {
      priceCents: 0,
      currency: "EUR",
      label: "Devis requis",
      available: false,
    };
  }

  const isFrance = countryCode.toUpperCase() === "FR";
  const isEu = ["FR", "BE", "DE", "ES", "IT", "LU", "NL", "PT", "AT"].includes(
    countryCode.toUpperCase()
  );

  if (!isEu) {
    return {
      priceCents: 0,
      currency: "EUR",
      label: "Hors zone — contactez-nous",
      available: false,
    };
  }

  let priceCents = isFrance ? BASE_FRANCE_CENTS : BASE_EU_CENTS;

  if (artwork.shippingClass === "OVERSIZE") {
    priceCents += OVERSIZE_SURCHARGE_CENTS;
  }

  const weight = artwork.packageWeightKg ?? 2;
  if (weight > 10) {
    priceCents += Math.round((weight - 10) * 200);
  }

  return {
    priceCents,
    currency: "EUR",
    label:
      artwork.shippingClass === "OVERSIZE"
        ? "Livraison grand format"
        : "Livraison standard",
    available: true,
  };
}

export function formatShippingClass(className: ShippingClass): string {
  switch (className) {
    case "STANDARD":
      return "Standard";
    case "OVERSIZE":
      return "Grand format";
    case "QUOTE_REQUIRED":
      return "Sur devis";
    default:
      return className;
  }
}
