import Link from "next/link";
import Image from "next/image";
import {
  ARTWORK_STATUS_LABELS,
  formatArtworkPrice,
} from "@/schemas/artwork.schema";
import {
  publishArtworkFormAction,
  hideArtworkFormAction,
  markSoldArtworkFormAction,
} from "@/app/admin/(dashboard)/tableaux/status-actions";
import type { Artwork, ArtworkImage } from "@prisma/client";

type ArtworkWithImages = Artwork & { images: ArtworkImage[] };

export function ArtworkList({ artworks }: { artworks: ArtworkWithImages[] }) {
  if (!artworks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
        <p className="text-lg text-stone-600">Aucun tableau pour le moment.</p>
        <Link
          href="/admin/tableaux/nouveau"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-xl bg-ink px-8 text-base text-white"
        >
          Ajouter un tableau
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {artworks.map((artwork) => {
        const primary =
          artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];
        return (
          <article
            key={artwork.id}
            className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {primary?.url ? (
                <Image
                  src={primary.url}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-stone-400">
                  —
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-xl text-ink">{artwork.title}</h2>
              <p className="text-sm text-stone-500">
                {formatArtworkPrice(artwork.priceCents)} ·{" "}
                {ARTWORK_STATUS_LABELS[artwork.status] ?? artwork.status}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/tableaux/${artwork.id}`}
                className="min-h-[44px] rounded-xl border border-stone-300 px-4 py-2 text-sm"
              >
                Modifier
              </Link>
              {artwork.status === "DRAFT" && (
                <form action={publishArtworkFormAction}>
                  <input type="hidden" name="id" value={artwork.id} />
                  <button type="submit" className="min-h-[44px] rounded-xl bg-ink px-4 py-2 text-sm text-white">
                    Publier
                  </button>
                </form>
              )}
              {artwork.status === "PUBLISHED" && (
                <form action={hideArtworkFormAction}>
                  <input type="hidden" name="id" value={artwork.id} />
                  <button type="submit" className="min-h-[44px] rounded-xl border px-4 py-2 text-sm">
                    Masquer
                  </button>
                </form>
              )}
              {artwork.status === "PUBLISHED" && (
                <form action={markSoldArtworkFormAction}>
                  <input type="hidden" name="id" value={artwork.id} />
                  <button type="submit" className="min-h-[44px] rounded-xl border px-4 py-2 text-sm">
                    Marquer vendu
                  </button>
                </form>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
