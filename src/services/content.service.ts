import { prisma } from "@/lib/database/client";
import {
  DEFAULT_ARTISTE_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
} from "@/lib/content/defaults";
import {
  artisteContentSchema,
  homepageContentSchema,
} from "@/schemas/content.schema";
import type { ArtisteContent, HomepageContent } from "@/types/content";

export const CONTENT_KEYS = {
  homepage: "content.homepage",
  artiste: "content.artiste",
} as const;

async function readSetting<T>(
  key: string,
  defaults: T,
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }
): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) {
    return defaults;
  }

  try {
    const parsed = schema.safeParse(JSON.parse(row.value));
    return parsed.success ? parsed.data! : defaults;
  } catch {
    return defaults;
  }
}

async function writeSetting(key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: serialized },
    update: { value: serialized },
  });
}

export async function getHomepageContent(): Promise<HomepageContent> {
  return readSetting(
    CONTENT_KEYS.homepage,
    DEFAULT_HOMEPAGE_CONTENT,
    homepageContentSchema
  );
}

export async function getArtisteContent(): Promise<ArtisteContent> {
  return readSetting(
    CONTENT_KEYS.artiste,
    DEFAULT_ARTISTE_CONTENT,
    artisteContentSchema
  );
}

export async function saveHomepageContent(
  content: HomepageContent
): Promise<HomepageContent> {
  const parsed = homepageContentSchema.parse(content);
  await writeSetting(CONTENT_KEYS.homepage, parsed);
  return parsed;
}

export async function saveArtisteContent(
  content: ArtisteContent
): Promise<ArtisteContent> {
  const parsed = artisteContentSchema.parse(content);
  await writeSetting(CONTENT_KEYS.artiste, parsed);
  return parsed;
}
