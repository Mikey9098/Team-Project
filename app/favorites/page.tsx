import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FavoritesList from "@/app/components/FavoritesList";

export const revalidate = 0;

type FavoriteRow = {
  game_id: number;
  game_name: string | null;
  game_image: string | null;
  created_at: string;
};

export default async function FavoritesPage() {
  const supabase = await createClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData.user;

  if (userErr || !user) redirect("/login");

  const { data, error } = await supabase
    .from("favorites")
    .select("game_id, game_name, game_image, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // If table doesn't exist / RLS issue, show a helpful message
    return (
      <div className="min-h-screen bg-black text-white pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black">Favorites</h1>
          <p className="mt-4 text-white/70">
            Failed to load favorites:{" "}
            <span className="text-red-300">{error.message}</span>
          </p>
        </div>
      </div>
    );
  }

  const favorites = (data ?? []) as FavoriteRow[];

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              My Favorites
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Saved games appear here. Click a game to open it.
            </p>
          </div>

          <div className="text-sm text-white/60">{favorites.length} saved</div>
        </div>

        <div className="mt-8">
          <FavoritesList initialFavorites={favorites} />
        </div>
      </div>
    </div>
  );
}
