"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
};

const Header = () => {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔹 1. Optimized Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      // Added a threshold (10px) to prevent jittery hiding on small movements
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

  // 🔹 2. Handle Click Outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 3. Search with Cleanup (Fixes Race Conditions)
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

    // Debounce of 400ms
    const timeoutId = setTimeout(fetchData, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort(); // Cancel previous request if user keeps typing
    };
  }, [search]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/games?search=${encodeURIComponent(search)}`);
      setOpen(false);
      setIsMobileMenuOpen(false); // Close mobile menu if open
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
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/80 ">
          <Link href="/games" className="hover:text-primary transition-all duration-300">
            Games
          </Link>
          <Link href="/genres" className="hover:text-primary transition-  all duration-300">
            Genres
          </Link>
          <Link href="/new" className="hover:text-primary transition-all duration-300">
            New Releases
          </Link>
        </nav>

        {/* SEARCH BAR CONTAINER */}
        <div ref={searchContainerRef} className="relative hidden md:block w-72">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-white/50 " />
            <Input
              value={search}
              placeholder="Search games..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleEnter}
              onFocus={() => search && setOpen(true)}
              className="bg-white/5 border-white/10 text-white pl-9  "
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

          {/* SEARCH DROPDOWN */}
          {open && (
            <div className="absolute mt-2 w-full bg-zinc-950 border border-white/10 rounded-md shadow-2xl overflow-hidden z-50">
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
            </div>
          )}
        </div>

        {/* MOBILE MENU */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
            >
              <Menu />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="bg-zinc-950 border-r-white/10 text-white"
          >
            <div className="mt-6 space-y-6">
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

              <div className="flex flex-col gap-4 text-lg">
                <Link href="/games" onClick={() => setIsMobileMenuOpen(false)}>
                  Games
                </Link>
                <Link href="/genres" onClick={() => setIsMobileMenuOpen(false)}>
                  Genres
                </Link>
                <Link href="/new" onClick={() => setIsMobileMenuOpen(false)}>
                  New Releases
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
