"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Play, ArrowRight, Sparkles } from "lucide-react";

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
  const YOUTUBE_API_KEY = "AIzaSyCEKWmb2Xs0-Ajk5oqo6P9WMj2tLYLlAns";
  const gameId = "51432";

  // 1) Fetch ONE game
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

  // 2) Fetch YouTube trailer for that game
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

  const releasedLabel = useMemo(() => {
    if (!game?.released) return "TBA";
    return game.released;
  }, [game?.released]);

  if (!game)
    return (
      <div className="min-h-[520px] w-full bg-black grid place-items-center border-b border-white/10">
        <div className="text-white/70">Loading…</div>
      </div>
    );

  return (
    <section className="relative w-full overflow-hidden bg-black border-b border-white/10">
      {/* Hero height that behaves across screens */}
      <div className="relative h-[72vh] min-h-[560px] max-h-[820px]">
        {/* Background (video or fallback image) */}
        {videoId ? (
          <motion.iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`}
            className="absolute inset-0 h-full w-full pointer-events-none"
            allow="autoplay; encrypted-media"
            initial={{ scale: 1.02 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 8, ease: "easeInOut" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${game.background_image ?? ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.16),transparent_50%)]" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 md:px-6 pb-10 md:pb-14">
          <div className="w-full">
            {/* Badge row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Featured
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                <Calendar className="h-3.5 w-3.5 text-white/70" />
                {releasedLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
              {game.name}
            </h1>

            {/* Sub */}
            <p className="mt-4 max-w-2xl text-sm md:text-base text-white/65">
              Watch the trailer and jump straight into details, screenshots, and
              more.
            </p>

            {/* Actions */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/games/${game.id}`}
                className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-black hover:bg-primary/90 transition"
              >
                <Play className="h-4 w-4" />
                View Game Details
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition backdrop-blur-md"
              >
                Browse games
              </Link>
            </div>

            {/* Soft glass card edge */}
            <div className="mt-8 h-px w-full bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
