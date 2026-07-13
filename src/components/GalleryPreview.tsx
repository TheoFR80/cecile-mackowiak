import Link from "next/link";
import { ArtworkCard } from "@/components/public/ArtworkCard";
import { getFeaturedArtworks } from "@/services/public-artwork.service";

export async function GalleryPreview() {
  const featured = await getFeaturedArtworks(3);

  if (!featured.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-accent">Sélection</p>
          <h2 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            Œuvres récentes
          </h2>
        </div>
        <Link
          href="/galerie"
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          Voir toute la galerie →
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {featured.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </section>
  );
}
