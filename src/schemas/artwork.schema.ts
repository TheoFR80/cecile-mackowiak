import { z } from "zod";

export const ARTWORK_CATEGORIES = [
  "Paysage",
  "Nature morte",
  "Portrait",
  "Abstrait",
  "Marine",
  "Urbain",
  "Autre",
] as const;

export const ARTWORK_TECHNIQUES = [
  "Huile sur toile",
  "Acrylique sur toile",
  "Aquarelle",
  "Pastel",
  "Technique mixte",
  "Autre",
] as const;

export const ARTWORK_SUPPORTS = [
  "Toile",
  "Papier",
  "Bois",
  "Carton",
  "Autre",
] as const;

export const ARTWORK_ORIENTATIONS = [
  "Portrait",
  "Paysage",
  "Carré",
] as const;

export const artworkMainSchema = z.object({
  title: z.string().min(2, "Le titre est requis"),
  description: z.string().min(10, "Décrivez un peu l'œuvre"),
  priceEuros: z.coerce.number().positive("Indiquez un prix"),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  category: z.string().optional().nullable(),
  technique: z.string().optional().nullable(),
  support: z.string().optional().nullable(),
  orientation: z.string().optional().nullable(),
  isFramed: z.boolean().default(false),
  hasCertificate: z.boolean().default(false),
  isSigned: z.boolean().default(true),
});

export const artworkDimensionsSchema = z.object({
  widthCm: z.coerce.number().positive("Largeur requise"),
  heightCm: z.coerce.number().positive("Hauteur requise"),
  depthCm: z.coerce.number().min(0).default(0),
  weightKg: z.coerce.number().positive("Poids requis"),
});

export const artworkShippingSchema = z.object({
  packageWidthCm: z.coerce.number().positive("Largeur colis requise"),
  packageHeightCm: z.coerce.number().positive("Hauteur colis requise"),
  packageDepthCm: z.coerce.number().positive("Profondeur colis requise"),
  packageWeightKg: z.coerce.number().positive("Poids colis requis"),
  shippingClass: z.enum(["STANDARD", "OVERSIZE", "QUOTE_REQUIRED"]).default("STANDARD"),
});

export const artworkImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  altText: z.string().optional(),
  position: z.number().int().min(0),
  isPrimary: z.boolean(),
});

export const artworkWizardSchema = artworkMainSchema
  .merge(artworkDimensionsSchema)
  .merge(artworkShippingSchema)
  .extend({
    images: z.array(artworkImageSchema).min(1, "Ajoutez au moins une photo"),
  });

export type ArtworkWizardInput = z.infer<typeof artworkWizardSchema>;

export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

export function centsToEuros(cents: number): number {
  return cents / 100;
}

export function formatArtworkPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export const ARTWORK_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "En vente",
  RESERVED: "Réservé",
  SOLD: "Vendu",
  ARCHIVED: "Archivé",
};
