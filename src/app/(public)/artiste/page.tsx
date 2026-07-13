import { getArtisteContent } from "@/services/content.service";

export const metadata = {
  title: "L'artiste — Cécile Mackowiak",
  description: "Biographie et démarche artistique de Cécile Mackowiak, artiste peintre.",
};

export default async function ArtistePage() {
  const content = await getArtisteContent();

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">{content.title}</h1>
      <div className="mt-8 space-y-6 text-stone-600 leading-relaxed">
        {content.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
