"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Sparkles, ArrowRight } from "lucide-react";

type Genre = {
  id: number;
  name: string;
  slug: string;
  image_background: string;
  games_count: number;
};

const API_KEY = "14af43f3b477423b9ddd26df233927db";

function GenreSkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
      <div className="h-44 bg-white/8 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-2/3 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

function GenreCard({ genre }: { genre: Genre }) {
  return (
    <Link href={`/genre/${genre.slug}`} className="block">
      <div
        className="
          group relative overflow-hidden rounded-3xl border border-white/10 bg-black/35
          transition-all duration-300
          hover:-translate-y-1 hover:border-primary/40
          hover:shadow-[0_22px_70px_rgba(0,0,0,0.45)]
        "
      >
        <div className="relative h-44 overflow-hidden">
          <Image
            src={genre.image_background}
            alt={genre.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Genre
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              {genre.games_count.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="relative p-5">
          <h3 className="text-lg font-bold text-white/90 group-hover:text-primary transition-colors line-clamp-1">
            {genre.name}
          </h3>
          <p className="mt-2 text-xs text-white/55 uppercase tracking-widest">
            games available
          </p>

          <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

export default function GenrePage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const skeletonItems = useMemo(() => Array.from({ length: 9 }), []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/genres?key=${API_KEY}`
        );
        const data = await res.json();
        setGenres(data.results || []);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const filteredGenres = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return genres;
    return genres.filter((g) => g.name.toLowerCase().includes(q));
  }, [genres, query]);

  return (
    <div className="min-h-screen text-white bg-black">
      <div className="pt-[72px]" />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Explore categories
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">
                All Genres
              </h1>
              <p className="mt-2 text-sm text-white/55 max-w-2xl">
                Dive into curated game categories and jump straight to the best
                titles in each genre.
              </p>
            </div>

            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition w-fit"
            >
              Browse games
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search genres"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-primary/50"
              />
            </div>
            <div className="text-sm text-white/60">
              {loading ? "Loading genres..." : `${filteredGenres.length} genres`}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {skeletonItems.map((_, i) => (
                <GenreSkeletonCard key={i} />
              ))}
            </div>
          ) : filteredGenres.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGenres.map((genre) => (
                <GenreCard key={genre.id} genre={genre} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white/70">
              No genres match that search. Try a different keyword.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
