import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const p = site["a-propos"];
  return {
    title: p.meta_title,
    description: p.meta_description,
  };
}

export default async function Page() {
  const site = await getSiteContent();
  const p = site["a-propos"];
  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{p.hero.surtitre}</div>
          <h1 className="font-serif text-3xl md:text-4xl mt-3 leading-[1.05]">{p.hero.titre_l1}<br />{p.hero.titre_l2}</h1>
          {p.hero.paragraphes.map((para, i) => (
            <p key={i} className="text-muted mt-8 leading-relaxed">{para}</p>
          ))}
          <div className="mt-10 grid grid-cols-3 gap-6">
            {p.hero.stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-3xl text-navy">{s.valeur}</div>
                <div className="text-xs uppercase tracking-widest text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="aspect-[4/5]">
          <img src={p.hero.photo} alt={p.hero.photo_alt} className="w-full h-full object-cover" />
        </div>
      </section>

      <section className="bg-ivory-deep py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{p.engagements.surtitre}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{p.engagements.titre}</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {p.engagements.items.map((it) => (
              <div key={it.titre} className="rounded-xl p-6 bg-white border border-ink/5">
                <div className="font-serif text-2xl text-navy">{it.titre}</div>
                <div className="text-muted text-sm mt-3 leading-relaxed">{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-ivory py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl">{p.cta_final.titre}</h2>
          <Link href={p.cta_final.cta_href} className="inline-block mt-8 px-7 py-4 bg-gold text-navy hover:bg-gold-soft rounded-full">{p.cta_final.cta_label}</Link>
        </div>
      </section>
    </>
  );
}
