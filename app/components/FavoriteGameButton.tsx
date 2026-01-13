"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function FavoriteGameButton({
  game,
  size = "md",
}: {
  game: { id: number; name: string; background_image: string | null };
  size?: "sm" | "md";
}) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;

      setUserId(user.id);

      const { data: row } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("game_id", game.id)
        .maybeSingle();

      setFavorited(!!row);
    };

    init();
  }, [supabase, game.id]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert("Please log in to add favorites");
      return;
    }

    setLoading(true);
    const wasFav = favorited;
    setFavorited(!wasFav);

    try {
      if (wasFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("game_id", game.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: userId,
          game_id: game.id,
          game_name: game.name,
          game_image: game.background_image,
        });
        if (error) throw error;
      }
    } catch (e) {
      setFavorited(wasFav);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border transition active:scale-[0.98]";
  const glass =
    "bg-white/8 hover:bg-white/12 border-white/15 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.02)]";
  const active =
    "bg-primary/90 text-black border-primary shadow-[0_8px_30px_rgba(168,85,247,0.25)]";

  const sizes =
    size === "sm" ? "h-10 px-4 text-sm" : "h-11 px-5 text-sm md:text-base";

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`${base} ${sizes} ${favorited ? active : glass} ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
      <span className="font-semibold">{favorited ? "Saved" : "Save"}</span>
    </button>
  );
}
