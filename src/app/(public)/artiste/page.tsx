export const metadata = {
  title: "L'artiste — Cécile Mackowiak",
  description: "Biographie et démarche artistique de Cécile Mackowiak, artiste peintre.",
};

export default function ArtistePage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">L&apos;artiste</h1>
      <div className="mt-8 space-y-6 text-stone-600 leading-relaxed">
        <p>
          Cécile Mackowiak est une artiste peintre passionnée par la lumière,
          les paysages et les émotions que suscite la nature. Son travail
          explore les rapports entre couleur, matière et silence.
        </p>
        <p>
          Formée aux arts plastiques, elle développe une pratique autour de
          l&apos;huile et de l&apos;acrylique, alternant compositions
          intimistes et formats plus amples. Chaque tableau est le fruit d&apos;une
          observation patiente et d&apos;une recherche constante d&apos;harmonie.
        </p>
        <p>
          Ses œuvres sont exposées et acquises par des collectionneurs
          particuliers. Ce site permet de découvrir ses créations et d&apos;acquérir
          directement les tableaux disponibles.
        </p>
      </div>
    </section>
  );
}
