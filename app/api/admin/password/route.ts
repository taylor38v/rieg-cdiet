/* Changement du mot de passe (page « Mon mot de passe ») — le client reste autonome. */
import { NextResponse } from "next/server";
import { sessionActuelle, changerMdp, creerJeton, COOKIE_NOM, COOKIE_OPTIONS } from "@/lib/auth.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await sessionActuelle();
  if (!session) return NextResponse.json({ message: "Non authentifié." }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const mdp = String(body.password || "");
  if (mdp.length < 8) {
    return NextResponse.json({ message: "Le mot de passe doit faire au moins 8 caractères." }, { status: 400 });
  }

  await changerMdp(mdp);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NOM, creerJeton(session.email), COOKIE_OPTIONS as any);
  return res;
}
