import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, Star, Trophy } from "lucide-react"; // Icons
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

const getMetacriticColor = (score: number) => {
  if (score >= 75) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 50)
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
};

async function getGamesByGenre(slug: string): Promise<Game[]> {
  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("key", API_KEY!);
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

  if (!genre) notFound();

  const games = await getGamesByGenre(slug);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative h-[40vh] w-full overflow-hidden">
        {genre.image_background && (
          <Image
            src={genre.image_background}
            alt={genre.name}
            width={1920}
            height={1080}
            className="object-cover opacity-40 scale-105"
            priority
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white mb-4">
              <Trophy className="w-3 h-3 text-yellow-400" />
              {genre.games_count.toLocaleString()} Titles Available
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-xl">
              {genre.name}
            </h1>
            {genre.description && (
              <div
                className="max-w-2xl text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3"
                dangerouslySetInnerHTML={{ __html: genre.description }}
              />
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 ">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            Top Rated
            <span className="text-zinc-500 text-lg font-normal">
              in {genre.name}
            </span>
          </h2>
        </div>
      </main>
      <RelatedGames games={games} />
    </div>
  );
}
