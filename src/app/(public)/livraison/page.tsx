import Link from "next/link";

export const metadata = {
  title: "Livraison — Cécile Mackowiak",
  description:
    "Comment vos tableaux sont protégés, expédiés et livrés en toute sécurité.",
};

export default function LivraisonPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">Livraison</h1>
      <p className="mt-4 text-stone-600">
        Chaque tableau est une œuvre originale et fragile. Voici comment nous
        assurons une livraison soignée.
      </p>

      <div className="mt-12 space-y-10 text-stone-600 leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl text-ink">Protection de l&apos;œuvre</h2>
          <p className="mt-4">
            Avant expédition, chaque tableau est protégé avec des matériaux adaptés :
            angles renforcés, film de protection, calage et carton double cannelure.
            Un certificat d&apos;authenticité est inclus lorsque l&apos;œuvre le prévoit.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Délais de préparation</h2>
          <p className="mt-4">
            Comptez généralement <strong>3 à 7 jours ouvrés</strong> entre la commande
            et l&apos;expédition. Ce délai permet un emballage minutieux et la génération
            de l&apos;étiquette de transport.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Transporteurs</h2>
          <p className="mt-4">
            Les envois standards passent par des transporteurs colis reconnus (via
            notre partenaire Sendcloud). Les formats volumineux peuvent nécessiter
            un transport spécialisé — dans ce cas, un devis vous est proposé avant
            paiement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Suivi</h2>
          <p className="mt-4">
            Dès l&apos;expédition, vous recevez un numéro de suivi par e-mail pour
            suivre votre colis jusqu&apos;à la livraison.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">Zone de livraison</h2>
          <p className="mt-4">
            Livraison en France métropolitaine et Union européenne. Pour les autres
            destinations ou les formats exceptionnels,{" "}
            <Link href="/contact" className="text-accent underline">
              contactez-moi
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-ink">En cas de dommage</h2>
          <p className="mt-4">
            Si le colis arrive endommagé, photographiez l&apos;emballage et l&apos;œuvre
            sous 48 h et contactez-moi. Nous trouverons une solution ensemble.
          </p>
        </section>
      </div>

      <Link
        href="/galerie"
        className="mt-12 inline-flex rounded-full bg-ink px-8 py-3 text-sm text-white hover:bg-stone-800"
      >
        Voir les œuvres disponibles
      </Link>
    </section>
  );
}
