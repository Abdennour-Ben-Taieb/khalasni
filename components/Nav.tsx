"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n, type Language } from "@/lib/i18n";

const LANGUAGES: Language[] = ["en", "fr", "ar"];

export default function Nav({
  active,
}: {
  active?: "dashboard" | "new" | "wallet" | "stats" | "settings";
}) {
  const { user, logOut } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const item = (href: string, key: string, label: string) => (
    <Link
      href={href}
      className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
        active === key
          ? "bg-ivory text-ink font-medium"
          : "text-muted hover:text-ivory"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-white/10">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight">
          khlas<span className="text-chase">ni</span>
        </Link>
        <nav className="flex items-center gap-1">
          {item("/dashboard", "dashboard", t("nav.invoices"))}
          {item("/wallet", "wallet", t("nav.wallet"))}
          {item("/dashboard/new", "new", t("nav.newInvoice"))}
          {item("/stats", "stats", t("nav.stats"))}

          <div className="flex items-center gap-1 ms-2 ps-3 border-s border-white/10">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  language === code
                    ? "bg-ivory text-ink font-medium"
                    : "text-muted hover:text-ivory"
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ms-2 ps-3 border-s border-white/10">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full px-1.5 py-1 text-sm text-muted transition-colors hover:text-ivory"
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a next/image-compatible source
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-2 font-display text-xs text-gold">
                      {user.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                  <span className="hidden sm:inline">{user.name}</span>
                </button>

                {menuOpen && (
                  <div className="absolute end-0 z-10 mt-2 w-40 rounded-md border border-white/10 bg-ink-2 py-1 shadow-lg shadow-black/30">
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-2 text-sm transition-colors ${
                        active === "settings"
                          ? "text-ivory"
                          : "text-muted hover:text-ivory"
                      }`}
                    >
                      {t("nav.settings")}
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        logOut();
                      }}
                      className="block w-full px-3 py-2 text-start text-sm text-muted transition-colors hover:text-ivory"
                    >
                      {t("nav.logOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm px-3 py-1.5 rounded-full text-muted hover:text-ivory transition-colors"
              >
                {t("nav.logIn")}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
