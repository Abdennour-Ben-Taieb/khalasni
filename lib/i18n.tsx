"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type Language = "en" | "fr" | "ar";

const LANGUAGE_KEY = "khlasni_language";
const DEFAULT_LANGUAGE: Language = "en";

// Same useSyncExternalStore pattern as lib/auth.tsx: keeps React in sync
// with localStorage (and same-tab writes) without a hydration-flash effect.
const languageListeners = new Set<() => void>();

function notifyLanguageChange() {
  for (const listener of languageListeners) listener();
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    languageListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "fr" || value === "ar";
}

function readLanguageSnapshot(): Language {
  const raw = localStorage.getItem(LANGUAGE_KEY);
  return isLanguage(raw) ? raw : DEFAULT_LANGUAGE;
}

function readServerLanguageSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

// Only the strings visible along the main demo path are translated:
// Nav, the landing hero/CTA/how-it-works header, dashboard headers, the
// new-invoice form, and settings — not every string in the app.
const DICTIONARIES: Record<Language, Record<string, string>> = {
  en: {
    "nav.invoices": "Invoices",
    "nav.wallet": "Wallet",
    "nav.newInvoice": "New invoice",
    "nav.stats": "Stats",
    "nav.settings": "Settings",
    "nav.logIn": "Log in",
    "nav.logOut": "Log out",

    "landing.openDemo": "Open the demo",
    "landing.tryDemo": "Try the live demo",
    "landing.heroTitle": "Khlasni chases the money, so you don't have to.",
    "landing.heroSubtitle":
      "You're a freelancer in Tunisia. Your client is abroad. PayPal won't take you. Khlasni is the agent that invoices the client, nags them until they pay, and drops the money in your wallet.",
    "landing.howItWorks": "How it works",

    "dashboard.title": "Your invoices",
    "dashboard.open": "Open",
    "dashboard.settled": "Settled",

    "newInvoice.title": "Forward the job",
    "newInvoice.subtitle":
      "Tell Khlasni who the client is and what you agreed. It builds the invoice and sends the payment link right away.",
    "newInvoice.contractLabel": "Contract PDF",
    "newInvoice.contractHint": "(optional — we'll read it to prefill the form)",
    "newInvoice.clientName": "Client name",
    "newInvoice.clientEmail": "Client email",
    "newInvoice.jobTitle": "Job title",
    "newInvoice.amount": "Amount",
    "newInvoice.currency": "Currency",
    "newInvoice.briefLabel": "Contract or brief",
    "newInvoice.submit": "Generate invoice & send",

    "settings.title": "Account settings",
    "settings.subtitle": "Update your name, email, and avatar.",
    "settings.avatar": "Avatar",
    "settings.name": "Name",
    "settings.email": "Email",
    "settings.save": "Save changes",
    "settings.saved": "Saved",
  },
  fr: {
    "nav.invoices": "Factures",
    "nav.wallet": "Portefeuille",
    "nav.newInvoice": "Nouvelle facture",
    "nav.stats": "Statistiques",
    "nav.settings": "Paramètres",
    "nav.logIn": "Se connecter",
    "nav.logOut": "Se déconnecter",

    "landing.openDemo": "Ouvrir la démo",
    "landing.tryDemo": "Essayer la démo en direct",
    "landing.heroTitle": "Khlasni relance l'argent, pour que vous n'ayez pas à le faire.",
    "landing.heroSubtitle":
      "Vous êtes freelance en Tunisie. Votre client est à l'étranger. PayPal ne vous accepte pas. Khlasni est l'agent qui facture le client, le relance jusqu'au paiement, et dépose l'argent dans votre portefeuille.",
    "landing.howItWorks": "Comment ça marche",

    "dashboard.title": "Vos factures",
    "dashboard.open": "Ouvertes",
    "dashboard.settled": "Réglées",

    "newInvoice.title": "Transmettre la mission",
    "newInvoice.subtitle":
      "Indiquez à Khlasni qui est le client et ce que vous avez convenu. Il crée la facture et envoie le lien de paiement immédiatement.",
    "newInvoice.contractLabel": "Contrat PDF",
    "newInvoice.contractHint": "(optionnel — nous le lisons pour préremplir le formulaire)",
    "newInvoice.clientName": "Nom du client",
    "newInvoice.clientEmail": "Email du client",
    "newInvoice.jobTitle": "Intitulé de la mission",
    "newInvoice.amount": "Montant",
    "newInvoice.currency": "Devise",
    "newInvoice.briefLabel": "Contrat ou brief",
    "newInvoice.submit": "Générer et envoyer la facture",

    "settings.title": "Paramètres du compte",
    "settings.subtitle": "Mettez à jour votre nom, votre email et votre avatar.",
    "settings.avatar": "Avatar",
    "settings.name": "Nom",
    "settings.email": "Email",
    "settings.save": "Enregistrer",
    "settings.saved": "Enregistré",
  },
  ar: {
    "nav.invoices": "الفواتير",
    "nav.wallet": "المحفظة",
    "nav.newInvoice": "فاتورة جديدة",
    "nav.stats": "الإحصائيات",
    "nav.settings": "الإعدادات",
    "nav.logIn": "تسجيل الدخول",
    "nav.logOut": "تسجيل الخروج",

    "landing.openDemo": "افتح العرض التوضيحي",
    "landing.tryDemo": "جرّب العرض المباشر",
    "landing.heroTitle": "خلاصني يلاحق المال، حتى لا تضطر أنت لذلك.",
    "landing.heroSubtitle":
      "أنت مستقل في تونس. عميلك في الخارج. باي بال لا يقبلك. خلاصني هو الوكيل الذي يرسل الفاتورة للعميل، يذكّره حتى يدفع، ويودع المال في محفظتك.",
    "landing.howItWorks": "كيف يعمل",

    "dashboard.title": "فواتيرك",
    "dashboard.open": "مفتوحة",
    "dashboard.settled": "مسددة",

    "newInvoice.title": "أرسل المهمة",
    "newInvoice.subtitle":
      "أخبر خلاصني من هو العميل وما اتفقتما عليه. سيُنشئ الفاتورة ويرسل رابط الدفع فورًا.",
    "newInvoice.contractLabel": "عقد PDF",
    "newInvoice.contractHint": "(اختياري — سنقرأه لتعبئة النموذج تلقائيًا)",
    "newInvoice.clientName": "اسم العميل",
    "newInvoice.clientEmail": "بريد العميل الإلكتروني",
    "newInvoice.jobTitle": "عنوان المهمة",
    "newInvoice.amount": "المبلغ",
    "newInvoice.currency": "العملة",
    "newInvoice.briefLabel": "العقد أو الملخص",
    "newInvoice.submit": "إنشاء الفاتورة وإرسالها",

    "settings.title": "إعدادات الحساب",
    "settings.subtitle": "حدّث اسمك وبريدك الإلكتروني وصورتك الرمزية.",
    "settings.avatar": "الصورة الرمزية",
    "settings.name": "الاسم",
    "settings.email": "البريد الإلكتروني",
    "settings.save": "حفظ التغييرات",
    "settings.saved": "تم الحفظ",
  },
};

type I18n = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof DICTIONARIES.en) => string;
  dir: "ltr" | "rtl";
};

const I18nCtx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    readLanguageSnapshot,
    readServerLanguageSnapshot
  );

  const setLanguage = useCallback((next: Language) => {
    localStorage.setItem(LANGUAGE_KEY, next);
    notifyLanguageChange();
  }, []);

  const t = useCallback<I18n["t"]>(
    (key) => DICTIONARIES[language][key] ?? DICTIONARIES.en[key] ?? key,
    [language]
  );

  const dir: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

  // The <html> element is rendered by the (server) root layout, so the
  // only way to reflect the client-only language choice on it is to set
  // the attributes imperatively once mounted.
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, dir }),
    [language, setLanguage, t, dir]
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
