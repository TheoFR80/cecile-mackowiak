import Link from "next/link";

const pages = [
  {
    href: "/admin/contenu/accueil",
    label: "Page d'accueil",
    description: "Surtitre, titre et texte d'introduction",
  },
  {
    href: "/admin/contenu/artiste",
    label: "Biographie",
    description: "Texte de la page L'artiste",
  },
];

export default function AdminContenuPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Textes du site</h1>
      <p className="mt-3 text-stone-600">
        Modifiez les textes visibles sur le site public.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-accent hover:shadow-md"
          >
            <p className="text-lg font-medium text-ink">{page.label}</p>
            <p className="mt-2 text-sm text-stone-500">{page.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
