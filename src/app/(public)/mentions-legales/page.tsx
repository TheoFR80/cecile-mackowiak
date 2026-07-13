import { LegalPage } from "@/components/public/LegalPage";

export const metadata = {
  title: "Mentions légales — Cécile Mackowiak",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales">
      <p>
        <strong>Éditeur du site</strong> — Cécile Mackowiak, artiste peintre.
      </p>
      <p>
        <strong>Hébergement</strong> — Hostinger VPS (informations complètes à
        compléter avant mise en production).
      </p>
      <p>
        <strong>Contact</strong> — via le{" "}
        <a href="/contact" className="text-accent underline">
          formulaire de contact
        </a>
        .
      </p>
      <p className="text-sm text-stone-500">
        Ce texte est provisoire et devra être adapté au statut juridique réel de
        la vendeuse avant la mise en production.
      </p>
    </LegalPage>
  );
}
