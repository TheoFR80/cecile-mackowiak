import { ManualQuoteShippingProvider } from "@/lib/shipping/manual-quote-provider";
import { SendcloudShippingProvider } from "@/lib/sendcloud/provider";
import type { ShippingProvider } from "@/types/shipping";

export function getShippingProvider(
  provider: "sendcloud" | "manual_quote" = "sendcloud"
): ShippingProvider {
  switch (provider) {
    case "manual_quote":
      return new ManualQuoteShippingProvider();
    case "sendcloud":
    default:
      return new SendcloudShippingProvider();
  }
}
