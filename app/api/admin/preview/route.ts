/* Active le mode aperçu (Draft Mode de Next) puis redirige vers la page à prévisualiser.
 * En mode aperçu, Next rend la page à la volée depuis le contenu ENREGISTRÉ (Blobs),
 * sans passer par le cache → on voit le rendu réel avant de publier. Réservé à une session. */
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
// @ts-ignore .mjs
import { sessionActuelle } from "@/lib/auth.mjs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await sessionActuelle())) return new Response("Non authentifié.", { status: 401 });

  const url = new URL(request.url);
  let to = url.searchParams.get("to") || "/";
  if (!to.startsWith("/")) to = "/"; // sécurité : uniquement des chemins internes

  const dm = await draftMode();
  dm.enable();

  const res = NextResponse.redirect(new URL(to, url.origin));
  // Cookie lisible côté client (non httpOnly) : sert à afficher le bandeau « aperçu ».
  res.cookies.set("apercu", "1", { path: "/", sameSite: "lax" });
  return res;
}
