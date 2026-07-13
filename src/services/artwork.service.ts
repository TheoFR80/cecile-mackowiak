import type { ArtworkStatus, Prisma, ShippingClass } from "@prisma/client";
import { prisma } from "@/lib/database/client";
import { uniqueArtworkSlug } from "@/lib/slug";
import { eurosToCents } from "@/schemas/artwork.schema";

export type ArtworkImageInput = {
  url: string;
  publicId?: string;
  altText?: string;
  position: number;
  isPrimary: boolean;
};

export type ArtworkUpsertInput = {
  title: string;
  description: string;
  priceEuros: number;
  year?: number | null;
  category?: string | null;
  technique?: string | null;
  support?: string | null;
  orientation?: string | null;
  isFramed: boolean;
  hasCertificate: boolean;
  isSigned: boolean;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
  packageWidthCm: number;
  packageHeightCm: number;
  packageDepthCm: number;
  packageWeightKg: number;
  shippingClass: ShippingClass;
  images: ArtworkImageInput[];
};

export async function listArtworksForAdmin() {
  return prisma.artwork.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: {
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getArtworkById(id: string) {
  return prisma.artwork.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

export async function getAdminArtworkStats() {
  const [forSale, sold, drafts] = await Promise.all([
    prisma.artwork.count({ where: { status: "PUBLISHED" } }),
    prisma.artwork.count({ where: { status: "SOLD" } }),
    prisma.artwork.count({ where: { status: "DRAFT" } }),
  ]);

  return { forSale, sold, drafts };
}

export async function createDraftArtwork(title = "Nouveau tableau") {
  const slug = await uniqueArtworkSlug(title, async (s) => {
    const found = await prisma.artwork.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  return prisma.artwork.create({
    data: {
      title,
      slug,
      description: "",
      priceCents: 0,
      status: "DRAFT",
    },
  });
}

export async function upsertArtworkFromWizard(
  artworkId: string | null,
  input: ArtworkUpsertInput,
  status: ArtworkStatus
) {
  const slug = await uniqueArtworkSlug(input.title, async (s) => {
    const found = await prisma.artwork.findFirst({
      where: { slug: s, ...(artworkId ? { NOT: { id: artworkId } } : {}) },
    });
    return Boolean(found);
  });

  const data: Prisma.ArtworkUncheckedCreateInput = {
    title: input.title,
    slug,
    description: input.description,
    priceCents: eurosToCents(input.priceEuros),
    year: input.year ?? null,
    category: input.category ?? null,
    technique: input.technique ?? null,
    support: input.support ?? null,
    orientation: input.orientation ?? null,
    isFramed: input.isFramed,
    hasCertificate: input.hasCertificate,
    isSigned: input.isSigned,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    depthCm: input.depthCm,
    weightKg: input.weightKg,
    packageWidthCm: input.packageWidthCm,
    packageHeightCm: input.packageHeightCm,
    packageDepthCm: input.packageDepthCm,
    packageWeightKg: input.packageWeightKg,
    shippingClass: input.shippingClass,
    status,
    ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
  };

  const artwork = artworkId
    ? await prisma.artwork.update({ where: { id: artworkId }, data })
    : await prisma.artwork.create({ data });

  await prisma.artworkImage.deleteMany({ where: { artworkId: artwork.id } });
  await prisma.artworkImage.createMany({
    data: input.images.map((img) => ({
      artworkId: artwork.id,
      url: img.url,
      publicId: img.publicId ?? null,
      altText: img.altText ?? input.title,
      position: img.position,
      isPrimary: img.isPrimary,
    })),
  });

  return artwork;
}

export async function updateArtworkStatus(id: string, status: ArtworkStatus) {
  return prisma.artwork.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });
}
