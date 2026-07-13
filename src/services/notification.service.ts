import { prisma } from "@/lib/database/client";
import { getEmailFrom, getResendClient, isEmailConfigured } from "@/lib/email/client";
import {
  buildNewOrderAdminEmail,
  buildOrderConfirmationEmail,
  buildOrderDeliveredEmail,
  buildOrderPendingEmail,
  buildOrderShippedEmail,
  buildPackageReadyAdminEmail,
} from "@/lib/email/templates/orders";

async function getOrderEmailContext(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      artwork: true,
      customer: true,
      shippingAddress: true,
    },
  });
}

async function getAdminEmails(): Promise<string[]> {
  const envEmail = process.env.ADMIN_EMAIL;
  const users = await prisma.user.findMany({
    where: { role: { in: ["OWNER", "ARTIST"] }, isActive: true },
    select: { email: true },
  });

  return [...new Set([envEmail, ...users.map((u) => u.email)].filter(Boolean))] as string[];
}

async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (!isEmailConfigured()) return { sent: false as const };

  const resend = getResendClient();
  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  await resend.emails.send({
    from: getEmailFrom(),
    to: recipients,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { sent: true as const };
}

function customerName(order: {
  shippingAddress?: { firstName: string; lastName: string } | null;
  customer?: { firstName: string | null; lastName: string | null } | null;
}) {
  const fromAddress = order.shippingAddress;
  if (fromAddress) return `${fromAddress.firstName} ${fromAddress.lastName}`.trim();
  const fromCustomer = order.customer;
  if (fromCustomer?.firstName || fromCustomer?.lastName) {
    return `${fromCustomer.firstName ?? ""} ${fromCustomer.lastName ?? ""}`.trim();
  }
  return "Client";
}

export async function notifyOrderPaid(orderId: string) {
  try {
    const order = await getOrderEmailContext(orderId);
    if (!order?.customer?.email || !order.artwork) return;

    const base = {
      orderNumber: order.orderNumber,
      artworkTitle: order.artwork.title,
      customerName: customerName(order),
      totalCents: order.totalCents,
      artworkPriceCents: order.artworkPriceCents,
      shippingPriceCents: order.shippingPriceCents,
    };

    const customerEmail = buildOrderConfirmationEmail(base);
    await sendEmail({
      to: order.customer.email,
      subject: `Commande confirmée — ${order.orderNumber}`,
      ...customerEmail,
    });

    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      const adminEmail = buildNewOrderAdminEmail({
        ...base,
        customerEmail: order.customer.email,
        orderId: order.id,
      });
      await sendEmail({
        to: adminEmails,
        subject: `Nouvelle commande — ${order.orderNumber}`,
        ...adminEmail,
      });
    }
  } catch (error) {
    console.error("[email] notifyOrderPaid:", error);
  }
}

export async function notifyOrderPending(orderId: string) {
  try {
    const order = await getOrderEmailContext(orderId);
    if (!order?.customer?.email || !order.artwork) return;

    const base = {
      orderNumber: order.orderNumber,
      artworkTitle: order.artwork.title,
      customerName: customerName(order),
      totalCents: order.totalCents,
      artworkPriceCents: order.artworkPriceCents,
      shippingPriceCents: order.shippingPriceCents,
    };

    const customerEmail = buildOrderPendingEmail(base);
    await sendEmail({
      to: order.customer.email,
      subject: `Demande enregistrée — ${order.orderNumber}`,
      ...customerEmail,
    });

    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      const adminEmail = buildNewOrderAdminEmail({
        ...base,
        customerEmail: order.customer.email,
        orderId: order.id,
      });
      await sendEmail({
        to: adminEmails,
        subject: `Nouvelle demande (paiement en attente) — ${order.orderNumber}`,
        ...adminEmail,
      });
    }
  } catch (error) {
    console.error("[email] notifyOrderPending:", error);
  }
}

export async function notifyOrderShipped(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        artwork: true,
        customer: true,
        shippingAddress: true,
        shipment: true,
      },
    });
    if (!order?.customer?.email || !order.artwork) return;

    const email = buildOrderShippedEmail({
      orderNumber: order.orderNumber,
      artworkTitle: order.artwork.title,
      customerName: customerName(order),
      totalCents: order.totalCents,
      artworkPriceCents: order.artworkPriceCents,
      shippingPriceCents: order.shippingPriceCents,
      trackingNumber: order.shipment?.trackingNumber,
      trackingUrl: order.shipment?.trackingUrl,
    });

    await sendEmail({
      to: order.customer.email,
      subject: `Votre colis est en route — ${order.orderNumber}`,
      ...email,
    });
  } catch (error) {
    console.error("[email] notifyOrderShipped:", error);
  }
}

export async function notifyOrderDelivered(orderId: string) {
  try {
    const order = await getOrderEmailContext(orderId);
    if (!order?.customer?.email || !order.artwork) return;

    const email = buildOrderDeliveredEmail({
      orderNumber: order.orderNumber,
      artworkTitle: order.artwork.title,
      customerName: customerName(order),
      totalCents: order.totalCents,
      artworkPriceCents: order.artworkPriceCents,
      shippingPriceCents: order.shippingPriceCents,
    });

    await sendEmail({
      to: order.customer.email,
      subject: `Colis livré — ${order.orderNumber}`,
      ...email,
    });
  } catch (error) {
    console.error("[email] notifyOrderDelivered:", error);
  }
}

export async function notifyPackageReady(orderId: string) {
  try {
    const order = await getOrderEmailContext(orderId);
    if (!order?.artwork) return;

    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    const email = buildPackageReadyAdminEmail({
      orderNumber: order.orderNumber,
      artworkTitle: order.artwork.title,
      customerName: customerName(order),
      totalCents: order.totalCents,
      artworkPriceCents: order.artworkPriceCents,
      shippingPriceCents: order.shippingPriceCents,
      orderId: order.id,
    });

    await sendEmail({
      to: adminEmails,
      subject: `Colis prêt — ${order.orderNumber}`,
      ...email,
    });
  } catch (error) {
    console.error("[email] notifyPackageReady:", error);
  }
}
