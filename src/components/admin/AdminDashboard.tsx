import Link from "next/link";
import { getAdminArtworkStats } from "@/services/artwork.service";
import { prisma } from "@/lib/database/client";

const actions = [
  {
    href: "/admin/tableaux/nouveau",
    label: "Ajouter un tableau",
    description: "Publier une nouvelle œuvre",
    enabled: true,
  },
  {
    href: "/admin/tableaux",
    label: "Voir mes tableaux",
    description: "Modifier ou masquer des œuvres",
    enabled: true,
  },
  {
    href: "/admin/commandes",
    label: "Voir les commandes",
    description: "Suivre les achats et paiements",
    enabled: true,
  },
  {
    href: "/admin/expeditions",
    label: "Préparer un colis",
    description: "Checklist d'emballage",
    enabled: true,
  },
  {
    href: "/admin/contenu",
    label: "Modifier les textes du site",
    description: "Page d'accueil et biographie",
    enabled: true,
  },
  {
    href: "/admin/messages",
    label: "Voir les messages",
    description: "Demandes reçues depuis le site",
    enabled: false,
  },
];

export async function AdminDashboard() {
  const [stats, orders, messages] = await Promise.all([
    getAdminArtworkStats(),
    prisma.order.count({
      where: { paymentStatus: "PAID", fulfillmentStatus: "PENDING" },
    }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Tableaux en vente" value={String(stats.forSale)} />
        <StatCard label="Brouillons" value={String(stats.drafts)} />
        <StatCard label="Colis à préparer" value={String(orders)} />
        <StatCard label="Messages reçus" value={String(messages)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {actions.map((action) =>
          action.enabled ? (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-accent hover:shadow-md"
            >
              <p className="text-lg font-medium text-ink">{action.label}</p>
              <p className="mt-2 text-sm text-stone-500">{action.description}</p>
            </Link>
          ) : (
            <div
              key={action.href}
              className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 opacity-70"
            >
              <p className="text-lg font-medium text-ink">{action.label}</p>
              <p className="mt-2 text-sm text-stone-500">{action.description}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-stone-400">
                Bientôt
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
    </div>
  );
}
