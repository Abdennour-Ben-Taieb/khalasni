"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Signup() {
  const router = useRouter();
  const { user, signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = signUp(form.name, form.email, form.password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex-1">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight">
            khlas<span className="text-chase">ni</span>
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl">Create your account</h1>
        <p className="text-muted mt-1 text-sm">
          Set up Khlasni to start invoicing and getting chased for you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Amina Trabelsi"
              className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
            />
          </div>

          {error && <p className="text-sm text-chase">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-chase text-ink font-medium py-3 hover:brightness-110 transition disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-chase underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
