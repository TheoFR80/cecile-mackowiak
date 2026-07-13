import type { ArtworkStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/client";

export type PublicArtworkFilters = {
  category?: string;
  technique?: string;
  available?: boolean;
  sort?: "recent" | "price-asc" | "price-desc";
};

const publishedWhere = {
  status: "PUBLISHED" as ArtworkStatus,
};

export async function listPublishedArtworks(filters: PublicArtworkFilters = {}) {
  const where: Prisma.ArtworkWhereInput = { ...publishedWhere };

  if (filters.category) where.category = filters.category;
  if (filters.technique) where.technique = filters.technique;

  const orderBy: Prisma.ArtworkOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { priceCents: "asc" }
      : filters.sort === "price-desc"
        ? { priceCents: "desc" }
        : { publishedAt: "desc" };

  return prisma.artwork.findMany({
    where,
    include: {
      images: { orderBy: { position: "asc" } },
    },
    orderBy,
  });
}

export async function getFeaturedArtworks(limit = 3) {
  return prisma.artwork.findMany({
    where: publishedWhere,
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: limit,
  });
}

export async function getPublishedArtworkBySlug(slug: string) {
  return prisma.artwork.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

export async function getGalleryFilterOptions() {
  const artworks = await prisma.artwork.findMany({
    where: publishedWhere,
    select: { category: true, technique: true },
  });

  const categories = [...new Set(artworks.map((a) => a.category).filter(Boolean))] as string[];
  const techniques = [...new Set(artworks.map((a) => a.technique).filter(Boolean))] as string[];

  return { categories, techniques };
}

export function formatDimensions(artwork: {
  widthCm: number | null;
  heightCm: number | null;
  depthCm?: number | null;
}): string | null {
  if (!artwork.widthCm || !artwork.heightCm) return null;
  if (artwork.depthCm && artwork.depthCm > 0) {
    return `${artwork.widthCm} × ${artwork.heightCm} × ${artwork.depthCm} cm`;
  }
  return `${artwork.widthCm} × ${artwork.heightCm} cm`;
}
