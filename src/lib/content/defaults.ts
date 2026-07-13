import type { ArtisteContent, HomepageContent } from "@/types/content";

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  eyebrow: "Artiste peintre",
  title: "Cécile Mackowiak",
  description:
    "Des tableaux qui captent la lumière, l'émotion et le silence des paysages. Chaque œuvre est une invitation à ralentir et à contempler.",
};

export const DEFAULT_ARTISTE_CONTENT: ArtisteContent = {
  title: "L'artiste",
  paragraphs: [
    "Cécile Mackowiak est une artiste peintre passionnée par la lumière, les paysages et les émotions que suscite la nature. Son travail explore les rapports entre couleur, matière et silence.",
    "Formée aux arts plastiques, elle développe une pratique autour de l'huile et de l'acrylique, alternant compositions intimistes et formats plus amples. Chaque tableau est le fruit d'une observation patiente et d'une recherche constante d'harmonie.",
    "Ses œuvres sont exposées et acquises par des collectionneurs particuliers. Ce site permet de découvrir ses créations et d'acquérir directement les tableaux disponibles.",
  ],
};
