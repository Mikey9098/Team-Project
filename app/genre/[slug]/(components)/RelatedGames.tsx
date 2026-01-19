import Image from "next/image";
import Link from "next/link";
import { Star, Sparkles, ArrowRight } from "lucide-react";
import type { Game } from "../page";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75 backdrop-blur">
      {children}
    </span>
  );
}

function RatingPill({ rating }: { rating?: number }) {
  const value = typeof rating === "number" ? rating.toFixed(1) : "N/A";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-xs font-semibold text-white/80 backdrop-blur">
      <Star className="h-3.5 w-3.5 text-yellow-300" />
      {value}
    </span>
  );
}

const GameCard = ({ game }: { game: Game }) => {
  const year = game.released ? game.released.split("-")[0] : null;

  return (
    <Link
      href={`/games/${game.id}`}
      className="
        group relative block w-full overflow-hidden rounded-3xl
        border border-white/10 bg-black/35
        transition-all duration-300
        hover:-translate-y-1 hover:border-primary/40
        hover:shadow-[0_22px_70px_rgba(0,0,0,0.45)]
      "
    >
      {/* image */}
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          fill
          src={game.background_image || "/placeholder.jpg"}
          alt={game.name}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 25vw"
        />

        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />

        {/* top row pills */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <RatingPill rating={game.rating} />
          {year ? (
            <span className="rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-xs font-semibold text-white/75 backdrop-blur">
              {year}
            </span>
          ) : null}
        </div>
      </div>

      {/* content */}
      <div className="p-5">
        <h3 className="text-base font-bold text-white/90 group-hover:text-primary transition-colors line-clamp-1">
          {game.name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {game.genres?.slice(0, 2).map((g: any) => (
            <Chip key={g.id}>{g.name}</Chip>
          ))}
          {!game.genres?.length ? (
            <span className="text-xs text-white/45">No genres</span>
          ) : null}
        </div>

        {/* subtle glow */}
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
};

export const RelatedGames = ({ games }: { games: Game[] }) => {
  return (
    <section className="relative bg-black overflow-hidden">
      {/* background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-6 py-12">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              More like this
            </div>
            <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-white">
              Related Titles
            </h2>
            <p className="mt-2 text-sm text-white/55 max-w-xl">
              Similar games you might enjoy — based on genre and popularity.
            </p>
          </div>

          {/* Optional link (remove if you don’t have /games page) */}
          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition w-fit"
          >
            View more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </section>
  );
};
