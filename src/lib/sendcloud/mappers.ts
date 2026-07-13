import type { Artwork } from "@prisma/client";
import type { PackageDimensions, ShippingAddress } from "@/types/shipping";
import type { SendcloudParcelInput } from "@/lib/sendcloud/types";
import { toSendcloudAddress } from "@/lib/sendcloud/sender-config";

export function artworkToPackage(artwork: Artwork): PackageDimensions {
  const widthCm = artwork.packageWidthCm ?? artwork.widthCm ?? 40;
  const heightCm = artwork.packageHeightCm ?? artwork.heightCm ?? 50;
  const depthCm = artwork.packageDepthCm ?? artwork.depthCm ?? 8;
  const weightKg = artwork.packageWeightKg ?? artwork.weightKg ?? 2;

  return {
    widthCm,
    heightCm,
    depthCm,
    weightKg,
    insuredValueCents: artwork.priceCents,
  };
}

export function packageToSendcloudParcel(
  pkg: PackageDimensions
): SendcloudParcelInput {
  const length = Math.max(pkg.widthCm, pkg.heightCm, pkg.depthCm);
  const width = Math.min(
    pkg.widthCm,
    pkg.heightCm,
    pkg.depthCm === length
      ? Math.min(pkg.widthCm, pkg.heightCm)
      : pkg.depthCm
  );
  const height =
    [pkg.widthCm, pkg.heightCm, pkg.depthCm]
      .filter((v) => v !== length && v !== width)
      .pop() ?? pkg.depthCm;

  return {
    dimensions: {
      length: length.toFixed(2),
      width: width.toFixed(2),
      height: height.toFixed(2),
      unit: "cm",
    },
    weight: {
      value: Math.max(pkg.weightKg, 0.1).toFixed(3),
      unit: "kg",
    },
  };
}

export function addressInputToShippingAddress(
  address: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    street1: string;
    street2?: string;
    postalCode: string;
    city: string;
    countryCode: string;
  }
): ShippingAddress {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    phone: address.phone,
    street1: address.street1,
    street2: address.street2,
    postalCode: address.postalCode,
    city: address.city,
    countryCode: address.countryCode.toUpperCase(),
  };
}

export function buildShippingRateInput(
  artwork: Artwork,
  from: ShippingAddress,
  to: ShippingAddress
) {
  return {
    from,
    to,
    package: artworkToPackage(artwork),
  };
}

export function buildAnnounceAddresses(from: ShippingAddress, to: ShippingAddress) {
  return {
    from_address: toSendcloudAddress(from),
    to_address: toSendcloudAddress(to),
  };
}

export function eurosToCents(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}

export function centsToEuroString(cents: number): string {
  return (cents / 100).toFixed(2);
}
