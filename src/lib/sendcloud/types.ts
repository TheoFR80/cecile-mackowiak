export type SendcloudAddress = {
  name?: string;
  company_name?: string;
  address_line_1?: string;
  address_line_2?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  country_code: string;
  phone_number?: string;
  email?: string;
  state_province_code?: string;
};

export type SendcloudParcelInput = {
  dimensions?: {
    length: string;
    width: string;
    height: string;
    unit: "cm";
  };
  weight: {
    value: string;
    unit: "kg";
  };
};

export type SendcloudShippingOptionsRequest = {
  from_address?: SendcloudAddress;
  to_address?: SendcloudAddress;
  parcels: SendcloudParcelInput[];
  calculate_quotes?: boolean;
  carrier_code?: string;
};

export type SendcloudPrice = {
  value: string;
  currency: string;
};

export type SendcloudQuote = {
  price?: {
    total?: SendcloudPrice;
    breakdown?: Array<{
      type: string;
      label: string;
      price: SendcloudPrice;
    }>;
  };
  lead_time?: number;
};

export type SendcloudShippingOption = {
  code: string;
  name: string;
  carrier?: { code: string; name: string };
  product?: { code: string; name: string };
  functionalities?: {
    returns?: boolean;
    last_mile?: string;
    bulky_goods?: boolean;
  };
  contract?: { id: number; name?: string };
  quotes?: SendcloudQuote[] | null;
};

export type SendcloudShippingOptionsResponse = {
  data: SendcloudShippingOption[] | null;
  message?: string | null;
};

export type SendcloudAnnounceRequest = {
  label_details?: {
    mime_type: "application/pdf";
    dpi?: number;
  };
  from_address: SendcloudAddress;
  to_address: SendcloudAddress;
  ship_with: {
    type: "shipping_option_code";
    properties: {
      shipping_option_code: string;
      contract_id?: number;
    };
  };
  order_number: string;
  total_order_price?: SendcloudPrice;
  parcels: Array<
    SendcloudParcelInput & {
      parcel_items?: Array<{
        description: string;
        quantity: number;
        weight: { value: string; unit: "kg" };
        price: SendcloudPrice;
      }>;
    }
  >;
};

export type SendcloudParcelDocument = {
  type: string;
  link?: string;
};

export type SendcloudAnnouncedParcel = {
  id: number;
  tracking_number?: string;
  tracking_url?: string;
  documents?: SendcloudParcelDocument[];
  status?: { code?: string; message?: string };
};

export type SendcloudAnnounceResponse = {
  data: {
    id: string;
    parcels: SendcloudAnnouncedParcel[];
  };
};

export type SendcloudTrackingEvent = {
  status?: { code?: string; message?: string };
  timestamp?: string;
  location?: string;
};

export type SendcloudTrackingResponse = {
  data?: {
    tracking_number?: string;
    tracking_url?: string;
    status?: { code?: string; message?: string };
    events?: SendcloudTrackingEvent[];
  };
};
