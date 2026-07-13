import { ArtworkWizard } from "@/components/admin/ArtworkWizard";

export default function NewArtworkPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Ajouter un tableau</h1>
      <p className="mt-2 text-stone-600">
        Suivez les étapes pour publier une nouvelle œuvre.
      </p>
      <div className="mt-10">
        <ArtworkWizard />
      </div>
    </div>
  );
}
