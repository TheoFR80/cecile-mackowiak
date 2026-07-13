import type { ShippingAddress } from "@/types/shipping";

export function getSenderAddress(): ShippingAddress {
  const countryCode = process.env.SENDCLOUD_SENDER_COUNTRY ?? "FR";

  return {
    firstName: process.env.SENDCLOUD_SENDER_FIRST_NAME ?? "Cécile",
    lastName: process.env.SENDCLOUD_SENDER_LAST_NAME ?? "Mackowiak",
    company: process.env.SENDCLOUD_SENDER_COMPANY,
    street1: process.env.SENDCLOUD_SENDER_STREET ?? "",
    postalCode: process.env.SENDCLOUD_SENDER_POSTAL_CODE ?? "",
    city: process.env.SENDCLOUD_SENDER_CITY ?? "",
    countryCode,
    phone: process.env.SENDCLOUD_SENDER_PHONE,
    email: process.env.SENDCLOUD_SENDER_EMAIL,
  };
}

export function isSenderAddressConfigured(): boolean {
  const sender = getSenderAddress();
  return Boolean(
    sender.street1 && sender.postalCode && sender.city && sender.countryCode
  );
}

export function toSendcloudAddress(address: ShippingAddress) {
  const fullName = `${address.firstName} ${address.lastName}`.trim();

  return {
    name: fullName,
    company_name: address.company,
    address_line_1: address.street1,
    address_line_2: address.street2,
    postal_code: address.postalCode,
    city: address.city,
    country_code: address.countryCode.toUpperCase(),
    phone_number: address.phone,
    email: address.email,
  };
}

export function getDefaultContractId(): number | undefined {
  const raw = process.env.SENDCLOUD_DEFAULT_CONTRACT_ID;
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
