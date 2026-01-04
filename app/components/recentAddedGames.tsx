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
    <div className="w-full bg-black p-14">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold mb-8">Recently Added</h1>

        <Link
          href="/recently-added"
          className="
      text-white text-2xl font-bold mb-8
      flex items-center gap-2
      transition-all duration-500
      hover:text-white/80
      group
    "
        >
          All Games
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {games.map((game) => (
            <CarouselItem
              key={game.id}
              className="
                basis-1/1
                sm:basis-1/2
                md:basis-1/3
                lg:basis-1/4
              "
            >
              <Link href={`/games/${game.id}`}>
                <div
                  className="
                  group
                  rounded-xs overflow-hidden
                  border border-white/10
                  text-white
                  transition-all duration-300
                  hover:border-white
                "
                >
                  <div className="relative h-45 overflow-hidden border-b border-white/10 group-hover:border-white">
                    <Image
                      src={game.background_image}
                      alt={game.name}
                      fill
                      className="
                      object-cover
                      transition-transform duration-500
                      group-hover:scale-110
                    "
                    />
                  </div>

                  <div className="bg-black px-4 py-3">
                    <h2 className="font-semibold text-lg truncate">
                      {game.name}
                    </h2>
                    <p className="text-sm text-white/60">
                      Released: {game.released || "TBA"}
                    </p>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RecentAddedGames;
