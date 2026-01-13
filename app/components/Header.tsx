"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, X, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Game = {
  id: number;
  name: string;
  background_image: string;
  released: string;
};

function AvatarCircle({ label }: { label: string }) {
  const letter = (label?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full border border-white/15 bg-white/10 grid place-items-center font-bold text-sm text-white">
      {letter}
    </div>
  );
}

function SkeletonPill() {
  return (
    <div className="h-9 w-40 rounded-full bg-white/10 animate-pulse border border-white/10" />
  );
}

export default function Header() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const firstLoadRef = useRef(true);

  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);
  const [results, setResults] = useState<Game[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // auth UI
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const displayName = username || userEmail || "";

  async function fetchAuthAndProfile() {
    // show skeleton only on first load
    if (firstLoadRef.current) setAuthLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!sessionUser) {
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
        return;
      }

      setUserId(sessionUser.id);
      setUserEmail(sessionUser.email ?? null);

      // Try profiles.username; if table/row missing, just fallback to email
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!error) {
        setUsername(profile?.username ?? null);
      } else {
        // Don't block UI if profiles query fails
        console.warn("profiles fetch failed:", error.message);
        setUsername(null);
      }
    } finally {
      setAuthLoading(false);
      firstLoadRef.current = false;
    }
  }

  useEffect(() => {
    fetchAuthAndProfile();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // update instantly, then fetch profile
      const u = session?.user ?? null;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? null);
      setUsername(null);
      setAuthLoading(false); // important: don’t get stuck
      fetchAuthAndProfile();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleLogout = async () => {
    // update UI immediately
    setUserId(null);
    setUserEmail(null);
    setUsername(null);
    setIsMobileMenuOpen(false);

    await supabase.auth.signOut();

    // hard redirect so everything updates everywhere
    window.location.href = "/login";
  };

  /* Hide header on scroll */
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - lastScrollY.current) > 10) {
        setHidden(current > lastScrollY.current && current > 80);
        lastScrollY.current = current;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Click outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setOpenSearch(false);
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

  /* Search (debounced) */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setOpenSearch(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoadingSearch(true);
      setOpenSearch(true);
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
        if (err.name !== "AbortError") console.error("Search error:", err);
      } finally {
        if (!signal.aborted) setLoadingSearch(false);
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
      setOpenSearch(false);
      setIsMobileMenuOpen(false);
    }
    if (e.key === "Escape") setOpenSearch(false);
  };

  const isLoggedIn = !!userId;

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
            Browse All Games
          </Link>

          {isLoggedIn && (
            <Link
              href="/favorites"
              className="relative text-white/80 hover:text-primary transition-all duration-300
             after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
             after:bg-primary after:transition-all after:duration-300
             hover:after:w-full"
            >
              Favorites
            </Link>
          )}
        </nav>
        z{/* DESKTOP SEARCH */}
        <div ref={searchContainerRef} className="relative hidden md:block w-72">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-white/50" />
            <Input
              value={search}
              placeholder="Search games..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleEnter}
              onFocus={() => search && setOpenSearch(true)}
              className="bg-white/5 border-white/10 text-white pl-9"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setOpenSearch(false);
                }}
                className="absolute right-3 hover:text-white text-white/50"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {openSearch && (
              <motion.div
                key="search-dropdown"
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute mt-2 w-full bg-zinc-950 border border-white/10 rounded-md shadow-2xl overflow-hidden z-50"
              >
                {loadingSearch && (
                  <p className="p-4 text-sm text-white/50 text-center">
                    Searching...
                  </p>
                )}

                {!loadingSearch && results.length === 0 && (
                  <p className="p-4 text-sm text-white/50 text-center">
                    No results found.
                  </p>
                )}

                {results.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    onClick={() => setOpenSearch(false)}
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
        {/* DESKTOP AUTH */}
        <div className="hidden md:flex items-center gap-2">
          {authLoading ? (
            <SkeletonPill />
          ) : !isLoggedIn ? (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-white hover:border-primary hover:text-primary hover:border-2 transition-all duration-300"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-primary text-black hover:bg-primary/90"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <AvatarCircle label={displayName} />
                <div className="text-sm text-white/80 max-w-44 truncate">
                  {username || userEmail}
                </div>
              </div>

              <Button
                asChild
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          )}
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

      {/* MOBILE MENU */}
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
                  Browse All Games
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Favorites
                </Link>
                {isLoggedIn && (
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                {authLoading ? (
                  <SkeletonPill />
                ) : !isLoggedIn ? (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start text-white hover:bg-white/10"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="justify-start bg-primary text-black hover:bg-primary/90"
                    >
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-2 text-white/80">
                      <AvatarCircle label={displayName} />
                      <span className="truncate">{username || userEmail}</span>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start text-white hover:bg-white/10"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start text-white hover:bg-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
