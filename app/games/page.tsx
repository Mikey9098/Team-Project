"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
export const GameCard = ({ game }: { game: Game }) => {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative block w-full bg-[#111217] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-2xl">
        <Image
          fill
          src={game.background_image || "/placeholder.jpg"}
          alt={game.name}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
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

// --- COMPONENT: RELATED GAMES ---
export const RelatedGames = ({ games }: { games: Game[] }) => {
  return (
    <section className="py-12 px-4 bg-black/80">
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Related Titles
        </h2>
        <div className="h-1 flex-1 mx-4 bg-purple-900 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function GamesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL PARAMS
  const sort = searchParams.get("sort") || "newest";
  const genre = searchParams.get("genre") || "all";
  const year = searchParams.get("year") || "all";

  const [games, setGames] = useState<Game[]>([]);
  const [genresList, setGenresList] = useState<Genre[]>([]); // State for genres
  const [loading, setLoading] = useState(false);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/games?${params.toString()}`);
  };

  // 1. Fetch the list of Genres on mount
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

  // 2. Fetch Games when filters change
  const fetchGames = async () => {
    setLoading(true);

    let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=40`;

    // SORT
    if (sort === "newest") url += `&ordering=-released`;
    if (sort === "oldest") url += `&ordering=released`;
    if (sort === "popular") url += `&ordering=-rating`;

    // GENRE
    if (genre !== "all") url += `&genres=${genre}`;

    // YEAR
    if (year !== "all") {
      url += `&dates=${year}-01-01,${year}-12-31`;
    }

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
  }, [sort, genre, year]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen px-6 py-10 text-white bg-zinc-950 pt-20 ">
        <h1 className="text-3xl font-bold mb-8">Browse Games</h1>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-10">
          <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* DYNAMIC GENRE SELECT */}
          <Select value={genre} onValueChange={(v) => updateParam("genre", v)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]" position="popper">
              <SelectItem value="all">All Genres</SelectItem>
              {genresList.map((g) => (
                <SelectItem key={g.id} value={g.slug}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={(v) => updateParam("year", v)}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Release Year" />
            </SelectTrigger>
            <SelectContent className="bg-red-500">
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                  {/* USING THE REUSABLE COMPONENT */}
                  <GameCard game={game} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Suspense>
  );
}
