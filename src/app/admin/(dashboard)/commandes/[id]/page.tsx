import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateLabelButton } from "@/components/admin/CreateLabelButton";
import { isPackageReadyForLabel } from "@/lib/packing/checklist-utils";
import { formatArtworkPrice } from "@/schemas/artwork.schema";
import { getOrderForAdmin } from "@/services/shipment.service";

type Props = { params: Promise<{ id: string }> };

const PAYMENT_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
};

export default async function AdminCommandeDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  const address = order.shippingAddress;
  const packingReady = isPackageReadyForLabel(order.packingChecklist);

  return (
    <div>
      <Link
        href="/admin/commandes"
        className="text-sm text-accent hover:underline"
      >
        ← Retour aux commandes
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-ink">{order.orderNumber}</h1>
      <p className="mt-2 text-stone-600">{order.artwork.title}</p>

      <dl className="mt-10 grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Paiement</dt>
          <dd className="mt-1 text-ink">
            {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Total</dt>
          <dd className="mt-1 text-ink">{formatArtworkPrice(order.totalCents)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Tableau</dt>
          <dd className="mt-1">{formatArtworkPrice(order.artworkPriceCents)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Livraison</dt>
          <dd className="mt-1">
            {formatArtworkPrice(order.shippingPriceCents)}
            {order.shippingServiceName && (
              <span className="block text-stone-500">{order.shippingServiceName}</span>
            )}
          </dd>
        </div>
        {address && (
          <div className="sm:col-span-2">
            <dt className="text-stone-500">Adresse de livraison</dt>
            <dd className="mt-1 text-ink">
              {address.firstName} {address.lastName}
              <br />
              {address.street1}
              {address.street2 && (
                <>
                  <br />
                  {address.street2}
                </>
              )}
              <br />
              {address.postalCode} {address.city}
              <br />
              {address.countryCode}
            </dd>
          </div>
        )}
      </dl>

      {order.paymentStatus === "PAID" && (
        <div className="mt-8 space-y-4">
          {!packingReady && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm text-amber-900">
                Avant de créer l&apos;étiquette, terminez la checklist d&apos;emballage.
              </p>
              <Link
                href={`/admin/expeditions/${order.id}`}
                className="mt-3 inline-flex min-h-[48px] items-center rounded-xl bg-ink px-6 text-sm text-white hover:bg-stone-800"
              >
                Préparer le colis
              </Link>
            </div>
          )}

          {packingReady && (
            <CreateLabelButton
              orderId={order.id}
              existingLabelUrl={order.shipment?.labelUrl}
              trackingNumber={order.shipment?.trackingNumber}
              trackingUrl={order.shipment?.trackingUrl}
            />
          )}

          {order.shipment?.trackingUrl && (
            <a
              href={order.shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center rounded-xl border border-stone-300 px-6 text-sm text-ink hover:border-ink"
            >
              Suivre le colis
            </a>
          )}
        </div>
      )}
    </div>
  );
}
