"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import GameFilters from "../components/Gamefilters";
import { createClient } from "@/lib/supabase/client";

// --- TYPES ---
export type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
  rating: number;
  genres?: { id: number; name: string }[];
};

export type Genre = {
  id: number;
  name: string;
  slug: string;
};

const API_KEY = "14af43f3b477423b9ddd26df233927db";

// --- COMPONENT: GAME CARD ---
export const GameCard = ({
  game,
  isFavorited,
  onToggleFavorite,
  favLoading,
}: {
  game: Game;
  isFavorited: boolean;
  favLoading: boolean;
  onToggleFavorite: (game: Game) => void;
}) => {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative block w-full bg-[#111217] rounded-sm overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          fill
          src={game.background_image || "/placeholder.jpg"}
          alt={game.name}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

        {/* ❤️ Favorite Button (overlay) */}
        <button
          type="button"
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
          onClick={(e) => {
            e.preventDefault(); // stop Link navigation
            e.stopPropagation();
            onToggleFavorite(game);
          }}
          disabled={favLoading}
          className={`
            absolute top-3 right-3 z-10
            h-10 w-10 rounded-full grid place-items-center
            border border-white/15 backdrop-blur-md
            transition
            ${
              isFavorited
                ? "bg-primary/90 text-black"
                : "bg-black/40 text-white hover:bg-black/55"
            }
            ${favLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between h-32">
        {/* Game Name */}
        <h3 className="text-white font-bold text-lg line-clamp-1 group-hover:text-purple-400 transition-colors duration-300">
          {game.name}
        </h3>

        {/* Genres + Rating */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {game.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-0.5 text-xs font-semibold text-purple-200 bg-purple-900/40 rounded-full uppercase"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-white text-xs font-semibold">
              {game.rating || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function GamesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  // URL PARAMS
  const sort = searchParams.get("sort") || "newest";
  const genre = searchParams.get("genre") || "all";
  const year = searchParams.get("year") || "all";

  const [games, setGames] = useState<Game[]>([]);
  const [genresList, setGenresList] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);

  // Favorites state
  const [userId, setUserId] = useState<string | null>(null);
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [favBusyIds, setFavBusyIds] = useState<Set<number>>(new Set());
  const [favMsg, setFavMsg] = useState<string | null>(null);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`/games?${params.toString()}`);
  };

  // Get session once + subscribe
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setFavoritesSet(new Set()); // reset favorites when auth changes
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // 1) Fetch genre list
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/genres?key=${API_KEY}`
        );
        const data = await res.json();
        setGenresList(data.results);
      } catch (err) {
        console.error("Failed to fetch genres list", err);
      }
    };
    fetchGenres();
  }, []);

  // 2) Fetch games when filters change
  const fetchGames = async () => {
    setLoading(true);

    let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=40`;

    if (sort === "newest") url += `&ordering=-released`;
    if (sort === "oldest") url += `&ordering=released`;
    if (sort === "popular") url += `&ordering=-rating`;

    if (genre !== "all") url += `&genres=${genre}`;

    if (year !== "all") url += `&dates=${year}-01-01,${year}-12-31`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setGames(data.results.filter((g: Game) => g.background_image));
    } catch (err) {
      console.error("Failed to fetch games", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, genre, year]);

  // 3) Load favorites for current games (ONE query)
  useEffect(() => {
    const loadFavoritesForPage = async () => {
      setFavMsg(null);
      if (!userId) {
        setFavoritesSet(new Set());
        return;
      }
      if (!games.length) return;

      const ids = games.map((g) => g.id);

      const { data, error } = await supabase
        .from("favorites")
        .select("game_id")
        .eq("user_id", userId)
        .in("game_id", ids);

      if (error) {
        console.error(error);
        return;
      }

      setFavoritesSet(new Set((data ?? []).map((r) => r.game_id)));
    };

    loadFavoritesForPage();
  }, [games, userId, supabase]);

  // 4) Toggle favorite
  const toggleFavorite = async (game: Game) => {
    setFavMsg(null);

    if (!userId) {
      setFavMsg("Please log in to save favorites.");
      return;
    }

    // lock per-card
    setFavBusyIds((prev) => new Set(prev).add(game.id));

    const wasFav = favoritesSet.has(game.id);

    // optimistic UI
    setFavoritesSet((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(game.id);
      else next.add(game.id);
      return next;
    });

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
          game_image: game.background_image ?? null,
        });

        if (error) throw error;
      }
    } catch (e: any) {
      // rollback
      setFavoritesSet((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(game.id);
        else next.delete(game.id);
        return next;
      });
      setFavMsg(e?.message ?? "Failed to update favorites");
    } finally {
      setFavBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(game.id);
        return next;
      });
    }
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen px-6 py-10 text-white bg-zinc-950 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold">Browse Games</h1>
            <Link
              href="/favorites"
              className="text-sm text-white/70 hover:text-white transition underline-offset-4 hover:underline"
            >
              View Favorites →
            </Link>
          </div>

          {favMsg && (
            <div className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {favMsg}
            </div>
          )}

          {/* FILTERS */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
            {/* LEFT FILTER PANEL */}
            <GameFilters
              sort={sort}
              genre={genre}
              year={year}
              genresList={genresList}
              updateParam={updateParam}
            />

            {/* RIGHT GAME GRID */}
            <div>
              {loading ? (
                <p className="text-zinc-400">Loading games...</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                  >
                    {games.map((game) => (
                      <motion.div
                        key={game.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                      >
                        <GameCard
                          game={game}
                          isFavorited={favoritesSet.has(game.id)}
                          favLoading={favBusyIds.has(game.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
