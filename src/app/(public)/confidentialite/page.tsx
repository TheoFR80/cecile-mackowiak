import { LegalPage } from "@/components/public/LegalPage";

export const metadata = {
  title: "Politique de confidentialité — Cécile Mackowiak",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité">
      <p>
        Les données collectées via le formulaire de contact et lors d&apos;une
        commande (nom, e-mail, adresse) sont utilisées uniquement pour traiter
        votre demande ou votre achat.
      </p>
      <p>
        Elles ne sont ni vendues ni cédées à des tiers. Vous pouvez demander
        l&apos;accès, la rectification ou la suppression de vos données en nous
        contactant.
      </p>
      <p className="text-sm text-stone-500">
        Texte provisoire — à valider juridiquement avant la mise en production.
      </p>
    </LegalPage>
  );
}
