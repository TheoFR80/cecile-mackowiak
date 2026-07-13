import { Suspense } from "react";
import { ArtworkCard } from "@/components/public/ArtworkCard";
import { GalleryFilters } from "@/components/public/GalleryFilters";
import {
  getGalleryFilterOptions,
  listPublishedArtworks,
} from "@/services/public-artwork.service";

export const metadata = {
  title: "Galerie — Cécile Mackowiak",
  description: "Découvrez les tableaux originaux de Cécile Mackowiak, disponibles à l'achat.",
};

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    technique?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const sort =
    params.sort === "price-asc" || params.sort === "price-desc"
      ? params.sort
      : "recent";

  const [artworks, filterOptions] = await Promise.all([
    listPublishedArtworks({
      category: params.category,
      technique: params.technique,
      sort,
    }),
    getGalleryFilterOptions(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">Galerie</h1>
      <p className="mt-4 max-w-2xl text-stone-600">
        Toutes les œuvres présentées sont des originaux. Chaque tableau est unique
        et peut être acquis directement en ligne.
      </p>

      <Suspense fallback={null}>
        <GalleryFilters
          categories={filterOptions.categories}
          techniques={filterOptions.techniques}
        />
      </Suspense>

      {artworks.length === 0 ? (
        <p className="mt-16 text-center text-stone-500">
          Aucune œuvre disponible pour le moment. Revenez bientôt.
        </p>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </section>
  );
}
