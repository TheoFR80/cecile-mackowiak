import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/galerie", label: "Galerie" },
  { href: "/artiste", label: "L'artiste" },
  { href: "/livraison", label: "Livraison" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/conditions-generales", label: "CGV" },
  { href: "/politique-retours", label: "Retours" },
];

export function Header() {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-serif text-2xl text-ink">
          Cécile Mackowiak
        </Link>
        <nav className="hidden gap-6 text-sm text-stone-600 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-stone-500">
        <p className="font-serif text-lg text-ink">Cécile Mackowiak</p>
        <p className="mt-2">Artiste peintre — Œuvres originales</p>
        <nav className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6">© {new Date().getFullYear()} Tous droits réservés</p>
      </div>
    </footer>
  );
}
