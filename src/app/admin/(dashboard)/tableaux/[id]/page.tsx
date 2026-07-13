import { notFound } from "next/navigation";
import { ArtworkWizard, type WizardInitialData } from "@/components/admin/ArtworkWizard";
import { loadArtworkForEdit } from "@/app/admin/(dashboard)/tableaux/actions";
import { centsToEuros } from "@/schemas/artwork.schema";

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await loadArtworkForEdit(id);

  if (!artwork) notFound();

  const initial: WizardInitialData = {
    artworkId: artwork.id,
    title: artwork.title,
    description: artwork.description,
    priceEuros: centsToEuros(artwork.priceCents),
    year: artwork.year,
    category: artwork.category ?? "",
    technique: artwork.technique ?? "",
    support: artwork.support ?? "",
    orientation: artwork.orientation ?? "",
    isFramed: artwork.isFramed,
    hasCertificate: artwork.hasCertificate,
    isSigned: artwork.isSigned,
    widthCm: artwork.widthCm,
    heightCm: artwork.heightCm,
    depthCm: artwork.depthCm,
    weightKg: artwork.weightKg,
    packageWidthCm: artwork.packageWidthCm,
    packageHeightCm: artwork.packageHeightCm,
    packageDepthCm: artwork.packageDepthCm,
    packageWeightKg: artwork.packageWeightKg,
    shippingClass: artwork.shippingClass,
    images: artwork.images.map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId ?? undefined,
      preview: img.url,
      isPrimary: img.isPrimary,
    })),
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink">Modifier le tableau</h1>
      <p className="mt-2 text-stone-600">{artwork.title}</p>
      <div className="mt-10">
        <ArtworkWizard initial={initial} />
      </div>
    </div>
  );
}
