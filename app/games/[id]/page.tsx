import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FavoriteGameButton from "@/app/components/FavoriteGameButton";
import { Calendar, Star, Trophy, Layers3, Building2 } from "lucide-react";

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

  if (!game) return { title: "Game Not Found" };

  return {
    title: `${game.name} - GameHub`,
    description: (game.description_raw || "").slice(0, 160) + "...",
    openGraph: { images: game.background_image ? [game.background_image] : [] },
  };
}

const getMetacriticTone = (score: number) => {
  if (score >= 75) return "border-green-500/30 text-green-300 bg-green-500/10";
  if (score >= 50)
    return "border-yellow-500/30 text-yellow-300 bg-yellow-500/10";
  return "border-red-500/30 text-red-300 bg-red-500/10";
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
      {children}
    </span>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/35">
        {icon}
      </div>
      <div className="leading-tight min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-white/45">
          {label}
        </p>
        <p className="text-sm font-semibold text-white/90 truncate">{value}</p>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5">
          {icon}
        </div>
        <p className="text-sm font-semibold text-white/90">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) return notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* If you have a fixed header, this prevents content going under it */}
      <div className="pt-[72px]" />

      {/* HERO */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
          {/* background image */}
          {game.background_image ? (
            <>
              <Image
                src={game.background_image}
                alt={game.name}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              {/* blurred layer for depth */}
              <div className="absolute inset-0">
                <Image
                  src={game.background_image}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110 opacity-25"
                  sizes="100vw"
                />
              </div>
            </>
          ) : (
            <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-zinc-700">
              No Image Available
            </div>
          )}

          {/* overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/5" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.12),transparent_45%)]" />

          {/* content */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-6xl px-4 md:px-6 pb-10 md:pb-12">
              <div className="flex flex-wrap gap-2 mb-5">
                {game.genres?.slice(0, 10).map((g) => (
                  <Chip key={g.id}>{g.name}</Chip>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
                {game.name}
              </h1>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <InfoPill
                    icon={<Calendar className="h-5 w-5 text-white/80" />}
                    label="Released"
                    value={game.released || "TBA"}
                  />

                  <InfoPill
                    icon={<Star className="h-5 w-5 text-yellow-300" />}
                    label="Rating"
                    value={
                      <span className="flex items-center gap-2">
                        <span className="text-white/90">{game.rating}</span>
                        <span className="text-white/40">/ 5</span>
                      </span>
                    }
                  />

                  {game.metacritic != null && (
                    <div
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md ${getMetacriticTone(
                        game.metacritic
                      )}`}
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/35">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] uppercase tracking-wider opacity-80">
                          Metascore
                        </p>
                        <p className="text-sm font-semibold">
                          {game.metacritic}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="ml-0 md:ml-auto">
                    <FavoriteGameButton
                      game={{
                        id: game.id,
                        name: game.name,
                        background_image: game.background_image,
                      }}
                    />
                  </div>
                </div>

                <p className="text-sm md:text-base text-white/60 max-w-3xl">
                  {(game.description_raw || "").slice(0, 220)}
                  {(game.description_raw || "").length > 220 ? "…" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20 ">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 md:gap-10 -mt-10">
          {/* Left column */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-black/35 p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                About
              </h2>
              <div className="mt-4 prose prose-invert prose-zinc prose-sm sm:prose-base max-w-none text-zinc-300 leading-relaxed whitespace-pre-line line-clamp-6 sm:line-clamp-none">
                {game.description_raw || "No description available."}
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="space-y-6 sticky top-0">
            <Card title="Platforms" icon={<Layers3 className="h-4 w-4 text-white/80" />}>
              <div className="flex flex-wrap gap-2">
                {game.platforms?.length ? (
                  game.platforms.map((p) => (
                    <span
                      key={p.platform.id}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10 transition"
                    >
                      {p.platform.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-white/55">No platforms listed.</p>
                )}
              </div>
            </Card>

            {game.publishers?.length ? (
              <Card title="Publishers" icon={<Building2 className="h-4 w-4 text-white/80" />}>
                <div className="flex flex-wrap gap-2">
                  {game.publishers.map((pub) => (
                    <span
                      key={pub.name}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                    >
                      {pub.name}
                    </span>
                  ))}
                </div>
              </Card>
            ) : null}

            {/* Extra nice: small tip / CTA */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-black/30 p-5 md:p-6">
              <p className="text-sm font-semibold text-white/90">Tip</p>
              <p className="mt-1 text-sm text-white/60">
                Add this game to favorites to access it instantly from your profile.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
