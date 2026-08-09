"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ChaseEvent, Invoice, WalletBalance } from "./types";
import {
  FX_TO_TND,
  fakeGravvLink,
  genInvoiceId,
  nextChaseMessage,
  paidMessage,
  sentMessage,
} from "./mock-agent";

function seedInvoices(): Invoice[] {
  const now = Date.now();
  const mk = (
    partial: Omit<Invoice, "id" | "paymentLink" | "amountTND" | "events" | "createdAt" | "dueAt" | "daysOpenAtSeed"> & {
      daysAgo: number;
      events: Array<{ daysAgo: number; actor: ChaseEvent["actor"]; label: ChaseEvent["label"]; message: string }>;
    }
  ): Invoice => {
    const id = genInvoiceId();
    const createdAt = new Date(now - partial.daysAgo * 86400000).toISOString();
    return {
      id,
      clientName: partial.clientName,
      clientEmail: partial.clientEmail,
      jobTitle: partial.jobTitle,
      amount: partial.amount,
      currency: partial.currency,
      amountTND: partial.amount * FX_TO_TND[partial.currency],
      status: partial.status,
      createdAt,
      daysOpenAtSeed: partial.daysAgo,
      dueAt: new Date(now - (partial.daysAgo - 7) * 86400000).toISOString(),
      paymentLink: fakeGravvLink(id),
      events: partial.events.map((e, i) => ({
        id: `${id}-e${i}`,
        at: new Date(now - e.daysAgo * 86400000).toISOString(),
        actor: e.actor,
        label: e.label,
        message: e.message,
      })),
    };
  };

  return [
    mk({
      clientName: "Marcus Webb",
      clientEmail: "marcus@northloop.io",
      jobTitle: "Landing page redesign",
      amount: 950,
      currency: "USD",
      status: "paid",
      daysAgo: 12,
      events: [
        { daysAgo: 12, actor: "agent", label: "SENT", message: "Invoice sent to Marcus Webb for \"Landing page redesign\"." },
        { daysAgo: 8, actor: "agent", label: "NUDGED", message: "Following up — invoice still open." },
        { daysAgo: 5, actor: "client", label: "PAID", message: "Marcus paid via Gravv. Funds converted to TND." },
      ],
    }),
    mk({
      clientName: "Élise Fontaine",
      clientEmail: "elise@atelier-fontaine.fr",
      jobTitle: "Brand identity — logo + guidelines",
      amount: 1400,
      currency: "EUR",
      status: "nudged",
      daysAgo: 6,
      events: [
        { daysAgo: 6, actor: "agent", label: "SENT", message: "Invoice sent to Élise Fontaine for \"Brand identity — logo + guidelines\"." },
        { daysAgo: 2, actor: "agent", label: "NUDGED", message: "Quick nudge — the invoice is still open." },
      ],
    }),
    mk({
      clientName: "Daniel Okoye",
      clientEmail: "d.okoye@brightleafstudio.com",
      jobTitle: "React dashboard — sprint 3",
      amount: 620,
      currency: "GBP",
      status: "overdue",
      daysAgo: 15,
      events: [
        { daysAgo: 15, actor: "agent", label: "SENT", message: "Invoice sent to Daniel Okoye for \"React dashboard — sprint 3\"." },
        { daysAgo: 10, actor: "agent", label: "NUDGED", message: "Following up — invoice still open." },
        { daysAgo: 5, actor: "agent", label: "NUDGED", message: "Second follow-up sent." },
        { daysAgo: 1, actor: "agent", label: "NUDGED", message: "This is a firmer follow-up — invoice is now overdue." },
      ],
    }),
  ];
}

type Store = {
  invoices: Invoice[];
  wallet: WalletBalance[];
  createInvoice: (input: {
    clientName: string;
    clientEmail: string;
    jobTitle: string;
    amount: number;
    currency: Invoice["currency"];
    contractText?: string;
  }) => Invoice;
  chase: (id: string) => void;
  markPaid: (id: string) => void;
  getInvoice: (id: string) => Invoice | undefined;
};

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => seedInvoices());
  const [wallet, setWallet] = useState<WalletBalance[]>([
    { currency: "TND", amount: 2907 },
    { currency: "USD", amount: 0 },
    { currency: "EUR", amount: 0 },
  ]);

  const getInvoice = useCallback((id: string) => invoices.find((i) => i.id === id), [invoices]);

  const createInvoice: Store["createInvoice"] = useCallback((input) => {
    const id = genInvoiceId();
    const now = new Date().toISOString();
    const link = fakeGravvLink(id);
    const draft: Invoice = {
      id,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      jobTitle: input.jobTitle,
      amount: input.amount,
      currency: input.currency,
      amountTND: input.amount * FX_TO_TND[input.currency],
      status: "sent",
      createdAt: now,
      daysOpenAtSeed: 0,
      dueAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      paymentLink: link,
      events: [],
      contractText: input.contractText,
    };
    draft.events = [
      {
        id: `${id}-e0`,
        at: now,
        actor: "agent",
        label: "SENT",
        message: sentMessage(draft),
      },
    ];
    setInvoices((prev) => [draft, ...prev]);
    return draft;
  }, []);

  const chase: Store["chase"] = useCallback((id) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id || inv.status === "paid") return inv;
        const { label, message } = nextChaseMessage(inv);
        const event: ChaseEvent = {
          id: `${id}-e${inv.events.length}`,
          at: new Date().toISOString(),
          actor: "agent",
          label,
          message,
        };
        const nudgeCount = inv.events.filter((e) => e.label === "NUDGED").length + 1;
        return {
          ...inv,
          status: nudgeCount >= 3 ? "overdue" : "nudged",
          events: [...inv.events, event],
        };
      })
    );
  }, []);

  const markPaid: Store["markPaid"] = useCallback((id) => {
    setInvoices((prev) => {
      const inv = prev.find((i) => i.id === id);
      if (!inv || inv.status === "paid") return prev;
      const event: ChaseEvent = {
        id: `${id}-e${inv.events.length}`,
        at: new Date().toISOString(),
        actor: "client",
        label: "PAID",
        message: paidMessage(inv),
      };
      setWallet((w) =>
        w.map((b) => {
          if (b.currency === inv.currency) return { ...b, amount: b.amount + inv.amount };
          if (b.currency === "TND") return { ...b, amount: Math.round(b.amount + inv.amountTND) };
          return b;
        })
      );
      return prev.map((i) => (i.id === id ? { ...i, status: "paid", events: [...i.events, event] } : i));
    });
  }, []);

  const value = useMemo(
    () => ({ invoices, wallet, createInvoice, chase, markPaid, getInvoice }),
    [invoices, wallet, createInvoice, chase, markPaid, getInvoice]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
