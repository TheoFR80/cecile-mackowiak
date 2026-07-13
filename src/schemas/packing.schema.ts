import { z } from "zod";

export const packingChecklistFieldSchema = z.enum([
  "artworkPhotographed",
  "certificateAdded",
  "cornersProtected",
  "surfaceProtected",
  "innerProtectionAdded",
  "reinforcedBoxUsed",
  "emptySpacesFilled",
  "packageClosed",
  "labelAttached",
]);

export const packingPhotoTypeSchema = z.enum([
  "ARTWORK_BEFORE_PACKING",
  "PACKING_IN_PROGRESS",
  "SEALED_PACKAGE",
  "LABEL_ATTACHED",
]);

export type PackingChecklistField = z.infer<typeof packingChecklistFieldSchema>;
export type PackingPhotoType = z.infer<typeof packingPhotoTypeSchema>;

export const CHECKLIST_ITEMS: Array<{
  key: PackingChecklistField;
  label: string;
  hint?: string;
  requiresCertificate?: boolean;
  afterLabel?: boolean;
}> = [
  {
    key: "artworkPhotographed",
    label: "J'ai photographié le tableau avant emballage",
    hint: "Preuve en cas de litige transport",
  },
  {
    key: "certificateAdded",
    label: "Le certificat d'authenticité est inclus",
    requiresCertificate: true,
  },
  {
    key: "cornersProtected",
    label: "Les angles sont protégés",
  },
  {
    key: "surfaceProtected",
    label: "La surface est protégée (papier, film, carton)",
  },
  {
    key: "innerProtectionAdded",
    label: "Un calage intérieur a été ajouté",
  },
  {
    key: "reinforcedBoxUsed",
    label: "Le carton est renforcé si nécessaire",
  },
  {
    key: "emptySpacesFilled",
    label: "Les vides dans le colis sont comblés",
  },
  {
    key: "packageClosed",
    label: "Le colis est fermé et sécurisé",
  },
  {
    key: "labelAttached",
    label: "L'étiquette d'expédition est collée sur le colis",
    hint: "Après création de l'étiquette Sendcloud",
    afterLabel: true,
  },
];

export const PHOTO_TYPES: Array<{
  type: PackingPhotoType;
  label: string;
  required: boolean;
}> = [
  {
    type: "ARTWORK_BEFORE_PACKING",
    label: "Tableau avant emballage",
    required: true,
  },
  {
    type: "PACKING_IN_PROGRESS",
    label: "Emballage en cours",
    required: false,
  },
  {
    type: "SEALED_PACKAGE",
    label: "Colis fermé",
    required: true,
  },
  {
    type: "LABEL_ATTACHED",
    label: "Étiquette collée",
    required: false,
  },
];
