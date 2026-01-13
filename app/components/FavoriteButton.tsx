"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({
  game,
}: {
  game: { id: number; name: string; background_image?: string | null };
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      const { data: row } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .maybeSingle();

      if (active) setFavorited(!!row?.id);
    })();

    return () => {
      active = false;
    };
  }, [supabase, game.id]);

  const onClick = async () => {
    setMsg(null);
    setLoading(true);

    // optimistic
    const prev = favorited;
    setFavorited(!prev);

    try {
      const res = await toggleFavorite(game);
      setFavorited(res.favorited);
    } catch (e: any) {
      setFavorited(prev);
      setMsg(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={onClick}
        disabled={loading}
        className={`gap-2 rounded-xl ${
          favorited
            ? "bg-primary text-black hover:bg-primary/90"
            : "bg-white/5 text-white hover:bg-white/10"
        }`}
        variant="ghost"
      >
        <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
        {favorited ? "Favorited" : "Add to favorites"}
      </Button>

      {msg && <p className="text-sm text-red-300">{msg}</p>}
    </div>
  );
}
