import Link from "next/link";
import { listOrdersAwaitingPacking } from "@/services/packing.service";

export default async function AdminExpeditionsPage() {
  const orders = await listOrdersAwaitingPacking();

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Préparer un colis</h1>
      <p className="mt-2 text-stone-600">
        Commandes payées en attente d&apos;emballage.
      </p>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-stone-600">
          Aucun colis à préparer pour le moment.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/expeditions/${order.id}`}
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
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
                    À emballer
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
