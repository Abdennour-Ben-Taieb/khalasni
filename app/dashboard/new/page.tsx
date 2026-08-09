"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n";
import { extractPdfText, parseContractText } from "@/lib/pdf";
import { useStore } from "@/lib/store";
import type { Invoice } from "@/lib/types";

const CURRENCY_SYMBOL: Record<Invoice["currency"], string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function formatMoney(amount: number, currency: Invoice["currency"]) {
  return `${CURRENCY_SYMBOL[currency]}${amount.toLocaleString()} ${currency}`;
}

export default function NewInvoice() {
  const router = useRouter();
  const { createInvoice } = useStore();
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    jobTitle: "",
    amount: "",
    currency: "USD" as Invoice["currency"],
    brief: "",
  });

  const [contractFileName, setContractFileName] = useState<string | null>(null);
  const [contractText, setContractText] = useState<string | null>(null);
  const [parsingContract, setParsingContract] = useState(false);
  const [contractSummary, setContractSummary] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleContractFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setParsingContract(true);
    setContractError(null);
    setContractSummary(null);
    setContractFileName(file.name);

    try {
      const text = await extractPdfText(file);
      setContractText(text);
      const extracted = parseContractText(text);

      const found: string[] = [];
      const next = { ...form };

      if (!form.clientEmail.trim() && extracted.clientEmail) {
        next.clientEmail = extracted.clientEmail;
        found.push("client email");
      }
      if (!form.amount.trim() && extracted.amount != null && extracted.currency) {
        next.amount = String(extracted.amount);
        next.currency = extracted.currency;
        found.push(formatMoney(extracted.amount, extracted.currency));
      }
      if (!form.jobTitle.trim() && extracted.jobTitle) {
        next.jobTitle = extracted.jobTitle;
        found.push("job title");
      }

      setForm(next);
      setContractSummary(
        found.length > 0
          ? `Found: ${found.join(", ")}. Double-check before sending.`
          : "Couldn't find anything to prefill — fill in the form manually."
      );
    } catch {
      setContractText(null);
      setContractError("Couldn't read that PDF. Try a different file or fill in the form manually.");
    } finally {
      setParsingContract(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientName || !form.jobTitle || !form.amount) return;
    setSubmitting(true);
    // Simulate the agent reading the job before it fires the invoice.
    setTimeout(() => {
      const invoice = createInvoice({
        clientName: form.clientName,
        clientEmail: form.clientEmail || "client@example.com",
        jobTitle: form.jobTitle,
        amount: Number(form.amount),
        currency: form.currency,
        contractText: contractText ?? undefined,
      });
      router.push(`/invoice/${invoice.id}`);
    }, 900);
  }

  return (
    <RequireAuth>
      <div className="flex-1">
        <Nav active="new" />
        <div className="max-w-xl mx-auto px-6 py-10">
          <h1 className="font-display text-3xl">{t("newInvoice.title")}</h1>
          <p className="text-muted mt-1 text-sm">{t("newInvoice.subtitle")}</p>

          <div className="mt-8 rounded-md border border-dashed border-white/15 px-4 py-4">
            <label className="block text-sm text-muted mb-1.5">
              {t("newInvoice.contractLabel")}{" "}
              <span className="text-muted/60">{t("newInvoice.contractHint")}</span>
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleContractFile}
              className="block w-full text-sm text-muted file:me-3 file:rounded-md file:border-0 file:bg-ink-2 file:px-3 file:py-2 file:text-sm file:text-ivory hover:file:bg-white/10"
            />
            {contractFileName && !parsingContract && (
              <p className="mt-2 text-xs text-muted">{contractFileName}</p>
            )}
            {parsingContract && (
              <p className="mt-2 text-sm text-gold">Reading contract…</p>
            )}
            {!parsingContract && contractSummary && (
              <p className="mt-2 text-sm text-settled">{contractSummary}</p>
            )}
            {!parsingContract && contractError && (
              <p className="mt-2 text-sm text-chase">{contractError}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm text-muted mb-1.5">
                {t("newInvoice.clientName")}
              </label>
              <input
                required
                value={form.clientName}
                onChange={(e) => update("clientName", e.target.value)}
                placeholder="Marcus Webb"
                className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">
                {t("newInvoice.clientEmail")}
              </label>
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => update("clientEmail", e.target.value)}
                placeholder="marcus@company.com"
                className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">
                {t("newInvoice.jobTitle")}
              </label>
              <input
                required
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                placeholder="Landing page redesign"
                className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="block text-sm text-muted mb-1.5">
                  {t("newInvoice.amount")}
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  placeholder="950"
                  className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 font-mono-tabular text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">
                  {t("newInvoice.currency")}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    update("currency", e.target.value as Invoice["currency"])
                  }
                  className="rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory focus:outline-none focus:border-chase"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">
                {t("newInvoice.briefLabel")}{" "}
                <span className="text-muted/60">(optional, paste anything)</span>
              </label>
              <textarea
                value={form.brief}
                onChange={(e) => update("brief", e.target.value)}
                rows={4}
                placeholder="Paste the client thread, scope, or contract terms — the agent reads this to fill in the gaps."
                className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-chase text-ink font-medium py-3 hover:brightness-110 transition disabled:opacity-60"
            >
              {submitting ? "Reading the job…" : t("newInvoice.submit")}
            </button>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}
