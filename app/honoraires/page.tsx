import type { Metadata } from "next";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const h = site.honoraires;
  return { title: h.meta_title, description: h.meta_description };
}

export default async function Page() {
  const site = await getSiteContent();
  const h = site.honoraires;
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{h.surtitre}</div>
      <h1 className="font-serif text-5xl mt-3">{h.titre}</h1>
      <p className="text-muted mt-6 leading-relaxed">{h.intro}</p>
      <div className="mt-12 border border-ink/10">
        {h.tranches.map((t) => (
          <div key={t.tranche} className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 border-b border-ink/10 last:border-0 items-baseline">
            <div className="md:col-span-1">{t.tranche}</div>
            <div className="font-serif text-2xl text-navy">{t.pct}</div>
            <div className="text-sm text-muted">{t.mini}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-8">{h.mention_bas_de_page}</p>
    </div>
  );
}
