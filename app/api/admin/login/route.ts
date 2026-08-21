/* Connexion au back-office. Route d'API (pas server action) pour que le Set-Cookie
 * survive au runtime Netlify. */
import { NextResponse } from "next/server";
import { lireCompte, verifierMdp, creerJeton, COOKIE_NOM, COOKIE_OPTIONS } from "@/lib/auth.mjs";
import { adresseIp, verifierBlocage, enregistrerEchec, reinitialiser } from "@/lib/ratelimit.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const ip = adresseIp(request);
  const blocage = await verifierBlocage(ip);
  if (blocage.bloque) {
    const reste = blocage.resteSecondes ?? 0;
    const min = Math.max(1, Math.ceil(reste / 60));
    return NextResponse.json(
      { message: `Trop de tentatives. Réessayez dans ${min} minute${min > 1 ? "s" : ""}.` },
      { status: 429, headers: { "Retry-After": String(reste) } },
    );
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const compte = await lireCompte();

  const ok = email === compte.email && verifierMdp(password, compte.sel, compte.hash);
  if (!ok) {
    const { restants } = await enregistrerEchec(ip);
    const message = restants > 0 && restants <= 2
      ? `Email ou mot de passe incorrect. Encore ${restants} tentative${restants > 1 ? "s" : ""} avant blocage.`
      : "Email ou mot de passe incorrect.";
    return NextResponse.json({ message }, { status: 401 });
  }

  await reinitialiser(ip);
  const res = NextResponse.json({ ok: true, email });
  res.cookies.set(COOKIE_NOM, creerJeton(email), COOKIE_OPTIONS as any);
  return res;
}
