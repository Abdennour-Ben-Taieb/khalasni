import type * as PdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { Invoice } from "./types";

let workerConfigured = false;

// pdfjs-dist references browser-only globals (e.g. DOMMatrix) at module
// load time, which crashes Next's SSR pass of this "use client" page. A
// dynamic import defers loading the module until this runs in the browser.
async function loadPdfjs(): Promise<typeof PdfjsLib> {
  const pdfjsLib = await import("pdfjs-dist");
  if (!workerConfigured) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    workerConfigured = true;
  }
  return pdfjsLib;
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

// Client-side only: reads a PDF file and returns its text, roughly
// reconstructing line breaks from pdf.js's per-item end-of-line flags.
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    let pageText = "";
    for (const item of content.items) {
      if (!isTextItem(item)) continue;
      pageText += item.str;
      if (item.hasEOL) pageText += "\n";
    }
    pages.push(pageText);
  }
  return pages.join("\n\n");
}

export type ContractExtraction = {
  clientEmail?: string;
  amount?: number;
  currency?: Invoice["currency"];
  jobTitle?: string;
};

const EMAIL_PATTERN = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const JOB_KEYWORDS = /\b(project|scope|service)\b/i;

const CURRENCY_BY_SYMBOL: Record<string, Invoice["currency"]> = {
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
};

function findMoney(text: string): { amount: number; currency: Invoice["currency"] } | null {
  const moneyPattern =
    /([$€£])\s?([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s?(USD|EUR|GBP)\b|\b(USD|EUR|GBP)\s?([\d,]+(?:\.\d+)?)/i;
  const match = moneyPattern.exec(text);
  if (!match) return null;

  if (match[1] && match[2]) {
    return { amount: parseFloat(match[2].replace(/,/g, "")), currency: CURRENCY_BY_SYMBOL[match[1]] };
  }
  if (match[3] && match[4]) {
    return {
      amount: parseFloat(match[3].replace(/,/g, "")),
      currency: match[4].toUpperCase() as Invoice["currency"],
    };
  }
  if (match[5] && match[6]) {
    return {
      amount: parseFloat(match[6].replace(/,/g, "")),
      currency: match[5].toUpperCase() as Invoice["currency"],
    };
  }
  return null;
}

// Best-effort heuristics only — leaves a field blank rather than guessing
// wrong. The caller decides whether to apply a found value (it won't
// overwrite anything the user already typed).
export function parseContractText(text: string): ContractExtraction {
  const result: ContractExtraction = {};

  const emailMatch = text.match(EMAIL_PATTERN);
  if (emailMatch) result.clientEmail = emailMatch[0];

  const money = findMoney(text);
  if (money) {
    result.amount = money.amount;
    result.currency = money.currency;
  }

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate = lines.find((line) => JOB_KEYWORDS.test(line)) ?? lines[0];
  if (candidate) {
    result.jobTitle = candidate.length > 120 ? `${candidate.slice(0, 120).trim()}…` : candidate;
  }

  return result;
}
