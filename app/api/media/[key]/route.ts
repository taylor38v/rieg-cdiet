/* Sert une image/vidéo envoyée depuis le back-office (Netlify Blobs). Public en lecture. */
import { getMedia } from "@/lib/db.mjs";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const media: any = await getMedia(key);
  if (!media) return new Response("Introuvable", { status: 404 });
  return new Response(media.buffer, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
