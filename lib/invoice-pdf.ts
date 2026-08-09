import { jsPDF } from "jspdf";
import type { Invoice } from "./types";

const STATUS_TEXT: Record<Invoice["status"], string> = {
  sent: "Sent",
  nudged: "Nudged",
  overdue: "Overdue",
  paid: "Paid",
};

// Client-side only: builds a plain, legible one-page invoice PDF and
// triggers a browser download. Doesn't need to match the app's visual
// design — just needs to read like a real invoice a client would receive.
export function downloadInvoicePdf(invoice: Invoice) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 56;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text("Khlasni", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Invoice", pageWidth - marginX, y, { align: "right" });

  y += 14;
  doc.setDrawColor(210);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 32;
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text(`Invoice ID: ${invoice.id}`, marginX, y);
  doc.text(
    `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`,
    pageWidth - marginX,
    y,
    { align: "right" }
  );

  y += 20;
  doc.text(`Status: ${STATUS_TEXT[invoice.status]}`, marginX, y);

  y += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Billed to", marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(invoice.clientName, marginX, y);
  y += 16;
  doc.text(invoice.clientEmail, marginX, y);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("For", marginX, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(invoice.jobTitle, marginX, y);

  y += 44;
  doc.setDrawColor(210);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20);
  doc.text(`${invoice.amount.toLocaleString()} ${invoice.currency}`, marginX, y);

  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`≈ ${Math.round(invoice.amountTND).toLocaleString()} TND`, marginX, y);

  doc.save(`khlasni-invoice-${invoice.id}.pdf`);
}
