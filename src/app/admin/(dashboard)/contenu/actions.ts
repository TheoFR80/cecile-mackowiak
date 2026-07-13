"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/session";
import {
  artisteContentSchema,
  artisteFormSchema,
  homepageContentSchema,
  parseArtisteBody,
} from "@/schemas/content.schema";
import {
  saveArtisteContent,
  saveHomepageContent,
} from "@/services/content.service";

export type ContentActionState = {
  error?: string;
  success?: boolean;
};

export async function saveHomepageContentAction(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireAdminUser();

  const parsed = homepageContentSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Formulaire incomplet.";
    return { error: first };
  }

  try {
    await saveHomepageContent(parsed.data);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Impossible d'enregistrer les textes." };
  }
}

export async function saveArtisteContentAction(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireAdminUser();

  const formParsed = artisteFormSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!formParsed.success) {
    const first = formParsed.error.issues[0]?.message ?? "Formulaire incomplet.";
    return { error: first };
  }

  const contentParsed = artisteContentSchema.safeParse({
    title: formParsed.data.title,
    paragraphs: parseArtisteBody(formParsed.data.body),
  });

  if (!contentParsed.success) {
    const first =
      contentParsed.error.issues[0]?.message ??
      "Séparez les paragraphes par une ligne vide.";
    return { error: first };
  }

  try {
    await saveArtisteContent(contentParsed.data);
    revalidatePath("/artiste");
    revalidatePath("/biographie");
    return { success: true };
  } catch {
    return { error: "Impossible d'enregistrer la biographie." };
  }
}
