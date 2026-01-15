"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  X,
  Loader2,
  Calendar,
} from "lucide-react";

import GameFilters from "../components/Gamefilters";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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

/* ----------------------------- UI HELPERS ----------------------------- */

function yearOf(date?: string) {
  if (!date) return "TBA";
  const y = date.split("-")[0];
  return y || "TBA";
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75 backdrop-blur">
      {children}
    </span>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden border border-white/10 bg-white/5"
        >
          <div className="relative h-[220px] sm:h-[260px]">
            <Skeleton className="h-full w-full bg-zinc-800" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          </div>

          <div className="p-7 space-y-4">
            <Skeleton className="h-6 w-4/5 bg-zinc-800" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
              <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- GAME CARD ----------------------------- */

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
  const releaseLabel = game.released ? yearOf(game.released) : "TBA";
  const ratingLabel =
    typeof game.rating === "number" ? game.rating.toFixed(1) : "N/A";

  return (
    <Link
      href={`/games/${game.id}`}
      className="
        group relative block w-full
        rounded-3xl overflow-hidden
        border border-white/10 bg-black/35
        transition-all duration-300
        hover:-translate-y-2 hover:scale-[1.01]
        hover:border-primary/50
        hover:shadow-[0_30px_90px_rgba(0,0,0,0.65)]
      "
    >
      {/* IMAGE */}
      <div className="relative h-[220px] sm:h-[260px] lg:h-[280px] w-full overflow-hidden">
        <Image
          fill
          src={game.background_image || "/placeholder.jpg"}
          alt={game.name}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {/* TOP BAR (always aligned) */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 sm:px-4 text-xs font-semibold text-white/85 backdrop-blur">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/70 shrink-0" />
              <span className="truncate">{releaseLabel}</span>
            </span>

            <span className="hidden md:inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 text-xs font-semibold text-white/85 backdrop-blur">
              <Star className="h-4 w-4 text-yellow-300" />
              {ratingLabel}
            </span>
          </div>

          {/* FAVORITE */}
          <button
            type="button"
            aria-label={isFavorited ? "Remove favorite" : "Add favorite"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(game);
            }}
            disabled={favLoading}
            className={`
              h-9 w-9 sm:h-10 sm:w-10 rounded-full grid place-items-center
              border border-white/10 bg-black/60 backdrop-blur
              transition hover:scale-105 active:scale-95
              ${isFavorited ? "text-primary" : "text-white"}
              ${favLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {favLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Heart
                className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
              />
            )}
          </button>
        </div>
      </div>

      {/* CONTENT (fixed height -> bottoms even) */}
      <div className="p-5 sm:p-6 lg:p-7 flex flex-col min-h-[140px] sm:h-40 mb-6 sm:mb-10">
        {/* TITLE — fixed height, never overlaps */}
        <h3
          className="
      text-base sm:text-lg md:text-xl font-extrabold text-white/95
      group-hover:text-primary transition
      leading-snug
      line-clamp-2
      min-h-[2.6rem] sm:min-h-[3.2rem]   /* 👈 reserves space for 2 lines */
    "
        >
          {game.name}
        </h3>

        {/* GENRES — always below title */}
        <div className="mt-3 flex flex-wrap gap-2 min-h-[28px]">
          {game.genres?.slice(0, 2).map((g) => (
            <Chip key={g.id}>{g.name}</Chip>
          ))}
        </div>

        {/* FOOTER — pinned */}
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between">
          <span className="text-sm text-white/55">
            Released:{" "}
            <span className="text-white/80">{game.released || "TBA"}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold text-white/85">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" />
            {ratingLabel}
          </span>
        </div>
      </div>
    </Link>
  );
};

/* ----------------------------- PAGE ----------------------------- */

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

  const clearFilters = () => router.push("/games");

  // auth
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setFavoritesSet(new Set());
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/genres?key=${API_KEY}`
        );
        const data = await res.json();
        setGenresList(data.results || []);
      } catch (err) {
        console.error("Failed to fetch genres list", err);
      }
    };
    fetchGenres();
  }, []);

  // games
  const fetchGames = async () => {
    setLoading(true);

    let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=36`;

    if (sort === "newest") url += `&ordering=-released`;
    if (sort === "oldest") url += `&ordering=released`;
    if (sort === "popular") url += `&ordering=-rating`;

    if (genre !== "all") url += `&genres=${genre}`;
    if (year !== "all") url += `&dates=${year}-01-01,${year}-12-31`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setGames((data.results || []).filter((g: Game) => g.background_image));
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

  // favorites load (1 query)
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

      if (error) return console.error(error);
      setFavoritesSet(new Set((data ?? []).map((r) => r.game_id)));
    };

    loadFavoritesForPage();
  }, [games, userId, supabase]);

  // toggle favorite
  const toggleFavorite = async (game: Game) => {
    setFavMsg(null);
    if (!userId) return setFavMsg("Please log in to save favorites.");

    setFavBusyIds((prev) => new Set(prev).add(game.id));
    const wasFav = favoritesSet.has(game.id);

    // optimistic
    setFavoritesSet((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(game.id) : next.add(game.id);
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
        wasFav ? next.add(game.id) : next.delete(game.id);
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

  const activeFilters =
    (sort && sort !== "newest") || genre !== "all" || year !== "all";

  return (
    <Suspense fallback={<p className="text-white p-6">Loading…</p>}>
      <div className="min-h-screen text-white bg-black">
        <div className="pt-[72px]" />

        {/* ✅ wider container -> bigger cards */}
        <div className="mx-auto max-w-screen-2xl px-4 md:px-10 py-8 md:py-10">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5 md:mb-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Browse the catalog
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Browse Games
              </h1>
              <p className="mt-2 text-sm text-white/55 max-w-2xl">
                Filter by genre, year, and sorting — then save your favorites.
              </p>
            </div>

            <Link
              href="/favorites"
              className="inline-flex w-full sm:w-fit items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            >
              View Favorites
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {favMsg && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {favMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-10">
            <GameFilters
              sort={sort}
              genre={genre}
              year={year}
              genresList={genresList}
              updateParam={updateParam}
            />

            <div className="space-y-4">
              {/* toolbar */}
              <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/70">
                    <span className="font-semibold text-white/90">
                      {loading ? "Loading…" : `${games.length} games`}
                    </span>
                    {genre !== "all" && <Chip>Genre: {genre}</Chip>}
                    {year !== "all" && <Chip>Year: {year}</Chip>}
                    {sort !== "newest" && <Chip>Sort: {sort}</Chip>}
                  </div>

                  {activeFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition w-full sm:w-fit"
                    >
                      <X className="h-4 w-4" />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* ✅ bigger cards: 3 cols on desktop */}
              {loading ? (
                <LoadingGrid />
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
                  >
                    {games.map((game) => (
                      <motion.div
                        key={game.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ duration: 0.22 }}
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
