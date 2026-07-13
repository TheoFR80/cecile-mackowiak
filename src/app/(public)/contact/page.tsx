import { ContactForm } from "@/components/public/ContactForm";

export const metadata = {
  title: "Contact — Cécile Mackowiak",
  description: "Contactez Cécile Mackowiak pour une œuvre, une commande ou une exposition.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-serif text-4xl text-ink">Contact</h1>
      <p className="mt-4 text-stone-600">
        Pour toute demande concernant une œuvre, une commande ou une exposition,
        utilisez le formulaire ci-dessous.
      </p>
      <ContactForm />
    </section>
  );
}
