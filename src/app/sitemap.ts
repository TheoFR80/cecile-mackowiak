import type { MetadataRoute } from "next";
import { prisma } from "@/lib/database/client";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const artworks = await prisma.artwork.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const staticPages = [
    "",
    "/galerie",
    "/artiste",
    "/livraison",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
    "/conditions-generales",
    "/politique-retours",
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...artworks.map((a) => ({
      url: `${siteUrl}/tableaux/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
