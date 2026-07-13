import { getSiteUrl } from "@/lib/email/client";

type LayoutOptions = {
  title: string;
  preview?: string;
  body: string;
  cta?: { label: string; href: string };
};

export function renderEmailLayout({ title, preview, body, cta }: LayoutOptions) {
  const siteUrl = getSiteUrl();

  const ctaBlock = cta
    ? `<p style="margin:32px 0 0;text-align:center;">
        <a href="${cta.href}" style="display:inline-block;background:#1c1917;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;">
          ${cta.label}
        </a>
      </p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${preview ? `<meta name="description" content="${preview}" />` : ""}
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Georgia,'Times New Roman',serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <p style="margin:0 0 32px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;">
      Cécile Mackowiak
    </p>
    <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;padding:32px 28px;">
      <h1 style="margin:0 0 20px;font-size:28px;font-weight:normal;line-height:1.3;">${title}</h1>
      ${body}
      ${ctaBlock}
    </div>
    <p style="margin:32px 0 0;font-size:13px;line-height:1.6;color:#78716c;text-align:center;">
      <a href="${siteUrl}" style="color:#78716c;">${siteUrl.replace(/^https?:\/\//, "")}</a>
    </p>
  </div>
</body>
</html>`;

  const text = `${title}\n\n${stripHtml(body)}\n\n${cta ? `${cta.label}: ${cta.href}\n\n` : ""}${siteUrl}`;

  return { html, text };
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#44403c;">${text}</p>`;
}

export function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:#78716c;vertical-align:top;">${label}</td>
    <td style="padding:8px 0 8px 16px;font-size:14px;color:#1c1917;text-align:right;">${value}</td>
  </tr>`;
}

export function detailsTable(rows: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border-top:1px solid #e7e5e4;border-bottom:1px solid #e7e5e4;">
    ${rows}
  </table>`;
}
