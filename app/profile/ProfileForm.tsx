"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  LogOut,
  Heart,
  Mail,
  BadgeCheck,
  User2,
  ArrowRight,
  Sparkles,
  Upload,
  Trash2,
} from "lucide-react";

/* ----------------------------- UI PARTS ----------------------------- */

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="h-10 w-10 rounded-xl border border-white/10 bg-black/40 grid place-items-center group-hover:bg-black/55 transition">
        {icon}
      </div>
      <div className="leading-tight min-w-0">
        <p className="text-xs text-white/55">{label}</p>
        <p className="text-sm font-semibold text-white/90 truncate">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white/90">{title}</p>
        <p className="text-sm text-white/55">{desc}</p>
      </div>
    </div>
  );
}

function getLetter(label: string) {
  return (label?.trim()?.[0] ?? "?").toUpperCase();
}

/* ----------------------------- MAIN ----------------------------- */

export default function ProfileForm({
  initialUsername,
  email,
  favoritesCount,
  userId,
  initialAvatarUrl,
}: {
  initialUsername: string;
  email: string;
  favoritesCount: number;
  userId: string;
  initialAvatarUrl: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(initialUsername);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);

  const displayName = username?.trim() || email;
  const letter = getLetter(displayName);

  const ok = msg === "Saved";

  const save = async () => {
    setMsg(null);

    const clean = username.trim();
    if (clean.length < 3)
      return setMsg("Username must be at least 3 characters.");
    if (clean.length > 24)
      return setMsg("Username must be under 24 characters.");

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, username: clean }, { onConflict: "id" });

      if (error) throw error;
      setMsg("Saved");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const pickAvatar = () => fileRef.current?.click();

  const uploadAvatar = async (file: File) => {
    setAvatarMsg(null);

    if (!file.type.startsWith("image/")) {
      setAvatarMsg("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg("Max file size is 2MB.");
      return;
    }

    setAvatarBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: publicUrl }, { onConflict: "id" });

      if (profErr) throw profErr;

      setAvatarUrl(publicUrl);
      setAvatarMsg("Avatar uploaded ✅");
    } catch (e: any) {
      setAvatarMsg(e?.message ?? "Upload failed");
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarMsg(null);
    setAvatarBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: null }, { onConflict: "id" });

      if (error) throw error;

      setAvatarUrl(null);
      setAvatarMsg("Avatar removed.");
    } catch (e: any) {
      setAvatarMsg(e?.message ?? "Failed to remove avatar");
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      {/* background glows */}
      <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full bg-primary/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative p-6 md:p-8 space-y-8">
        {/* Profile header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {/* AVATAR (image if exists, else letter) */}
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent" />

              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="h-11 w-11 rounded-xl bg-black/45 border border-white/10 grid place-items-center">
                    <span className="text-lg font-black tracking-tight">
                      {letter}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-2xl font-black tracking-tight truncate">
                  {displayName}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  Member
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-white/55 truncate">
                <Mail className="w-4 h-4" />
                <span className="truncate">{email}</span>
              </div>

              {/* Avatar actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={pickAvatar}
                  disabled={avatarBusy}
                  className="h-9 rounded-xl bg-primary text-black hover:bg-primary/90"
                >
                  {avatarBusy ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload avatar
                    </span>
                  )}
                </Button>

                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={removeAvatar}
                    disabled={avatarBusy}
                    className="h-9 rounded-xl text-white hover:bg-white/10 border border-white/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadAvatar(f);
                    e.currentTarget.value = ""; // allow re-upload same file
                  }}
                />
              </div>

              {avatarMsg && (
                <p className="mt-2 text-xs text-white/55">{avatarMsg}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatPill
              icon={<Heart className="w-5 h-5 text-pink-300" />}
              label="Favorites"
              value={favoritesCount}
            />
            <StatPill
              icon={<User2 className="w-5 h-5 text-white/80" />}
              label="Status"
              value="Active"
            />
          </div>
        </div>

        {/* Divider */}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: edit */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <SectionTitle
              icon={<Sparkles className="w-4 h-4 text-white/80" />}
              title="Public username"
              desc="Shown in your header and profile."
            />

            <div className="mt-5 space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/45">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/35 rounded-xl focus-visible:ring-primary/40"
              />
              <p className="text-xs text-white/40">
                3–24 characters. Letters/numbers recommended.
              </p>
            </div>

            {msg && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  ok
                    ? "border-green-500/25 bg-green-500/10 text-green-100"
                    : "border-red-500/25 bg-red-500/10 text-red-100"
                }`}
              >
                {ok ? "Saved ✅" : msg}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={save}
                disabled={saving}
                className="h-11 rounded-xl bg-primary text-black hover:bg-primary/90"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save changes
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={logout}
                className="h-11 rounded-xl text-white hover:bg-white/10 border border-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Right: quick links */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <p className="text-sm font-semibold text-white/90">Quick links</p>
            <p className="mt-1 text-sm text-white/55">
              Jump to your saved content.
            </p>

            <div className="mt-4 grid gap-3">
              <Link
                href="/favorites"
                className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white/90">Favorites</p>
                    <p className="text-sm text-white/55 truncate">
                      View saved games ({favoritesCount})
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl border border-white/10 bg-black/35 grid place-items-center group-hover:bg-black/55 transition">
                    <ArrowRight className="w-4 h-4 text-white/80" />
                  </div>
                </div>
              </Link>

              {/* <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white/90">Avatar</p>
                <p className="text-sm text-white/55">
                  Uploads to Supabase Storage bucket:{" "}
                  <span className="text-white/80 font-semibold">avatars</span>.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Tip: keep bucket public for easiest setup.
                </p>
              </div> */}

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white/90">Security</p>
                <p className="text-sm text-white/55">
                  Use a strong password and don’t share your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/35">
          Tip: if the header doesn’t update immediately after saving, refresh
          once.
        </p>
      </div>
    </div>
  );
}
