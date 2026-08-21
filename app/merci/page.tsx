import Link from "next/link";
import type { Metadata } from "next";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const m = site.merci;
  return { title: m.meta_title, description: m.meta_description };
}

export default async function Page() {
  const site = await getSiteContent();
  const m = site.merci;
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{m.surtitre}</div>
        <h1 className="font-serif text-3xl md:text-4xl mt-4">{m.titre}</h1>
        <p className="text-muted mt-6 leading-relaxed">{m.intro}</p>
        <Link href={m.cta_href} className="inline-block mt-10 px-7 py-4 bg-navy text-ivory rounded-full">{m.cta_label}</Link>
      </div>
    </div>
  );
}
