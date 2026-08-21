/* « Mettre le site à jour » — instantané : le site et le back-office sont la même app,
 * il suffit d'invalider le cache des pages. Pas de build, pas de Git. */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sessionActuelle } from "@/lib/auth.mjs";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await sessionActuelle())) {
    return NextResponse.json({ ok: false, message: "Non authentifié." }, { status: 401 });
  }
  try {
    // 'layout' : header/footer/menu sont communs → une modif peut toucher toutes les pages.
    revalidatePath("/", "layout");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, message: "Site mis à jour ✔ — vos modifications sont en ligne." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: "Échec de la mise à jour : " + e.message }, { status: 500 });
  }
}
