"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Nav({ active }: { active?: "dashboard" | "new" | "wallet" }) {
  const { user, logOut } = useAuth();

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
          {item("/dashboard", "dashboard", "Invoices")}
          {item("/wallet", "wallet", "Wallet")}
          {item("/dashboard/new", "new", "New invoice")}
          <div className="ml-2 pl-3 border-l border-white/10 flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-muted">
                  {user.name}
                </span>
                <button
                  onClick={logOut}
                  className="text-sm px-3 py-1.5 rounded-full text-muted hover:text-ivory transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm px-3 py-1.5 rounded-full text-muted hover:text-ivory transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
