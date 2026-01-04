import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Game = {
  id: number;
  name: string;
  description_raw: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  metacritic: number | null;
  genres: { id: number; name: string }[];
  platforms: { platform: { id: number; name: string } }[];
  publishers: { name: string }[];
};

export const revalidate = 3600;

async function getGame(id: string): Promise<Game | null> {
  try {
    const res = await fetch(
      `https://api.rawg.io/api/games/${id}?key=14af43f3b477423b9ddd26df233927db`
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch game:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) {
    return { title: "Game Not Found" };
  }

  return {
    title: `${game.name} - GameHub`,
    description: game.description_raw.slice(0, 160) + "...",
    openGraph: {
      images: game.background_image ? [game.background_image] : [],
    },
  };
}

const getMetacriticColor = (score: number) => {
  if (score >= 75) return "border-green-500 text-green-500";
  if (score >= 50) return "border-yellow-500 text-yellow-500";
  return "border-red-500 text-red-500";
};

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) return notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="relative h-[80vh] w-full">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700">
            No Image Available
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="absolute bottom-0 w-full z-10">
          <div className="max-w-6xl mx-auto px-6 pb-12">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {game.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-white/10 backdrop-blur-md rounded-full text-white/90 border border-white/10"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              {game.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase">
                  Released
                </span>
                <span className="text-zinc-200">{game.released || "TBA"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-zinc-500 text-xs uppercase">Rating</span>
                <span className="text-zinc-200 flex items-center gap-1">
                  ⭐ {game.rating} <span className="text-zinc-600">/ 5</span>
                </span>
              </div>

              {game.metacritic && (
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-xs uppercase">
                    Metascore
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${getMetacriticColor(
                      game.metacritic
                    )} bg-black/50 backdrop-blur-sm w-fit`}
                  >
                    {game.metacritic}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed whitespace-pre-line">
              {game.description_raw}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
            <h3 className="text-zinc-500 text-sm font-bold uppercase mb-4 tracking-wider">
              Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.platforms?.map((p) => (
                <span
                  key={p.platform.id}
                  className="text-sm text-zinc-300 border-b border-zinc-700 pb-0.5"
                >
                  {p.platform.name}
                </span>
              ))}
            </div>
          </div>

          {game.publishers && game.publishers.length > 0 && (
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
              <h3 className="text-zinc-500 text-sm font-bold uppercase mb-4 tracking-wider">
                Publishers
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.publishers.map((pub) => (
                  <span key={pub.name} className="text-zinc-200">
                    {pub.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
