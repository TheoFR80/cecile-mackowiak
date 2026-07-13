import Link from "next/link";

export default async function CommandeAnnuleePage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-serif text-4xl text-ink">Paiement annulé</h1>
      <p className="mt-4 text-stone-600">
        Votre paiement n&apos;a pas été finalisé
        {params.order ? ` (commande ${params.order})` : ""}. Le tableau peut
        être à nouveau disponible.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/galerie"
          className="rounded-full bg-ink px-8 py-3 text-sm text-white"
        >
          Voir la galerie
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-stone-300 px-8 py-3 text-sm"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}
