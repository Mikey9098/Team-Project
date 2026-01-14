"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Clock, Grid2X2 } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

/* ----------------------------- TYPES ----------------------------- */

type Genre = {
  id: number;
  name: number | string;
  slug: string;
  image_background: string;
  games_count: number;
};

type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
};

/* ----------------------------- HELPERS ----------------------------- */

function yearOf(date?: string) {
  if (!date) return "TBA";
  const y = date.split("-")[0];
  return y || "TBA";
}

/* ----------------------------- GENRES UI ----------------------------- */

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

function GenreCard({ genre }: { genre: any }) {
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

function GenresSection() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const skeletonItems = useMemo(() => Array.from({ length: 6 }), []);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(
          "https://api.rawg.io/api/genres?key=14af43f3b477423b9ddd26df233927db"
        );
        const data = await res.json();
        setGenres(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-12">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Explore categories
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-white">
              Genres
            </h2>
            <p className="mt-2 text-sm text-white/55 max-w-xl">
              Pick a genre and discover top games inside it.
            </p>
          </div>

          {/* optional */}
          <Link
            href="/genre"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition w-fit"
          >
            <Grid2X2 className="h-4 w-4" />
            View all
          </Link>
        </div>

        {/* carousel */}
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent z-20" />

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {loading
                ? skeletonItems.map((_, i) => (
                    <CarouselItem
                      key={i}
                      className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <GenreSkeletonCard />
                    </CarouselItem>
                  ))
                : genres.map((genre) => (
                    <CarouselItem
                      key={genre.id}
                      className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <GenreCard genre={genre} />
                    </CarouselItem>
                  ))}
            </CarouselContent>

            <div className="hidden md:block">
              <CarouselPrevious className="bg-black/60 border-white/10 text-white hover:bg-white hover:text-black" />
              <CarouselNext className="bg-black/60 border-white/10 text-white hover:bg-white hover:text-black" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- RECENTLY ADDED UI -------------------------- */

function RecentSkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/5">
      <div className="relative h-48">
        <Skeleton className="h-full w-full bg-zinc-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4 bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 bg-zinc-800" />
      </div>
    </div>
  );
}

function RecentGameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="block">
      <div
        className="
          group relative rounded-3xl overflow-hidden
          border border-white/10 bg-black/35
          transition-all duration-300
          hover:-translate-y-1 hover:border-primary/40
          hover:shadow-[0_22px_70px_rgba(0,0,0,0.45)]
        "
      >
        <div className="relative h-48 overflow-hidden">
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <Clock className="w-3.5 h-3.5 text-white/70" />
              {yearOf(game.released)}
            </span>
          </div>
        </div>

        <div className="relative p-5">
          <h3 className="text-lg font-bold text-white/90 group-hover:text-primary transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="mt-2 text-xs text-white/55">
            Released:{" "}
            <span className="text-white/75">{game.released || "TBA"}</span>
          </p>

          <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

function RecentlyAddedSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const skeletonItems = useMemo(() => Array.from({ length: 6 }), []);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          "https://api.rawg.io/api/games?key=14af43f3b477423b9ddd26df233927db&dates=2025-01-01,2026-01-01&ordering=-released&page_size=20"
        );
        const data: { results: Game[] } = await res.json();
        setGames((data.results || []).filter((g) => g.background_image));
      } catch (error) {
        console.error("Failed to fetch recent games", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentGames();
  }, []);

  return (
    <section className="relative w-full bg-transparent overflow-hidden">
      {/* background glows */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-12">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Fresh releases
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight text-white">
              Recently Added
            </h2>
            <p className="mt-2 text-sm text-white/55 max-w-xl">
              Newer games sorted by release date — pick one and dive in.
            </p>
          </div>

          <Link
            href="/games?sort=newest"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition w-fit"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* carousel */}
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-black to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-black to-transparent z-20" />

          <Carousel
            opts={{ align: "start", loop: true }}
            className={`relative w-full ${isLoading ? "min-h-[260px]" : ""}`}
          >
            <CarouselContent className="-ml-4">
              {isLoading
                ? skeletonItems.map((_, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <RecentSkeletonCard />
                    </CarouselItem>
                  ))
                : games.map((game) => (
                    <CarouselItem
                      key={game.id}
                      className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <RecentGameCard game={game} />
                    </CarouselItem>
                  ))}
            </CarouselContent>

            {!isLoading && (
              <div className="hidden md:block">
                <CarouselPrevious className="bg-black/60 border-white/10 text-white hover:bg-white hover:text-black" />
                <CarouselNext className="bg-black/60 border-white/10 text-white hover:bg-white hover:text-black" />
              </div>
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- MAIN EXPORT ----------------------------- */

export default function HomeMenu() {
  return (
    <div className="bg-black">
      <GenresSection />
      <RecentlyAddedSection />
    </div>
  );
}
