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
import { ArrowRight } from "lucide-react";

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
    <div className="w-full h-100 bg-black  p-14">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold mb-8">Genres</h1>

        <Link
          href="/genres"
          className="
      text-white text-2xl font-bold mb-8
      flex items-center gap-2
      transition-all duration-500
      hover:text-white/80
      group
    "
        >
          All Genres
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <CarouselContent>
          {genres.map((genre) => (
            <CarouselItem
              key={genre.id}
              className="
                basis-1/1
                sm:basis-1/2
                md:basis-1/3
                lg:basis-1/4
              "
            >
              <Link href={`/genre/${genre.slug}`}>
                <div
                  className="
    group
    rounded-xs overflow-hidden
    border border-white/10
    text-white`
    transition-all duration-500
    hover:border-white
      "
                >
                  <div className="relative h-45">
                    <Image
                      src={genre.image_background}
                      alt={genre.name}
                      fill
                      className="group-hover:border-white group-hover:scale-110 object-cover  transition-all duration-500 border-border border-b"
                    />
                  </div>

                  <div className="bg-black px-5 py-4">
                    <h2 className="text-xl font-semibold text-white">
                      {genre.name}
                    </h2>
                    <p className="text-sm text-white/60 uppercase">
                      {genre.games_count} games
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

export default Menu;
