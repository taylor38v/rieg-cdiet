/* Quitte le mode aperçu (désactive le Draft Mode) et revient à l'affichage normal. */
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to") || "/";
  const dm = await draftMode();
  dm.disable();
  const res = NextResponse.redirect(new URL(to.startsWith("/") ? to : "/", url.origin));
  res.cookies.set("apercu", "", { path: "/", maxAge: 0 });
  return res;
}
