"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Gamepad2 className="h-5 w-5 text-white/80" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white/90">MyGame</p>
            <p className="text-xs text-white/45">Profile</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/games"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Games
          </Link>
          <Link
            href="/favorites"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            Favorites
          </Link>
          <Link
            href="/profile"
            className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition"
          >
            Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}
