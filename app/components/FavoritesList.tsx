"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FavoriteRow = {
  game_id: number;
  game_name: string | null;
  game_image: string | null;
  created_at: string;
};

export default function FavoritesList({
  initialFavorites,
}: {
  initialFavorites: FavoriteRow[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<FavoriteRow[]>(initialFavorites);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);

  const removeFavorite = async (gameId: number) => {
    setMsg(null);
    setBusyIds((prev) => new Set(prev).add(gameId));

    // Optimistic remove
    const prevItems = items;
    setItems((cur) => cur.filter((x) => x.game_id !== gameId));

    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user?.id;
      if (!userId) throw new Error("You are logged out. Please log in again.");

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("game_id", gameId);

      if (error) throw error;
    } catch (e: any) {
      // Rollback
      setItems(prevItems);
      setMsg(e?.message ?? "Failed to remove favorite");
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-lg font-semibold">No favorites yet</p>
        <p className="mt-2 text-sm text-white/60">
          Go to{" "}
          <Link
            href="/games"
            className="text-white underline underline-offset-4"
          >
            Browse Games
          </Link>{" "}
          and hit the Save button.
        </p>
      </div>
    );
  }

  return (
    <div>
      {msg && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((f) => {
          const busy = busyIds.has(f.game_id);

          return (
            <div
              key={f.game_id}
              className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
            >
              <Link href={`/games/${f.game_id}`} className="block">
                <div className="relative aspect-[3/4] bg-black/40">
                  {f.game_image ? (
                    <Image
                      src={f.game_image}
                      alt={f.game_name ?? "Game"}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-white/40 text-sm">
                      No image
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                </div>

                <div className="p-3">
                  <p className="font-semibold text-white line-clamp-1">
                    {f.game_name ?? "Unknown game"}
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Saved {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              <div className="px-3 pb-3">
                <button
                  type="button"
                  onClick={() => removeFavorite(f.game_id)}
                  disabled={busy}
                  className={`
                    w-full h-10 rounded-xl border border-white/10
                    bg-black/40 hover:bg-black/60 transition
                    flex items-center justify-center gap-2 text-sm font-semibold
                    ${busy ? "opacity-70 cursor-not-allowed" : ""}
                  `}
                >
                  <Trash2 className="w-4 h-4" />
                  {busy ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
