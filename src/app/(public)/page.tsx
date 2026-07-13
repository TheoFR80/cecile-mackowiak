import Link from "next/link";
import { GalleryPreview } from "@/components/GalleryPreview";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          Artiste peintre
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-6xl">
          Cécile Mackowiak
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
          Des tableaux qui captent la lumière, l&apos;émotion et le silence des
          paysages. Chaque œuvre est une invitation à ralentir et à contempler.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/galerie"
            className="rounded-full bg-ink px-8 py-3 text-sm text-white transition hover:bg-stone-800"
          >
            Explorer la galerie
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-stone-300 px-8 py-3 text-sm text-ink transition hover:border-ink"
          >
            Me contacter
          </Link>
        </div>
      </section>

      <GalleryPreview />
    </>
  );
}
