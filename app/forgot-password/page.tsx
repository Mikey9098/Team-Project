"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const sendReset = async () => {
    setMsg(null);

    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setMsg("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT:
      // In Supabase Dashboard -> Auth -> URL Configuration
      // set your Site URL (prod) and Redirect URLs (dev/prod).
      // This must match the URL below.
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(clean, {
        redirectTo,
      });

      if (error) throw error;

      setSent(true);
      setMsg("Password reset link sent. Check your email.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
              {sent ? (
                <CheckCircle2 className="w-5 h-5 text-green-300" />
              ) : (
                <Mail className="w-5 h-5 text-white/80" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Forgot password
              </h1>
              <p className="text-sm text-white/55">
                We’ll email you a reset link.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/45">
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              disabled={loading || sent}
              className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/35 rounded-2xl focus-visible:ring-primary/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !sent) sendReset();
              }}
            />
            <p className="text-xs text-white/40">
              Use the same email you signed up with.
            </p>
          </div>

          {msg && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                sent
                  ? "border-green-500/25 bg-green-500/10 text-green-100"
                  : "border-red-500/25 bg-red-500/10 text-red-100"
              }`}
            >
              {msg}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              onClick={sendReset}
              disabled={loading || sent}
              className="h-11 flex-1 rounded-2xl bg-primary text-black hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : sent ? (
                "Email sent"
              ) : (
                "Send reset link"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/login")}
              className="h-11 rounded-2xl text-white hover:bg-white/10 border border-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="mt-6 text-xs text-white/45">
            Didn’t receive it? Check spam/junk, or{" "}
            <button
              className="text-white/80 hover:text-primary underline underline-offset-4"
              onClick={() => {
                setSent(false);
                setMsg(null);
              }}
              type="button"
            >
              try again
            </button>
            .
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition underline underline-offset-4"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
