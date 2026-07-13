import { z } from "zod";

export const homepageContentSchema = z.object({
  eyebrow: z
    .string()
    .trim()
    .min(1, "Le surtitre est requis.")
    .max(100, "Le surtitre est trop long."),
  title: z
    .string()
    .trim()
    .min(1, "Le titre est requis.")
    .max(200, "Le titre est trop long."),
  description: z
    .string()
    .trim()
    .min(1, "Le texte d'introduction est requis.")
    .max(2000, "Le texte d'introduction est trop long."),
});

export const artisteContentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre de la page est requis.")
    .max(200, "Le titre est trop long."),
  paragraphs: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Chaque paragraphe doit contenir du texte.")
        .max(5000, "Un paragraphe est trop long.")
    )
    .min(1, "Ajoutez au moins un paragraphe.")
    .max(20, "Vous pouvez ajouter au maximum 20 paragraphes."),
});

export const artisteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Le titre de la page est requis.")
    .max(200, "Le titre est trop long."),
  body: z
    .string()
    .trim()
    .min(1, "La biographie est requise.")
    .max(20000, "La biographie est trop longue."),
});

export function parseArtisteBody(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function formatArtisteBody(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}
