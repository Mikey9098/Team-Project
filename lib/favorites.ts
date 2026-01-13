import { createClient } from "@/lib/supabase/client";

export async function toggleFavorite(game: {
  id: number;
  name: string;
  background_image?: string | null;
}) {
  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error("Please log in");

  // check if exists
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", game.id)
    .maybeSingle();

  if (existing?.id) {
    // remove
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return { favorited: false };
  } else {
    // add
    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      game_id: game.id,
      game_name: game.name,
      game_image: game.background_image ?? null,
    });
    if (error) throw error;
    return { favorited: true };
  }
}
