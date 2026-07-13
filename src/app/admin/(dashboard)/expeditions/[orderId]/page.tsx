import Link from "next/link";
import { notFound } from "next/navigation";
import { PackingChecklistForm } from "@/components/admin/PackingChecklistForm";
import { getOrCreateChecklist, getPackingOrder } from "@/services/packing.service";

type Props = { params: Promise<{ orderId: string }> };

export default async function AdminExpeditionDetailPage({ params }: Props) {
  const { orderId } = await params;
  const order = await getPackingOrder(orderId);

  if (!order || order.paymentStatus !== "PAID") notFound();

  const checklist =
    order.packingChecklist ?? (await getOrCreateChecklist(orderId));

  return (
    <div>
      <Link
        href="/admin/expeditions"
        className="text-sm text-accent hover:underline"
      >
        ← Retour aux colis
      </Link>

      <h1 className="mt-6 font-serif text-3xl text-ink">Emballage</h1>
      <p className="mt-2 text-stone-600">
        {order.orderNumber} — {order.artwork.title}
      </p>

      <div className="mt-10">
        <PackingChecklistForm
          orderId={order.id}
          artwork={order.artwork}
          checklist={checklist}
          photos={checklist.photos}
        />
      </div>

      {checklist.completedAt && (
        <div className="mt-8">
          <Link
            href={`/admin/commandes/${order.id}`}
            className="inline-flex min-h-[52px] items-center rounded-xl bg-ink px-8 text-base font-medium text-white hover:bg-stone-800"
          >
            Créer l&apos;étiquette d&apos;expédition
          </Link>
        </div>
      )}
    </div>
  );
}
