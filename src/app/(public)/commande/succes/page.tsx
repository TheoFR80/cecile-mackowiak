import Link from "next/link";
import { getOrderByNumber } from "@/services/order.service";
import { formatArtworkPrice } from "@/schemas/artwork.schema";

export default async function CommandeSuccesPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; pending?: string }>;
}) {
  const params = await searchParams;
  const order = params.order
    ? await getOrderByNumber(params.order)
    : null;

  const isPending = params.pending === "1";

  return (
    <section className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="font-serif text-4xl text-ink">
        {isPending ? "Commande enregistrée" : "Merci pour votre commande"}
      </h1>
      {order && (
        <p className="mt-4 text-stone-600">
          Commande <strong>{order.orderNumber}</strong>
          {order.artwork && (
            <>
              {" "}
              — {order.artwork.title} ({formatArtworkPrice(order.artworkPriceCents)})
            </>
          )}
        </p>
      )}
      <p className="mt-6 text-stone-600">
        {isPending
          ? "Le paiement en ligne sera activé très prochainement. Nous vous recontacterons."
          : "Vous recevrez un e-mail de confirmation avec les prochaines étapes."}
      </p>
      <Link
        href="/galerie"
        className="mt-10 inline-flex rounded-full bg-ink px-8 py-3 text-sm text-white"
      >
        Retour à la galerie
      </Link>
    </section>
  );
}
