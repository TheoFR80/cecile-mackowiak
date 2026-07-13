import { LegalPage } from "@/components/public/LegalPage";

export const metadata = {
  title: "Politique de retours — Cécile Mackowiak",
};

export default function RetoursPage() {
  return (
    <LegalPage title="Politique de retours">
      <p>
        Chaque tableau est une pièce unique préparée et expédiée avec soin. En cas
        de problème à la réception (dommage, non-conformité), contactez-moi dans
        les 48 heures avec des photos du colis et de l&apos;œuvre.
      </p>
      <p>
        Les modalités de retour ou de remboursement seront définies au cas par cas,
        en tenant compte de la nature de l&apos;œuvre d&apos;art.
      </p>
      <p className="text-sm text-stone-500">
        Texte provisoire — à valider juridiquement avant la mise en production.
      </p>
    </LegalPage>
  );
}
