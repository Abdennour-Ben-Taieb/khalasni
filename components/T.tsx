"use client";

import { useI18n } from "@/lib/i18n";

type TranslationKey = Parameters<ReturnType<typeof useI18n>["t"]>[0];

// Lets a Server Component render a translated string by dropping in this
// client leaf, instead of converting the whole page to a Client Component.
export default function T({ k }: { k: TranslationKey }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
