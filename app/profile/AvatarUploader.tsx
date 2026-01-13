"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

export default function AvatarUploader({
  userId,
  currentUrl,
  onUploaded,
}: {
  userId: string;
  currentUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const pickFile = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setMsg(null);

    // basic checks
    if (!file.type.startsWith("image/")) {
      setMsg("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg("Max size is 2MB.");
      return;
    }

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/${Date.now()}.${ext}`;

      // upload to Storage
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (upErr) throw upErr;

      // get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl;

      // save url in profiles
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert({ id: userId, avatar_url: url }, { onConflict: "id" });

      if (profErr) throw profErr;

      onUploaded?.(url);
      setMsg("Uploaded ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <Image
            src={currentUrl || "/placeholder.jpg"}
            alt="Avatar"
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90">Avatar</p>
          <p className="text-sm text-white/55">PNG/JPG/WebP • up to 2MB</p>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              onClick={pickFile}
              disabled={busy}
              className="h-10 rounded-xl bg-primary text-black hover:bg-primary/90"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </span>
              )}
            </Button>
          </div>

          {msg && <p className="mt-2 text-xs text-white/60">{msg}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.currentTarget.value = ""; // allow re-upload same file
        }}
      />
    </div>
  );
}
