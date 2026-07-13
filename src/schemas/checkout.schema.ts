import { z } from "zod";

export const addressSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  phone: z.string().optional(),
  street1: z.string().min(3, "Adresse requise"),
  street2: z.string().optional(),
  postalCode: z.string().min(4, "Code postal requis"),
  city: z.string().min(2, "Ville requise"),
  countryCode: z.string().length(2, "Pays requis").default("FR"),
});

export const checkoutSchema = addressSchema.extend({
  artworkSlug: z.string().min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

export const shippingRateRequestSchema = z.object({
  artworkSlug: z.string().min(1),
  countryCode: z.string().length(2),
  postalCode: z.string().min(4),
  street1: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
});
