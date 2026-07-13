import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Configuration Supabase admin manquante");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const BUCKET = "artworks";

export async function ensureArtworksBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    });
    if (error && !error.message.includes("already exists")) {
      throw error;
    }
  }
}

export async function uploadArtworkImage(
  artworkId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; publicId: string }> {
  await ensureArtworksBucket();
  const supabase = createSupabaseAdmin();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${artworkId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    throw new Error(`Échec du téléversement : ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl, publicId: path };
}

export async function deleteArtworkImage(publicId: string) {
  const supabase = createSupabaseAdmin();
  await supabase.storage.from(BUCKET).remove([publicId]);
}
