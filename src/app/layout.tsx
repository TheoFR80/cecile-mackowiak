import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cécile Mackowiak — Artiste peintre",
  description:
    "Découvrez et acquérez les tableaux originaux de Cécile Mackowiak, artiste peintre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
