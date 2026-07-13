import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/session";
import { uploadArtworkImage } from "@/lib/storage/artwork-images";

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
  const artworkId = String(formData.get("artworkId") ?? "");

  if (!(file instanceof File) || !artworkId) {
    return NextResponse.json({ error: "Fichier ou identifiant manquant" }, { status: 400 });
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
    const result = await uploadArtworkImage(
      artworkId,
      buffer,
      file.name,
      file.type
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec du téléversement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
