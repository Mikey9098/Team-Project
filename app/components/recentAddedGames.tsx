"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
};

const RecentAddedGames: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const res = await fetch(
          "https://api.rawg.io/api/games?key=14af43f3b477423b9ddd26df233927db&dates=2025-01-01,2026-01-01&ordering=-released&page_size=20"
        );
        const data: { results: Game[] } = await res.json();

        setGames(data.results.filter((g) => g.background_image));
      } catch (error) {
        console.error("Failed to fetch recent games", error);
      }
    };

    fetchRecentGames();
  }, []);

  return (
    <div className="relative w-full bg-black p-14 overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-white text-3xl font-bold tracking-tight">
          Recently Added
        </h1>

        <Link
          href="/recently-added"
          className="flex items-center gap-2 text-white text-lg font-bold transition-colors duration-300 hover:text-purple-400"
        >
          All Games
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="relative w-full z-10"
      >
        <CarouselContent className="-ml-4">
          {games.map((game) => (
            <CarouselItem
              key={game.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <Link href={`/games/${game.id}`}>
                <div className="group relative rounded-lg overflow-hidden border border-white/10 bg-zinc-900/50 transition-all duration-500 hover:border-white/40">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <div className="relative p-5">
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                      {game.name}
                    </h2>
                    <p className="text-xs text-white/50 mt-1">
                      Released: {game.released || "TBA"}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons */}
        <div className="hidden md:block">
          <CarouselPrevious className="bg-black/50 border-white/10 text-white hover:bg-white hover:text-black" />
          <CarouselNext className="bg-black/50 border-white/10 text-white hover:bg-white hover:text-black" />
        </div>
      </Carousel>
    </div>
  );
};

export default RecentAddedGames;
