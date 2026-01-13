import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1️⃣ Auth
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  const user = authData.user;

  if (authErr || !user) {
    redirect("/login");
  }

  // 2️⃣ Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // 3️⃣ Favorites count (SAFE)
  const { count } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* offset for fixed header */}
      <div className="pt-[72px]" />

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10">
        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialUsername={profile?.username ?? ""}
          favoritesCount={count ?? 0}
          initialAvatarUrl={profile?.avatar_url ?? null}
        />
      </div>
    </div>
  );
}
