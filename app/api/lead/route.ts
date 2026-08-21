/* Réception des demandes envoyées par les formulaires du site (contact, avis de valeur,
 * newsletter…). Écrit dans la table `leads` (Netlify Blobs) et, si une clé Resend est
 * configurée, envoie une notification e-mail. Public — pas d'authentification, mais
 * anti-robot par honeypot. Remplace Netlify Forms. */
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readTable, writeTable } from "@/lib/db.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: any = {};
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) body = await request.json();
    else {
      const form = await request.formData();
      body = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
    }
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  // Honeypot : un robot remplit ce champ caché → on répond OK sans rien enregistrer.
  if (body["bot-field"]) return NextResponse.json({ ok: true });
  delete body["bot-field"];
  delete body["form-name"];

  const source = String(body.source || body._source || "formulaire");
  delete body.source; delete body._source;

  const lead = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    source,
    ...body,
  };

  try {
    const rows = await readTable("leads");
    const liste = Array.isArray(rows) ? rows : [];
    liste.unshift(lead);
    await writeTable("leads", liste);
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: "Enregistrement impossible." }, { status: 500 });
  }

  // Notification e-mail (facultatif — actif seulement si RESEND_API_KEY est posée).
  const cle = process.env.RESEND_API_KEY;
  const dest = process.env.LEAD_EMAIL || "romain.rieg@iadfrance.fr";
  if (cle) {
    const lignes = Object.entries(lead)
      .filter(([k]) => k !== "id")
      .map(([k, v]) => `${k} : ${v}`).join("\n");
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_FROM || "Site Romain Rieg <onboarding@resend.dev>",
          to: [dest],
          subject: `Nouvelle demande — ${source}`,
          text: lignes,
        }),
      });
    } catch { /* la demande est enregistrée : ne jamais faire échouer pour un e-mail */ }
  }

  return NextResponse.json({ ok: true });
}
