import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Trophy, Sparkles } from "lucide-react";
import { RelatedGames } from "./(components)/RelatedGames";

export type Game = {
  genres: any;
  id: number;
  name: string;
  background_image: string | null;
  released: string;
  metacritic?: number;
  rating: number;
};

type Genre = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_background?: string;
  games_count: number;
};

export const revalidate = 3600;
const API_KEY = "14af43f3b477423b9ddd26df233927db";

async function getGamesByGenre(slug: string): Promise<Game[]> {
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("genres", slug);
  url.searchParams.set("page_size", "20");
  url.searchParams.set("ordering", "-metacritic");

  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

async function getGenre(slug: string): Promise<Genre | null> {
  const res = await fetch(
    `https://api.rawg.io/api/genres/${slug}?key=${API_KEY}`,
    { next: { revalidate } }
  );
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) return { title: "Not Found" };

  return {
    title: `Best ${genre.name} Games`,
    description: `Top rated ${genre.name} games including ${genre.games_count} titles.`,
  };
}

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) return notFound();

  const games = await getGamesByGenre(slug);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Offset for your fixed header (change 72px if your header height differs) */}
      <div className="pt-18" />

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[46vh] min-h-120 w-full overflow-hidden">
          {genre.image_background ? (
            <>
              {/* base image */}
              <Image
                src={genre.image_background}
                alt={genre.name}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-60 scale-105"
              />
              {/* depth layer */}
              <div className="absolute inset-0">
                <Image
                  src={genre.image_background}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover blur-2xl scale-110 opacity-20"
                />
              </div>
            </>
          ) : (
            <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-500">
              No Image Available
            </div>
          )}

          {/* overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.10),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_45%)]" />

          {/* bottom content */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-7xl px-4 md:px-6 pb-10 md:pb-12">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                  <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                  {genre.games_count.toLocaleString()} titles
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Top Metacritic picks
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.03] drop-shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
                {genre.name}
              </h1>

              {genre.description ? (
                <div className="mt-5 max-w-3xl">
                  <div className="rounded-3xl border border-white/10 bg-black/35 p-4 md:p-5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <div
                      className="text-sm md:text-base leading-relaxed text-zinc-200/90 line-clamp-3 md:line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: genre.description }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm md:text-base text-zinc-300/80 max-w-2xl">
                  Explore the best games in {genre.name}, ranked by Metacritic.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION HEADER */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Top Rated{" "}
              <span className="text-zinc-400 font-normal">in {genre.name}</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Sorted by Metacritic (page size: 20)
            </p>
          </div>
        </div>

        <div className="mt-6 h-px bg-white/10" />
      </main>

      {/* LIST */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 pb-20">
        <RelatedGames games={games} />
      </div>
    </div>
  );
}
