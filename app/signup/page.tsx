"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();

  const [username, setUsername] = useState(""); // ✅ added
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const cleanUsername = username.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { username: cleanUsername }, // ✅ trigger reads this
      },
    });

    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("database error")) {
        return setMsg("Username is already taken. Try another one.");
      }
      return setMsg(error.message);
    }

    setMsg("Account created. Check email if confirmation is enabled.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold tracking-tight">
              Create account
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Join GameHub and save your favorites.
            </p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. amaraa"
                  required
                  minLength={3}
                  maxLength={20}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <p className="text-xs text-white/40">
                3–20 characters. Letters/numbers recommended.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  required
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  required
                  minLength={6}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <p className="text-xs text-white/40">
                Use at least 6 characters (more is better).
              </p>
            </div>

            {/* Message */}
            {msg && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                {msg}
              </div>
            )}

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-black hover:bg-primary/90"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>

        <p className="text-xs text-white/40 mt-4 text-center">
          By signing up you agree to our terms.
        </p>
      </div>
    </div>
  );
}
