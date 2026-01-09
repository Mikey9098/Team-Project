"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
};

const Header = () => {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* 🔹 Hide header on scroll */
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - lastScrollY.current) > 10) {
        if (current > lastScrollY.current && current > 80) {
          setHidden(true);
        } else {
          setHidden(false);
        }
        lastScrollY.current = current;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 🔹 Click outside: search */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🔹 Search (debounced + abort) */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setOpen(true);
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games?key=14af43f3b477423b9ddd26df233927db&search=${encodeURIComponent(
            search
          )}&page_size=5`,
          { signal }
        );
        const data = await res.json();
        if (!signal.aborted) {
          setResults(
            data.results?.filter((g: Game) => g.background_image) || []
          );
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search error:", err);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [search]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/games?search=${encodeURIComponent(search)}`);
      setOpen(false);
      setIsMobileMenuOpen(false);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-black/90 backdrop-blur-md border-b border-white/10
        transition-transform duration-300 text-white
        ${hidden ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold uppercase tracking-wider text-white hover:text-primary transition-all duration-300"
        >
          GameHub
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/80">
          <Link
            href="/games"
            className="relative text-white/80 hover:text-primary transition-all duration-300
             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
             after:bg-primary after:transition-all after:duration-300
             hover:after:w-full"
          >
            Checkout All Games
          </Link>
        </nav>

        {/* DESKTOP SEARCH */}
        <div ref={searchContainerRef} className="relative hidden md:block w-72">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-white/50" />
            <Input
              value={search}
              placeholder="Search games..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleEnter}
              onFocus={() => search && setOpen(true)}
              className="bg-white/5 border-white/10 text-white pl-9"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setOpen(false);
                }}
                className="absolute right-3 hover:text-white text-white/50"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 🔽 SEARCH DROPDOWN */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="search-dropdown"
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute mt-2 w-full bg-zinc-950 border border-white/10 rounded-md shadow-2xl overflow-hidden z-50"
              >
                {loading && (
                  <p className="p-4 text-sm text-white/50 text-center">
                    Searching...
                  </p>
                )}

                {!loading && results.length === 0 && (
                  <p className="p-4 text-sm text-white/50 text-center">
                    No results found.
                  </p>
                )}

                {results.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 p-3 hover:bg-white/10 transition items-center border-b border-white/5 last:border-0"
                  >
                    <div className="relative w-12 h-14 rounded overflow-hidden shrink-0 bg-zinc-800">
                      <Image
                        src={game.background_image}
                        alt={game.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {game.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {game.released?.split("-")[0] || "TBA"}
                      </p>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE MENU BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="md:hidden text-white hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* 📱 MOBILE MENU PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-zinc-950 border-t border-white/10"
          >
            <div className="px-6 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-white/50" />
                <Input
                  placeholder="Search games..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleEnter}
                  className="bg-white/5 border-white/10 pl-9 text-white"
                />
              </div>

              {/* Mobile Links */}
              <div className="flex flex-col gap-4 text-lg">
                <Link
                  href="/games"
                  className="relative text-white/80 hover:text-primary transition-all duration-300
             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
             after:bg-primary after:transition-all after:duration-300
             hover:after:w-full"
                >
                  Checkout All Games
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
