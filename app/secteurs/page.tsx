import Link from "next/link";
import type { Metadata } from "next";
import { formatPrix } from "../lib/format";
import { getSecteurs, getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const sl = site["secteurs-landing"];
  return {
    title: sl.meta_title,
    description: sl.meta_description,
  };
}

export default async function Page() {
  const site = await getSiteContent();
  const sl = site["secteurs-landing"];
  const secteurs = await getSecteurs();
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="max-w-3xl">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{sl.surtitre}</div>
        <h1 className="font-serif text-3xl md:text-4xl mt-3">{sl.titre}</h1>
        <p className="text-muted mt-6 leading-relaxed">{sl.intro}</p>
      </div>

      <div className="mt-16 space-y-4">
        {secteurs.map((s) => (
          <Link key={s.slug} href={`/secteurs/${s.slug}`} className="group block border-t border-ink/10 py-8 hover:border-navy">
            <div className="grid md:grid-cols-6 gap-6 items-center">
              {s.image && (
                <div className="md:col-span-1 aspect-[4/3] overflow-hidden bg-ivory-deep">
                  <img src={s.image} alt={s.nom} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
              )}
              <div className="md:col-span-2">
                <div className="font-serif text-3xl text-navy group-hover:text-gold transition">{s.nom}</div>
                <div className="text-sm text-muted mt-2">{s.quartiers.slice(0, 3).join(" · ")}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted">{sl.prix_maison_label}</div>
                <div className="font-serif text-xl mt-1">{formatPrix(s.prixM2Maison)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted">{sl.prix_appart_label}</div>
                <div className="font-serif text-xl mt-1">{formatPrix(s.prixM2Appart)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted">{sl.delai_label}</div>
                <div className="font-serif text-xl mt-1">{s.delaiVente} j</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
