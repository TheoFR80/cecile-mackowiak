import type { Artwork } from "@prisma/client";
import { isSendcloudConfigured } from "@/lib/sendcloud/client";
import { SendcloudShippingProvider } from "@/lib/sendcloud/provider";
import {
  getSenderAddress,
  isSenderAddressConfigured,
} from "@/lib/sendcloud/sender-config";
import {
  addressInputToShippingAddress,
  buildShippingRateInput,
} from "@/lib/sendcloud/mappers";
import { getShippingProvider } from "@/lib/shipping";
import type { AddressInput } from "@/schemas/checkout.schema";
import {
  estimateShippingPrice,
  type ShippingEstimate,
} from "@/services/shipping-estimate.service";
import type { ShippingRate } from "@/types/shipping";

const EU_COUNTRIES = ["FR", "BE", "DE", "ES", "IT", "LU", "NL", "PT", "AT"];

export type ShippingQuoteResult = ShippingEstimate & {
  provider: "sendcloud" | "fallback";
  rate?: ShippingRate;
};

export async function getShippingQuoteForArtwork(
  artwork: Pick<
    Artwork,
    | "shippingClass"
    | "packageWeightKg"
    | "priceCents"
    | "packageWidthCm"
    | "packageHeightCm"
    | "packageDepthCm"
    | "widthCm"
    | "heightCm"
    | "depthCm"
    | "weightKg"
  >,
  address: Pick<AddressInput, "countryCode" | "postalCode" | "city" | "street1"> &
    Partial<AddressInput>
): Promise<ShippingQuoteResult> {
  if (artwork.shippingClass === "QUOTE_REQUIRED") {
    return {
      priceCents: 0,
      currency: "EUR",
      label: "Devis requis",
      available: false,
      provider: "fallback",
    };
  }

  const countryCode = address.countryCode.toUpperCase();
  if (!EU_COUNTRIES.includes(countryCode)) {
    return {
      priceCents: 0,
      currency: "EUR",
      label: "Hors zone — contactez-nous",
      available: false,
      provider: "fallback",
    };
  }

  if (
    isSendcloudConfigured() &&
    isSenderAddressConfigured() &&
    address.postalCode &&
    address.street1
  ) {
    try {
      const provider = new SendcloudShippingProvider();
      const from = getSenderAddress();
      const to = addressInputToShippingAddress({
        firstName: address.firstName ?? "Client",
        lastName: address.lastName ?? "Client",
        email: address.email ?? "client@example.com",
        phone: address.phone,
        street1: address.street1,
        street2: address.street2,
        postalCode: address.postalCode,
        city: address.city ?? "",
        countryCode,
      });

      const rate = await provider.getBestRate(
        buildShippingRateInput(artwork as Artwork, from, to)
      );

      if (rate) {
        return {
          priceCents: rate.priceCents,
          currency: rate.currency,
          label: `${rate.carrier} — ${rate.serviceName}`,
          available: true,
          provider: "sendcloud",
          rate,
        };
      }
    } catch {
      // Fallback to flat estimate if Sendcloud is unavailable
    }
  }

  const fallback = estimateShippingPrice(artwork, countryCode);
  return { ...fallback, provider: "fallback" };
}

export function getManualQuoteProvider() {
  return getShippingProvider("manual_quote");
}
