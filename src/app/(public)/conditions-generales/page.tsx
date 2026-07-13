import { LegalPage } from "@/components/public/LegalPage";

export const metadata = {
  title: "Conditions générales de vente — Cécile Mackowiak",
};

export default function CgvPage() {
  return (
    <LegalPage title="Conditions générales de vente">
      <p>
        Les œuvres proposées sont des originaux uniques. Le prix affiché est en
        euros TTC. Les frais de livraison sont calculés selon le format et la
        destination, et affichés avant le paiement.
      </p>
      <p>
        Le paiement en ligne par carte bancaire confirme la commande. Droit de
        rétractation : conformément à la réglementation applicable aux œuvres
        d&apos;art, les conditions seront précisées ici avant la mise en production.
      </p>
      <p className="text-sm text-stone-500">
        Texte provisoire — à valider juridiquement avant la mise en production.
      </p>
    </LegalPage>
  );
}
