export type ShippingAddress = {
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  postalCode: string;
  city: string;
  region?: string;
  countryCode: string;
  phone?: string;
  email?: string;
};

export type PackageDimensions = {
  weightKg: number;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  insuredValueCents?: number;
};

export type ShippingRateInput = {
  from: ShippingAddress;
  to: ShippingAddress;
  package: PackageDimensions;
};

export type ShippingRate = {
  id: string;
  carrier: string;
  serviceName: string;
  priceCents: number;
  currency: string;
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  supportsPickup?: boolean;
};

export type CreateShipmentInput = {
  orderId: string;
  orderNumber: string;
  from: ShippingAddress;
  to: ShippingAddress;
  package: PackageDimensions;
  shippingMethodId: string;
  reference?: string;
};

export type ShipmentResult = {
  providerShipmentId: string;
  carrier: string;
  serviceName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  priceCents?: number;
};

export type ShippingDocument = {
  url: string;
  format: "pdf" | "zpl" | "png";
  type: "label" | "packing_slip" | "customs";
};

export type TrackingEvent = {
  status: string;
  message?: string;
  eventDate: Date;
  location?: string;
};

export type TrackingResult = {
  trackingNumber: string;
  trackingUrl?: string;
  status: string;
  events: TrackingEvent[];
};

export type PickupInput = {
  shipmentId: string;
  pickupDate: Date;
  instructions?: string;
};

export type PickupResult = {
  scheduled: boolean;
  pickupDate?: Date;
  confirmationNumber?: string;
  instructions?: string;
};

export interface ShippingProvider {
  readonly name: string;

  getRates(input: ShippingRateInput): Promise<ShippingRate[]>;
  createShipment(input: CreateShipmentInput): Promise<ShipmentResult>;
  getLabel(shipmentId: string): Promise<ShippingDocument>;
  cancelShipment(shipmentId: string): Promise<void>;
  getTracking(shipmentId: string): Promise<TrackingResult>;
  schedulePickup?(input: PickupInput): Promise<PickupResult>;
}
