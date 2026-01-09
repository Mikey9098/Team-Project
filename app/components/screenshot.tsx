"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

type Game = {
  id: number;
  name: string;
  background_image: string | null;
  released: string;
};

export default function GameHero() {
  const [game, setGame] = useState<Game | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const RAWG_KEY = "14af43f3b477423b9ddd26df233927db";
  const YOUTUBE_API_KEY = "AIzaSyCEKWmb2Xs0-Ajk5oqo6P9WMj2tLYLlAns"; // 👈 put your key here
  const gameId = "51432";
  // 1️⃣ Fetch ONE game
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games/${gameId}?key=${RAWG_KEY}`
        );
        const data = await res.json();
        setGame(data);
      } catch (err) {
        console.log("Failed to fetch game:", err);
      }
    };

    fetchGame();
  }, []);

  // 2️⃣ Fetch YouTube trailer for that game
  useEffect(() => {
    if (!game) return;

    const fetchYoutubeTrailer = async () => {
      try {
        const query = `${game.name} official game trailer`;
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
            query
          )}&key=${YOUTUBE_API_KEY}`
        );
        const data = await res.json();

        const id = data.items?.[0]?.id?.videoId || null;
        setVideoId(id);
      } catch (err) {
        console.log("Failed to fetch YouTube trailer:", err);
        setVideoId(null);
      }
    };

    fetchYoutubeTrailer();
  }, [game]);

  if (!game) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="relative h-170 w-full overflow-hidden bg-black border-border border-b-2">
      {videoId ? (
        <motion.iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          allow="autoplay; fullscreen encrypted-media"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 5, ease: "easeInOut" }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${game.background_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-white text-5xl md:text-6xl font-bold ">
          {game.name}
        </h1>
        <p className="text-white text-xl mt-2">{game.released}</p>
        <Link
          href={`/games/${game.id}`}
          className="mt-6 px-8 py-3 bg-black text-white transition-all duration-300 hover:text-primary hover:border-white/40 font-semibold  text-lg border border-white/10 rounded-sm"
        >
          View Game Details
        </Link>
      </div>
    </div>
  );
}
