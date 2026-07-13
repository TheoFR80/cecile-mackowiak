import Link from "next/link";
import { ArtisteContentForm } from "@/components/admin/SiteContentForms";
import { getArtisteContent } from "@/services/content.service";

export default async function AdminArtisteContentPage() {
  const content = await getArtisteContent();

  return (
    <div>
      <Link
        href="/admin/contenu"
        className="text-sm text-stone-500 transition hover:text-ink"
      >
        ← Textes du site
      </Link>

      <h1 className="mt-4 font-serif text-3xl text-ink">Biographie</h1>
      <p className="mt-3 text-stone-600">
        Modifiez le texte de la page L&apos;artiste.
      </p>

      <div className="mt-10 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <ArtisteContentForm content={content} />
      </div>
    </div>
  );
}
