import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/services/order.service";
import { formatArtworkPrice } from "@/schemas/artwork.schema";

const PAYMENT_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
};

type Props = { params: Promise<{ orderNumber: string }> };

export default async function SuiviPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">Suivi de commande</h1>
      <p className="mt-2 text-stone-500">{order.orderNumber}</p>

      <dl className="mt-10 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Œuvre</dt>
          <dd className="text-right text-ink">{order.artwork.title}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Total</dt>
          <dd>{formatArtworkPrice(order.totalCents)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Paiement</dt>
          <dd>{PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-500">Préparation</dt>
          <dd>{order.fulfillmentStatus}</dd>
        </div>
      </dl>

      <Link href="/galerie" className="mt-8 inline-block text-sm text-accent hover:underline">
        ← Retour à la galerie
      </Link>
    </section>
  );
}
