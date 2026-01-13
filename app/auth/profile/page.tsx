import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, created_at")
    .eq("id", data.user.id)
    .single();

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-24 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-white/60 text-sm">Username</p>
        <p className="text-xl font-semibold">{profile?.username ?? "—"}</p>

        <p className="text-white/60 text-sm mt-4">Email</p>
        <p className="text-lg">{data.user.email}</p>
      </div>
    </div>
  );
}
