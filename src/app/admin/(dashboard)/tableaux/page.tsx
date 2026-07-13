import Link from "next/link";
import { ArtworkList } from "@/components/admin/ArtworkList";
import { listArtworksForAdmin } from "@/services/artwork.service";

export default async function AdminTableauxPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; published?: string }>;
}) {
  const params = await searchParams;
  const artworks = await listArtworksForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Mes tableaux</h1>
          <p className="mt-2 text-stone-600">
            {artworks.length} œuvre{artworks.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/tableaux/nouveau"
          className="inline-flex min-h-[52px] items-center rounded-xl bg-ink px-8 text-base font-medium text-white"
        >
          Ajouter un tableau
        </Link>
      </div>

      {params.saved && (
        <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Brouillon enregistré.
        </p>
      )}
      {params.published && (
        <p className="mt-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Tableau publié avec succès.
        </p>
      )}

      <div className="mt-10">
        <ArtworkList artworks={artworks} />
      </div>
    </div>
  );
}
