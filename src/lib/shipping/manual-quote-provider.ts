import type {
  CreateShipmentInput,
  ShipmentResult,
  ShippingDocument,
  ShippingProvider,
  ShippingRate,
  ShippingRateInput,
  TrackingResult,
} from "@/types/shipping";

export class ManualQuoteShippingProvider implements ShippingProvider {
  readonly name = "manual_quote";

  async getRates(_input: ShippingRateInput): Promise<ShippingRate[]> {
    return [];
  }

  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    return {
      providerShipmentId: `manual-${input.orderId}`,
      carrier: "manual",
      serviceName: "Devis manuel",
    };
  }

  async getLabel(_shipmentId: string): Promise<ShippingDocument> {
    throw new Error("ManualQuoteShippingProvider — pas d'étiquette automatique");
  }

  async cancelShipment(_shipmentId: string): Promise<void> {
    // Rien à annuler côté API
  }

  async getTracking(_shipmentId: string): Promise<TrackingResult> {
    return {
      trackingNumber: "",
      status: "PENDING",
      events: [],
    };
  }
}
