import Image from "next/image";
import type { Game } from "../page";
import Link from "next/link";
import {
  Key,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";

const GameCard = ({ game }: { game: Game }) => {
  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative block w-full bg-[#111217] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 "
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
            {game.genres
              ?.slice(0, 2)
              .map(
                (genre: {
                  id: Key | null | undefined;
                  name:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                }) => (
                  <span
                    key={genre.id}
                    className="px-2 py-0.5 text-xs font-semibold text-purple-200 bg-purple-900/40 rounded-full uppercase"
                  >
                    {genre.name}
                  </span>
                )
              )}
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
