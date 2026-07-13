import { sendcloudRequest } from "@/lib/sendcloud/client";
import {
  centsToEuroString,
  eurosToCents,
  packageToSendcloudParcel,
} from "@/lib/sendcloud/mappers";
import {
  getDefaultContractId,
  getSenderAddress,
  toSendcloudAddress,
} from "@/lib/sendcloud/sender-config";
import type {
  SendcloudAnnounceRequest,
  SendcloudAnnounceResponse,
  SendcloudShippingOption,
  SendcloudShippingOptionsRequest,
  SendcloudShippingOptionsResponse,
  SendcloudTrackingResponse,
} from "@/lib/sendcloud/types";
import type {
  CreateShipmentInput,
  PickupInput,
  PickupResult,
  ShipmentResult,
  ShippingDocument,
  ShippingProvider,
  ShippingRate,
  ShippingRateInput,
  TrackingResult,
} from "@/types/shipping";

function pickBestRate(options: SendcloudShippingOption[]): SendcloudShippingOption | null {
  const candidates = options.filter((option) => {
    if (option.functionalities?.returns) return false;
    if (option.functionalities?.last_mile === "service_point") return false;
    const total = option.quotes?.[0]?.price?.total;
    return total?.value && total.currency === "EUR";
  });

  if (candidates.length === 0) return null;

  return candidates.sort((a, b) => {
    const priceA = eurosToCents(a.quotes?.[0]?.price?.total?.value ?? "999999");
    const priceB = eurosToCents(b.quotes?.[0]?.price?.total?.value ?? "999999");
    return priceA - priceB;
  })[0];
}

function mapOptionToRate(option: SendcloudShippingOption): ShippingRate | null {
  const total = option.quotes?.[0]?.price?.total;
  if (!total?.value) return null;

  return {
    id: option.code,
    carrier: option.carrier?.name ?? option.carrier?.code ?? "Transporteur",
    serviceName: option.name,
    priceCents: eurosToCents(total.value),
    currency: total.currency,
    estimatedDaysMin: option.quotes?.[0]?.lead_time,
    estimatedDaysMax: option.quotes?.[0]?.lead_time,
    supportsPickup: option.functionalities?.last_mile === "pickup_dropoff",
  };
}

export class SendcloudShippingProvider implements ShippingProvider {
  readonly name = "sendcloud";

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    const body: SendcloudShippingOptionsRequest = {
      from_address: toSendcloudAddress(input.from),
      to_address: toSendcloudAddress(input.to),
      parcels: [packageToSendcloudParcel(input.package)],
      calculate_quotes: true,
    };

    const response = await sendcloudRequest<SendcloudShippingOptionsResponse>(
      "/shipping-options",
      { method: "POST", body: JSON.stringify(body) }
    );

    const options = response.data ?? [];
    return options
      .map(mapOptionToRate)
      .filter((rate): rate is ShippingRate => rate !== null)
      .sort((a, b) => a.priceCents - b.priceCents);
  }

  async getBestRate(input: ShippingRateInput): Promise<ShippingRate | null> {
    const body: SendcloudShippingOptionsRequest = {
      from_address: toSendcloudAddress(input.from),
      to_address: toSendcloudAddress(input.to),
      parcels: [packageToSendcloudParcel(input.package)],
      calculate_quotes: true,
    };

    const response = await sendcloudRequest<SendcloudShippingOptionsResponse>(
      "/shipping-options",
      { method: "POST", body: JSON.stringify(body) }
    );

    const best = pickBestRate(response.data ?? []);
    return best ? mapOptionToRate(best) : null;
  }

  async createShipment(input: CreateShipmentInput): Promise<ShipmentResult> {
    const from = input.from.street1 ? input.from : getSenderAddress();
    const parcel = packageToSendcloudParcel(input.package);
    const contractId = getDefaultContractId();

    const body: SendcloudAnnounceRequest = {
      label_details: { mime_type: "application/pdf", dpi: 72 },
      ...{
        from_address: toSendcloudAddress(from),
        to_address: toSendcloudAddress(input.to),
      },
      ship_with: {
        type: "shipping_option_code",
        properties: {
          shipping_option_code: input.shippingMethodId,
          ...(contractId ? { contract_id: contractId } : {}),
        },
      },
      order_number: input.orderNumber,
      total_order_price: input.reference
        ? { currency: "EUR", value: input.reference }
        : undefined,
      parcels: [
        {
          ...parcel,
          parcel_items: [
            {
              description: input.reference ?? `Commande ${input.orderNumber}`,
              quantity: 1,
              weight: parcel.weight,
              price: {
                currency: "EUR",
                value: input.reference ?? "0.00",
              },
            },
          ],
        },
      ],
    };

    const response = await sendcloudRequest<SendcloudAnnounceResponse>(
      "/shipments/announce",
      { method: "POST", body: JSON.stringify(body) }
    );

    const parcelResult = response.data.parcels[0];
    if (!parcelResult) {
      throw new Error("Sendcloud n'a pas renvoyé de colis");
    }

    const labelDoc = parcelResult.documents?.find((doc) => doc.type === "label");

    return {
      providerShipmentId: String(parcelResult.id),
      carrier: input.shippingMethodId.split(":")[0] ?? "sendcloud",
      serviceName: input.shippingMethodId,
      trackingNumber: parcelResult.tracking_number,
      trackingUrl: parcelResult.tracking_url,
      labelUrl: labelDoc?.link,
    };
  }

  async getLabel(shipmentId: string): Promise<ShippingDocument> {
    const response = await sendcloudRequest<{ link?: string }>(
      `/parcels/${shipmentId}/documents/label`,
      { method: "GET" }
    );

    if (!response.link) {
      throw new Error("Étiquette introuvable");
    }

    return { url: response.link, format: "pdf", type: "label" };
  }

  async cancelShipment(shipmentId: string): Promise<void> {
    await sendcloudRequest(`/shipments/${shipmentId}/cancel`, {
      method: "POST",
    });
  }

  async getTracking(shipmentId: string): Promise<TrackingResult> {
    const response = await sendcloudRequest<SendcloudTrackingResponse>(
      `/parcels/${shipmentId}/tracking`,
      { method: "GET" }
    );

    const data = response.data;
    return {
      trackingNumber: data?.tracking_number ?? shipmentId,
      trackingUrl: data?.tracking_url,
      status: data?.status?.code ?? data?.status?.message ?? "UNKNOWN",
      events:
        data?.events?.map((event) => ({
          status: event.status?.code ?? event.status?.message ?? "UPDATE",
          message: event.status?.message,
          eventDate: event.timestamp ? new Date(event.timestamp) : new Date(),
          location: event.location,
        })) ?? [],
    };
  }

  async schedulePickup(_input: PickupInput): Promise<PickupResult> {
    return {
      scheduled: false,
      instructions:
        "Enlèvement à planifier depuis le panel Sendcloud pour ce transporteur.",
    };
  }
}

export function buildCreateShipmentInput(
  order: {
    id: string;
    orderNumber: string;
    totalCents: number;
    artworkPriceCents: number;
    shippingMethodId: string | null;
  },
  to: ShippingRateInput["to"],
  pkg: ShippingRateInput["package"]
): CreateShipmentInput {
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    from: getSenderAddress(),
    to,
    package: pkg,
    shippingMethodId: order.shippingMethodId ?? "",
    reference: centsToEuroString(order.artworkPriceCents),
  };
}
