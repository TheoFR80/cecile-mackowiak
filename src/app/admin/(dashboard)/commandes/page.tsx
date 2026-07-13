import Link from "next/link";
import { formatArtworkPrice } from "@/schemas/artwork.schema";
import { listOrdersForAdmin } from "@/services/shipment.service";

const PAYMENT_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "En attente",
  PAID: "Payée",
  FAILED: "Échouée",
  REFUNDED: "Remboursée",
  DISPUTED: "Litige",
};

export default async function AdminCommandesPage() {
  const orders = await listOrdersForAdmin();

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl text-ink">Commandes</h1>
        <p className="mt-2 text-stone-600">
          {orders.length} commande{orders.length > 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-stone-600">
          Aucune commande pour le moment.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/commandes/${order.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-accent hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {order.artwork.title}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {order.customer?.email}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-ink">
                      {formatArtworkPrice(order.totalCents)}
                    </p>
                    <p className="mt-1 text-stone-500">
                      {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                    </p>
                    {order.shipment?.labelUrl ? (
                      <p className="mt-1 text-green-700">Étiquette créée</p>
                    ) : order.paymentStatus === "PAID" ? (
                      <p className="mt-1 text-accent">À expédier</p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
