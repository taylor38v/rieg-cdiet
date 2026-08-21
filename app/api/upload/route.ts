/* Envoi d'une image depuis le back-office → Netlify Blobs (store rieg-media).
 * Renvoie l'URL /api/media/<key> à stocker dans le contenu. */
import { NextResponse } from "next/server";
import { sessionActuelle } from "@/lib/auth.mjs";
import { putMedia } from "@/lib/db.mjs";

export const dynamic = "force-dynamic";

const MAX = 12 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "video/mp4"];

export async function POST(request: Request) {
  if (!(await sessionActuelle())) return NextResponse.json({ ok: false, message: "Non authentifié." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, message: "Aucun fichier." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ ok: false, message: "Fichier trop lourd (12 Mo maximum)." }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ ok: false, message: "Format non accepté (JPG, PNG, WebP, AVIF, GIF ou MP4)." }, { status: 400 });

  const propre = (file.name || "fichier")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-60);

  const key = `up-${Date.now()}-${propre}`;
  await putMedia(key, Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ ok: true, url: `/api/media/${key}` });
}
