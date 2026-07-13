import Link from "next/link";
import { GalleryPreview } from "@/components/GalleryPreview";
import { getHomepageContent } from "@/services/content.service";

export default async function HomePage() {
  const content = await getHomepageContent();

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          {content.eyebrow}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-ink md:text-6xl">
          {content.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
          {content.description}
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
