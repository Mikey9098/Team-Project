"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";

type Genre = {
  id: number;
  name: string;
  slug: string;
  image_background: string;
  games_count: number;
};

const Menu: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      const res = await fetch(
        "https://api.rawg.io/api/genres?key=14af43f3b477423b9ddd26df233927db"
      );
      const data: { results: Genre[] } = await res.json();
      setGenres(data.results);
    };

    fetchGenres();
  }, []);

  return (
    <div className="relative w-full min-h-125 bg-black p-14 pt-20 overflow-hidden">
      <div className="relative z-10 flex justify-between items-center">
        <h1 className="text-white text-3xl font-bold mb-10 tracking-tight">
          Genres
        </h1>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        className="relative z-10 w-full"
      >
        <CarouselContent className="-ml-4">
          {genres.map((genre) => (
            <CarouselItem
              key={genre.id}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <Link href={`/genre/${genre.slug}`}>
                <div className="group relative rounded-lg overflow-hidden border border-white/10 bg-zinc-900/50 transition-all duration-500 hover:border-white/40">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={genre.image_background}
                      alt={genre.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <div className="relative p-5">
                    <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {genre.name}
                    </h2>
                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
                      {genre.games_count.toLocaleString()} games
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

export default Menu;
