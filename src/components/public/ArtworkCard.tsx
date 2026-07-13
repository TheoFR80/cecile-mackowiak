import Link from "next/link";
import Image from "next/image";
import { formatArtworkPrice } from "@/schemas/artwork.schema";
import { formatDimensions } from "@/services/public-artwork.service";
import type { Artwork, ArtworkImage } from "@prisma/client";

type Props = {
  artwork: Artwork & { images: ArtworkImage[] };
};

export function ArtworkCard({ artwork }: Props) {
  const primary =
    artwork.images.find((i) => i.isPrimary) ?? artwork.images[0];
  const dimensions = formatDimensions(artwork);

  return (
    <Link
      href={`/tableaux/${artwork.slug}`}
      className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/5] bg-stone-100">
        {primary?.url ? (
          <Image
            src={primary.url}
            alt={primary.altText ?? artwork.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            {artwork.title}
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-serif text-xl text-ink group-hover:text-accent">
          {artwork.title}
        </h2>
        {(artwork.technique || dimensions) && (
          <p className="mt-2 text-sm text-stone-500">
            {[artwork.technique, dimensions].filter(Boolean).join(" — ")}
          </p>
        )}
        <p className="mt-3 font-medium text-accent">
          {formatArtworkPrice(artwork.priceCents)}
        </p>
      </div>
    </Link>
  );
}
