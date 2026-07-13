export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueArtworkSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(title) || "tableau";
  let slug = base;
  let counter = 1;

  while (await exists(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}
