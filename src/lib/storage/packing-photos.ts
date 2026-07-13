import { createSupabaseAdmin } from "@/lib/storage/artwork-images";

const BUCKET = "packing-photos";

export async function ensurePackingPhotosBucket() {
  const supabase = createSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
    });
    if (error && !error.message.includes("already exists")) {
      throw error;
    }
  }
}

export async function uploadPackingPhoto(
  orderId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ url: string; publicId: string }> {
  await ensurePackingPhotosBucket();
  const supabase = createSupabaseAdmin();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${orderId}/${Date.now()}-${safeName}`;

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
