import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/session";
import { uploadPackingPhoto } from "@/lib/storage/packing-photos";
import { packingPhotoTypeSchema } from "@/schemas/packing.schema";
import { addPackingPhoto } from "@/services/packing.service";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const orderId = String(formData.get("orderId") ?? "");
  const typeRaw = String(formData.get("type") ?? "");

  const typeParsed = packingPhotoTypeSchema.safeParse(typeRaw);
  if (!(file instanceof File) || !orderId || !typeParsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Format non accepté (JPEG, PNG, WebP)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadPackingPhoto(
      orderId,
      buffer,
      file.name,
      file.type
    );
    const photo = await addPackingPhoto(orderId, typeParsed.data, uploaded.url);
    return NextResponse.json({ url: photo.url, id: photo.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec du téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
