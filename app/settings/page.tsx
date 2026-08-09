"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function Settings() {
  return (
    <RequireAuth>
      <SettingsForm />
    </RequireAuth>
  );
}

function SettingsForm() {
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();

  // RequireAuth only mounts this component once `user` is set, so these
  // initial values are correct from the start. Hooks stay unconditional —
  // the `user`-is-null guard below comes after every hook call.
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const result = updateProfile({ name, email, avatar });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex-1">
      <Nav active="settings" />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl">{t("settings.title")}</h1>
        <p className="text-muted mt-1 text-sm">{t("settings.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not a next/image-compatible source
              <img
                src={avatar}
                alt=""
                className="h-16 w-16 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-ink-2 font-display text-xl text-gold">
                {initial}
              </div>
            )}
            <div>
              <label className="block text-sm text-muted mb-1.5">{t("settings.avatar")}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="block text-sm text-muted file:me-3 file:rounded-md file:border-0 file:bg-ink-2 file:px-3 file:py-2 file:text-sm file:text-ivory hover:file:bg-white/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">{t("settings.name")}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">{t("settings.email")}</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-ink-2 border border-white/10 px-3 py-2.5 text-ivory placeholder:text-muted/60 focus:outline-none focus:border-chase"
            />
          </div>

          {error && <p className="text-sm text-chase">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-chase text-ink font-medium px-6 py-2.5 hover:brightness-110 transition disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? t("settings.saved") : t("settings.save")}
          </button>
        </form>
      </div>
    </div>
  );
}
