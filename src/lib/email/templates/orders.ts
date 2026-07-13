import { getSiteUrl } from "@/lib/email/client";
import {
  detailRow,
  detailsTable,
  formatEuro,
  paragraph,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

type OrderEmailData = {
  orderNumber: string;
  artworkTitle: string;
  customerName: string;
  totalCents: number;
  artworkPriceCents: number;
  shippingPriceCents: number;
};

export function buildOrderConfirmationEmail(data: OrderEmailData) {
  const siteUrl = getSiteUrl();
  const body = [
    paragraph(`Bonjour ${data.customerName},`),
    paragraph(
      `Merci pour votre achat. Votre commande <strong>${data.orderNumber}</strong> est confirmée. Cécile Mackowiak prépare votre tableau avec le plus grand soin.`
    ),
    detailsTable(
      [
        detailRow("Œuvre", data.artworkTitle),
        detailRow("Tableau", formatEuro(data.artworkPriceCents)),
        detailRow("Livraison", formatEuro(data.shippingPriceCents)),
        detailRow("Total payé", `<strong>${formatEuro(data.totalCents)}</strong>`),
      ].join("")
    ),
    paragraph(
      "Vous recevrez un nouvel e-mail dès que votre colis sera expédié, avec un lien de suivi."
    ),
  ].join("");

  return renderEmailLayout({
    title: "Commande confirmée",
    preview: `Confirmation de commande ${data.orderNumber}`,
    body,
    cta: {
      label: "Suivre ma commande",
      href: `${siteUrl}/suivi/${data.orderNumber}`,
    },
  });
}

export function buildOrderPendingEmail(data: OrderEmailData) {
  const body = [
    paragraph(`Bonjour ${data.customerName},`),
    paragraph(
      `Nous avons bien enregistré votre demande d'achat pour <strong>${data.artworkTitle}</strong> (commande ${data.orderNumber}).`
    ),
    detailsTable(
      detailRow("Montant total estimé", formatEuro(data.totalCents))
    ),
    paragraph(
      "Le paiement en ligne sera finalisé très prochainement. Nous vous recontacterons pour confirmer votre commande."
    ),
  ].join("");

  return renderEmailLayout({
    title: "Demande enregistrée",
    preview: `Demande ${data.orderNumber}`,
    body,
  });
}

export function buildNewOrderAdminEmail(
  data: OrderEmailData & { customerEmail: string; orderId: string }
) {
  const siteUrl = getSiteUrl();
  const body = [
    paragraph("Une nouvelle commande vient d'être confirmée."),
    detailsTable(
      [
        detailRow("Commande", data.orderNumber),
        detailRow("Œuvre", data.artworkTitle),
        detailRow("Client", `${data.customerName}<br/><span style="color:#78716c;">${data.customerEmail}</span>`),
        detailRow("Total", formatEuro(data.totalCents)),
      ].join("")
    ),
    paragraph("Préparez le colis depuis l'espace administration."),
  ].join("");

  return renderEmailLayout({
    title: "Nouvelle commande",
    preview: `Commande ${data.orderNumber}`,
    body,
    cta: {
      label: "Voir la commande",
      href: `${siteUrl}/admin/commandes/${data.orderId}`,
    },
  });
}

export function buildOrderShippedEmail(
  data: OrderEmailData & {
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  }
) {
  const siteUrl = getSiteUrl();
  const trackingBlock = data.trackingUrl
    ? paragraph(
        `Numéro de suivi : <strong>${data.trackingNumber ?? "—"}</strong><br/>` +
          `<a href="${data.trackingUrl}" style="color:#1c1917;">Suivre le colis en ligne</a>`
      )
    : paragraph("Votre colis a été remis au transporteur.");

  const body = [
    paragraph(`Bonjour ${data.customerName},`),
    paragraph(
      `Bonne nouvelle : votre tableau <strong>${data.artworkTitle}</strong> vient d'être expédié.`
    ),
    trackingBlock,
    paragraph("Merci de votre confiance."),
  ].join("");

  const cta = data.trackingUrl
    ? { label: "Suivre mon colis", href: data.trackingUrl }
    : { label: "Suivre ma commande", href: `${siteUrl}/suivi/${data.orderNumber}` };

  return renderEmailLayout({
    title: "Votre colis est en route",
    preview: `Expédition ${data.orderNumber}`,
    body,
    cta,
  });
}

export function buildOrderDeliveredEmail(data: OrderEmailData) {
  const siteUrl = getSiteUrl();
  const body = [
    paragraph(`Bonjour ${data.customerName},`),
    paragraph(
      `Votre commande <strong>${data.orderNumber}</strong> a été livrée. Nous espérons que <strong>${data.artworkTitle}</strong> trouvera sa place chez vous.`
    ),
    paragraph(
      "En cas de problème à la réception, photographiez le colis et contactez-nous rapidement."
    ),
  ].join("");

  return renderEmailLayout({
    title: "Colis livré",
    preview: `Livraison ${data.orderNumber}`,
    body,
    cta: { label: "Nous contacter", href: `${siteUrl}/contact` },
  });
}

export function buildPackageReadyAdminEmail(data: OrderEmailData & { orderId: string }) {
  const siteUrl = getSiteUrl();
  const body = [
    paragraph("Le colis est prêt — vous pouvez créer l'étiquette d'expédition."),
    detailsTable(
      [
        detailRow("Commande", data.orderNumber),
        detailRow("Œuvre", data.artworkTitle),
      ].join("")
    ),
  ].join("");

  return renderEmailLayout({
    title: "Colis prêt à expédier",
    preview: data.orderNumber,
    body,
    cta: {
      label: "Créer l'étiquette",
      href: `${siteUrl}/admin/commandes/${data.orderId}`,
    },
  });
}
