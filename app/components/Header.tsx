"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  X,
  LogOut,
  User,
  Gamepad2,
  Sparkles,
} from "lucide-react";
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

function AvatarCircle({ label, src }: { label: string; src?: string | null }) {
  const letter = (label?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/15 bg-white/10 grid place-items-center font-bold text-sm text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent" />
      {src ? (
        <Image
          src={src}
          alt="Avatar"
          fill
          sizes="36px"
          className="object-cover"
          priority={false}
        />
      ) : (
        <span className="relative">{letter}</span>
      )}
    </div>
  );
}

function SkeletonPill() {
  return (
    <div className="h-10 w-44 rounded-2xl bg-white/10 animate-pulse border border-white/10" />
  );
}

const noCaret = "select-none caret-transparent";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${noCaret} relative text-white/75 hover:text-white transition
      after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0
      after:bg-primary after:transition-all after:duration-300
      hover:after:w-full`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const displayName = username || userEmail || "";
  const isLoggedIn = !!userId;

  async function fetchAuthAndProfile() {
    if (firstLoadRef.current) setAuthLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!sessionUser) {
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
        setAvatarUrl(null);
        return;
      }

      setUserId(sessionUser.id);
      setUserEmail(sessionUser.email ?? null);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (!error) {
        setUsername(profile?.username ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
      } else {
        setUsername(null);
        setAvatarUrl(null);
      }
    } finally {
      setAuthLoading(false);
      firstLoadRef.current = false;
    }
  }

  useEffect(() => {
    fetchAuthAndProfile();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? null);
      setUsername(null);
      setAvatarUrl(null);
      setAuthLoading(false);
      fetchAuthAndProfile();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleLogout = async () => {
    setUserId(null);
    setUserEmail(null);
    setUsername(null);
    setAvatarUrl(null);
    setIsMobileMenuOpen(false);

    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // Hide header on scroll
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

  // Click outside: CLOSE dropdown AND BLUR input
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      const clickedSearch =
        searchContainerRef.current?.contains(target) ?? false;
      const clickedMobile = mobileMenuRef.current?.contains(target) ?? false;

      if (!clickedSearch) {
        setOpenSearch(false);
        if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        }
      }

      if (!clickedMobile) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Search (debounced)
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
          )}&page_size=6`,
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

    const timeoutId = setTimeout(fetchData, 350);
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
      searchInputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setOpenSearch(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        border-b border-white/10
        bg-black/55 backdrop-blur-xl
        transition-transform duration-300 text-white
        ${hidden ? "-translate-y-full" : "translate-y-0"}
      `}
      onMouseDown={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest("input, textarea, select, button, a, [role='button']"))
          return;
        e.preventDefault();
      }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-[72px] flex items-center justify-between gap-3">
        {/* LOGO */}
        <Link href="/" className={`${noCaret} flex items-center gap-3 group`}>
          <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center group-hover:bg-white/10 transition">
            <Gamepad2 className="h-5 w-5 text-white/80 group-hover:text-primary transition" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-tight group-hover:text-primary transition">
              GameHub
            </p>
            <p className="text-xs text-white/45">Discover • Save • Play</p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLink href="/games">Browse</NavLink>
          {isLoggedIn && <NavLink href="/favorites">Favorites</NavLink>}
        </nav>

        {/* DESKTOP SEARCH */}
        <div
          ref={searchContainerRef}
          className="relative hidden md:block w-[360px]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              ref={searchInputRef}
              value={search}
              placeholder="Search games..."
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleEnter}
              onFocus={() => search && setOpenSearch(true)}
              className="h-11 rounded-2xl bg-white/5 border-white/10 text-white pl-9 pr-9 placeholder:text-white/35"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setOpenSearch(false);
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white"
                aria-label="Clear search"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {openSearch && (
              <motion.div
                key="search-dropdown"
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="absolute mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
              >
                <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/55">
                    Press <span className="text-white/80">Enter</span> to search
                  </span>
                  <span className="text-xs text-white/40">Esc to close</span>
                </div>

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

                <div className="max-h-[420px] overflow-auto">
                  {results.map((g) => (
                    <Link
                      key={g.id}
                      href={`/games/${g.id}`}
                      onClick={() => {
                        setOpenSearch(false);
                        searchInputRef.current?.blur();
                      }}
                      className={`${noCaret} group flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition border-b border-white/5 last:border-0`}
                    >
                      <div className="relative w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-800 border border-white/10">
                        <Image
                          src={g.background_image}
                          alt={g.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-white/90 group-hover:text-white">
                          {g.name}
                        </p>
                        <p className="text-xs text-white/45">
                          {g.released?.split("-")[0] || "TBA"}
                        </p>
                      </div>
                      <div className="text-xs text-white/35 group-hover:text-white/60">
                        →
                      </div>
                    </Link>
                  ))}
                </div>
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
                className="h-11 rounded-2xl text-white hover:text-primary hover:bg-transparent"
              >
                <Link href="/login" className={noCaret}>
                  Login
                </Link>
              </Button>

              <Button
                asChild
                className="h-11 rounded-2xl bg-primary text-black hover:bg-primary/90"
              >
                <Link href="/signup" className={noCaret}>
                  Sign up
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Link href="/profile" className={`${noCaret} group`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition">
                  <div className="relative">
                    <AvatarCircle label={displayName} src={avatarUrl} />
                    <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border border-black bg-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate max-w-[160px]">
                      {username || "User"}
                    </p>
                    <p className="text-xs text-white/45 truncate max-w-[160px]">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </Link>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-11 rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="md:hidden h-11 w-11 rounded-2xl text-white hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* MOBILE PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  placeholder="Search games..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleEnter}
                  className="h-11 rounded-2xl bg-white/5 border-white/10 pl-9 pr-9 text-white placeholder:text-white/35"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Links */}
              <div className="grid gap-2">
                <Link
                  href="/games"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${noCaret} rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/85 hover:bg-white/10 transition`}
                >
                  Browse
                </Link>

                {isLoggedIn && (
                  <Link
                    href="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`${noCaret} rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/85 hover:bg-white/10 transition`}
                  >
                    Favorites
                  </Link>
                )}
              </div>

              {/* Mobile Auth */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                {authLoading ? (
                  <SkeletonPill />
                ) : !isLoggedIn ? (
                  <div className="grid gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="h-11 rounded-2xl justify-start text-white hover:bg-white/10"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={noCaret}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-11 rounded-2xl justify-start bg-primary text-black hover:bg-primary/90"
                    >
                      <Link
                        href="/signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={noCaret}
                      >
                        Sign up
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 px-2 py-2">
                      <AvatarCircle label={displayName} src={avatarUrl} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/90 truncate">
                          {username || "User"}
                        </p>
                        <p className="text-xs text-white/45 truncate">
                          {userEmail}
                        </p>
                      </div>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-white/55">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Member
                      </span>
                    </div>

                    <Button
                      asChild
                      type="button"   
                      variant="ghost"
                      className="h-11 rounded-2xl justify-start text-white hover:bg-white/10"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={noCaret}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="h-11 rounded-2xl justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
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
