/* Lecture / écriture d'une table de contenu entière (objet ou tableau) depuis le
 * back-office. Le contenu de Rieg est en objets imbriqués (settings, site, secteurs,
 * zones) ou tableaux (articles, pages) → on lit/écrit la table complète, pas ligne
 * par ligne. Toute opération exige une session valide. `auth` est interdite (hash). */
import { NextResponse } from "next/server";
import { readTable, writeTable, TABLES } from "@/lib/db.mjs";
import { sessionActuelle } from "@/lib/auth.mjs";

export const dynamic = "force-dynamic";

const AUTORISEES = Object.keys(TABLES).filter((t) => t !== "auth");

export async function GET(_req: Request, { params }: { params: Promise<{ table: string }> }) {
  if (!(await sessionActuelle())) return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  const { table } = await params;
  if (!AUTORISEES.includes(table)) return NextResponse.json({ message: `Table inconnue : ${table}` }, { status: 400 });
  return NextResponse.json(await readTable(table));
}

export async function PUT(request: Request, { params }: { params: Promise<{ table: string }> }) {
  if (!(await sessionActuelle())) return NextResponse.json({ message: "Non authentifié." }, { status: 401 });
  const { table } = await params;
  if (!AUTORISEES.includes(table)) return NextResponse.json({ message: `Table inconnue : ${table}` }, { status: 400 });

  let value: any;
  try { value = await request.json(); } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }
  // Respect de la forme attendue : tableau pour les collections, objet pour le reste.
  const attenduTableau = (TABLES as Record<string, string>)[table] === "array";
  if (attenduTableau !== Array.isArray(value)) {
    return NextResponse.json({ message: `Forme invalide pour ${table}.` }, { status: 400 });
  }
  await writeTable(table, value);
  return NextResponse.json({ ok: true });
}
