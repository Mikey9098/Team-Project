"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";

type Game = {
  released: ReactNode;
  id: number;
  name: string;
  background_image: string | null;
};

export default function GameCarousel() {
  const [games, setGames] = useState<Game[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch(
          "https://api.rawg.io/api/games?key=14af43f3b477423b9ddd26df233927db&dates=2023-01-01,2025-12-31&ordering=-ratings_count"
        );
        const data = await res.json();
        setGames(data.results);
      } catch (err) {
        console.log("Failed to fetch games:", err);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    if (!games.length) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % games.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [games]);

  if (!games.length)
    return <p className="text-white text-center mt-10">Loading...</p>;

  const game = games[index];
  return (
    <div className="relative h-170 w-full overflow-hidden bg-black  border-border border-b-2">
      <motion.div
        key={game.id}
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 5, ease: "easeInOut" }}
      >
        <Image
          src={game.background_image || "/placeholder.png"}
          alt={game.name}
          fill
          className="object-cover"
          style={{ borderRadius: 0, backgroundColor: "#000" }}
          priority
        />
      </motion.div>

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-white text-5xl md:text-6xl font-bold">
          {game.name}
        </h1>
        <h1 className="text-white text-xl md:text-xl font-bold">
          {game.released}
        </h1>
        <Link
          href={`/games/${game.id}`}
          className="mt-6 px-8 py-3 bg-black text-white hover:bg-zinc-900 font-semibold transition text-lg border border-stone-800 rounded-sm"
        >
          View Game Details
        </Link>
      </div>
    </div>
  );
}
