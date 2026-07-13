export type ArtworkDimensions = {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
};

export type PackagingMargins = {
  horizontalCm: number;
  verticalCm: number;
  depthCm: number;
};

const DEFAULT_MARGINS: PackagingMargins = {
  horizontalCm: 8,
  verticalCm: 8,
  depthCm: 6,
};

export function calculatePackageDimensions(
  artwork: ArtworkDimensions,
  margins: PackagingMargins = DEFAULT_MARGINS
): ArtworkDimensions {
  return {
    widthCm: artwork.widthCm + margins.horizontalCm * 2,
    heightCm: artwork.heightCm + margins.verticalCm * 2,
    depthCm: artwork.depthCm + margins.depthCm * 2,
    weightKg: artwork.weightKg,
  };
}

export function classifyShipping(
  packageDims: ArtworkDimensions
): "STANDARD" | "OVERSIZE" | "QUOTE_REQUIRED" {
  const { widthCm, heightCm, depthCm, weightKg } = packageDims;
  const longestSide = Math.max(widthCm, heightCm, depthCm);

  if (longestSide > 200 || weightKg > 30) {
    return "QUOTE_REQUIRED";
  }

  if (longestSide > 120 || weightKg > 15) {
    return "OVERSIZE";
  }

  return "STANDARD";
}
