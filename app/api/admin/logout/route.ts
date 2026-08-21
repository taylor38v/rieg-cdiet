import { NextResponse } from "next/server";
import { COOKIE_NOM, COOKIE_OPTIONS } from "@/lib/auth.mjs";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NOM, "", { ...COOKIE_OPTIONS, maxAge: 0 } as any);
  return res;
}
