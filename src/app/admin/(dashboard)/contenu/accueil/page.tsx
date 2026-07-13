import Link from "next/link";
import { HomepageContentForm } from "@/components/admin/SiteContentForms";
import { getHomepageContent } from "@/services/content.service";

export default async function AdminAccueilContentPage() {
  const content = await getHomepageContent();

  return (
    <div>
      <Link
        href="/admin/contenu"
        className="text-sm text-stone-500 transition hover:text-ink"
      >
        ← Textes du site
      </Link>

      <h1 className="mt-4 font-serif text-3xl text-ink">Page d'accueil</h1>
      <p className="mt-3 text-stone-600">
        Modifiez le texte principal visible sur la page d&apos;accueil.
      </p>

      <div className="mt-10 max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <HomepageContentForm content={content} />
      </div>
    </div>
  );
}
