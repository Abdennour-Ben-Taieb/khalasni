export type InvoiceStatus = "sent" | "nudged" | "overdue" | "paid";

export type ChaseEvent = {
  id: string;
  at: string; // ISO timestamp
  actor: "agent" | "client" | "system";
  label: string; // e.g. "SENT", "NUDGED", "PAID"
  message: string;
};

export type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  jobTitle: string;
  amount: number;
  currency: "USD" | "EUR" | "GBP";
  amountTND: number;
  status: InvoiceStatus;
  createdAt: string;
  daysOpenAtSeed: number; // fixed at creation so display never depends on render-time clock reads
  dueAt: string;
  paymentLink: string;
  events: ChaseEvent[];
  contractText?: string;
};

export type WalletBalance = {
  currency: "USD" | "EUR" | "GBP" | "TND";
  amount: number;
};
