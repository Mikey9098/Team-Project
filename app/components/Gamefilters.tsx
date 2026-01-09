"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Genre } from "@/app/games/page"; // adjust path if needed

type Props = {
  sort: string;
  genre: string;
  year: string;
  genresList: Genre[];
  updateParam: (key: string, value: string) => void;
};

export default function GameFilters({
  sort,
  genre,
  year,
  genresList,
  updateParam,
}: Props) {
  const [open, setOpen] = useState<string | null>("sort");

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isOpen = open === id;

    return (
      <div className="border-b border-white/10 overflow-hidden">
        <button
          onClick={() => setOpen(isOpen ? null : id)}
          className="w-full flex justify-between items-center px-4 py-4 text-sm font-semibold tracking-wide text-white"
        >
          {title}

          {/* Animated arrow */}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-zinc-400"
          >
            ⌄
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="px-4 pb-4 space-y-2"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <aside className="w-72 bg-black border border-white/10 rounded-md overflow-hidden">
      {/* SORT */}
      <Section id="sort" title="SORT BY">
        {[
          { label: "Newest", value: "newest" },
          { label: "Oldest", value: "oldest" },
          { label: "Most Popular", value: "popular" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("sort", opt.value)}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm transition
              ${
                sort === opt.value
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </Section>

      {/* GENRES */}
      <Section id="genres" title="GENRES">
        <button
          onClick={() => updateParam("genre", "all")}
          className={`w-full text-left px-3 py-2 rounded-sm text-sm transition
            ${
              genre === "all"
                ? "bg-purple-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
        >
          All Genres
        </button>

        {genresList.map((g) => (
          <button
            key={g.id}
            onClick={() => updateParam("genre", g.slug)}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm transition
              ${
                genre === g.slug
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            {g.name}
          </button>
        ))}
      </Section>

      {/* PLATFORMS */}
      <Section id="platforms" title="PLATFORMS">
        {["PC", "PlayStation", "Xbox"].map((p) => (
          <button
            key={p}
            className="w-full text-left px-3 py-2 rounded-sm text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            {p}
          </button>
        ))}
      </Section>

      {/* YEAR */}
      <Section id="year" title="RELEASE YEAR">
        {["all", "2026", "2025", "2024", "2023", "2022"].map((y) => (
          <button
            key={y}
            onClick={() => updateParam("year", y)}
            className={`w-full text-left px-3 py-2 rounded-sm text-sm transition
              ${
                year === y
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
          >
            {y === "all" ? "All Years" : y}
          </button>
        ))}
      </Section>
    </aside>
  );
}
