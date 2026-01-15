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
            v
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
    <aside className="w-full lg:w-72 bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur">
      {/* SORT */}
      <Section id="sort" title="SORT BY">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: "Newest", value: "newest" },
            { label: "Oldest", value: "oldest" },
            { label: "Popular", value: "popular" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("sort", opt.value)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border
                ${
                  sort === opt.value
                    ? "bg-primary/20 text-white border-primary/40"
                    : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      {/* GENRES */}
      <Section id="genres" title="GENRES">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
          <button
            onClick={() => updateParam("genre", "all")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border
        ${
          genre === "all"
            ? "bg-primary/20 text-white border-primary/40"
            : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
        }`}
          >
            All Genres
          </button>

          {genresList.map((g) => (
            <button
              key={g.id}
              onClick={() => updateParam("genre", g.slug)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border
          ${
            genre === g.slug
              ? "bg-primary/20 text-white border-primary/40"
              : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
          }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </Section>

      {/* YEAR */}
      <Section id="year" title="RELEASE YEAR">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["all", "2026", "2025", "2024", "2023", "2022"].map((y) => (
            <button
              key={y}
              onClick={() => updateParam("year", y)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border
                ${
                  year === y
                    ? "bg-primary/20 text-white border-primary/40"
                    : "text-zinc-400 border-white/10 hover:text-white hover:bg-white/5"
                }`}
            >
              {y === "all" ? "All Years" : y}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}
