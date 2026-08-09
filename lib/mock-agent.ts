import type { ChaseEvent, Invoice } from "./types";

// Stand-in FX rates for the demo. Swap for a real feed later.
export const FX_TO_TND: Record<Invoice["currency"], number> = {
  USD: 3.06,
  EUR: 3.32,
  GBP: 3.86,
};

export function fakeGravvLink(invoiceId: string) {
  return `https://pay.gravv.app/khlasni/${invoiceId}`;
}

export function genInvoiceId() {
  return `KH-${Math.floor(1000 + Math.random() * 9000)}`;
}

const SENT_MESSAGES = (clientName: string, jobTitle: string, link: string) => [
  `Hi ${clientName}, this is Khlasni, handling invoicing for this project. Here's the invoice for "${jobTitle}" — pay securely here: ${link}`,
];

const NUDGE_MESSAGES = (clientName: string) => [
  `Hi ${clientName}, quick nudge — the invoice is still open. Happy to answer any questions before you send it over.`,
  `Hi ${clientName}, following up again. The invoice is a few days old now — let me know if something's blocking payment.`,
  `${clientName}, this is a firmer follow-up. The invoice is now overdue — please settle it today or tell me if there's an issue on your end.`,
];

export function nextChaseMessage(invoice: Invoice): { label: ChaseEvent["label"]; message: string } {
  const nudgeCount = invoice.events.filter((e) => e.label === "NUDGED").length;
  if (nudgeCount >= 2) {
    return { label: "NUDGED", message: NUDGE_MESSAGES(invoice.clientName)[2] };
  }
  return { label: "NUDGED", message: NUDGE_MESSAGES(invoice.clientName)[nudgeCount] };
}

export function sentMessage(invoice: Invoice) {
  return SENT_MESSAGES(invoice.clientName, invoice.jobTitle, invoice.paymentLink)[0];
}

export function paidMessage(invoice: Invoice) {
  return `Payment received from ${invoice.clientName}. ${invoice.amount} ${invoice.currency} landed in your Gravv wallet and converted to ${Math.round(
    invoice.amountTND
  ).toLocaleString()} TND at today's rate.`;
}
