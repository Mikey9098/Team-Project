"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Lock,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // When user clicks the email link, Supabase creates a recovery session in the URL.
  // On the client, we just need to confirm we actually have a session before allowing update.
  useEffect(() => {
    const init = async () => {
      setMsg(null);

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      setHasSession(!!session);
      setReady(true);
    };

    init();

    // In case auth state changes after parsing the URL
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePassword = async () => {
    setMsg(null);

    if (!hasSession) {
      setMsg(
        "Your reset link is invalid or expired. Please request a new one."
      );
      return;
    }

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setMsg("Password updated successfully.");
      // Optional: send them to login after a short moment
      setTimeout(() => router.push("/login"), 900);
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to update password.");
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
              {success ? (
                <CheckCircle2 className="w-5 h-5 text-green-300" />
              ) : !hasSession && ready ? (
                <AlertTriangle className="w-5 h-5 text-yellow-300" />
              ) : (
                <Lock className="w-5 h-5 text-white/80" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Reset password
              </h1>
              <p className="text-sm text-white/55">
                Choose a new password for your account.
              </p>
            </div>
          </div>

          {!ready ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing reset session...
            </div>
          ) : !hasSession ? (
            <div className="mt-6 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
              This reset link is invalid or expired. Please go back and request
              a new reset email.
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/45">
                  New password
                </label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  disabled={loading || success}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/35 rounded-2xl focus-visible:ring-primary/40"
                />
                <p className="text-xs text-white/40">
                  Minimum 8 characters recommended.
                </p>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-xs uppercase tracking-wider text-white/45">
                  Confirm password
                </label>
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  disabled={loading || success}
                  className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/35 rounded-2xl focus-visible:ring-primary/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !success) updatePassword();
                  }}
                />
              </div>
            </>
          )}

          {msg && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                success
                  ? "border-green-500/25 bg-green-500/10 text-green-100"
                  : hasSession
                  ? "border-white/10 bg-white/5 text-white/80"
                  : "border-yellow-500/25 bg-yellow-500/10 text-yellow-100"
              }`}
            >
              {msg}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {hasSession ? (
              <Button
                onClick={updatePassword}
                disabled={loading || success}
                className="h-11 flex-1 rounded-2xl bg-primary text-black hover:bg-primary/90"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </span>
                ) : success ? (
                  "Updated"
                ) : (
                  "Update password"
                )}
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 flex-1 rounded-2xl bg-primary text-black hover:bg-primary/90"
              >
                <Link href="/forgot-password">Request new link</Link>
              </Button>
            )}

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
