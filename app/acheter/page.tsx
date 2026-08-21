import type { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import CityMap from "../components/CityMap";
import HeroBackground from "../components/HeroBackground";
import ContactButtons from "../components/ContactButtons";
import ContactCTA from "../components/ContactCTA";
import { formatPrix } from "../lib/format";
import { getSecteurs, getSiteContent } from "../lib/content";

const inline = (s: string) => marked.parseInline(s) as string;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const a = site.acheter;
  return {
    title: a.meta_title,
    description: a.meta_description,
  };
}

export default async function Page() {
  const site = await getSiteContent();
  const a = site.acheter;
  const secteurs = await getSecteurs();
  return (
    <>
      <section className="relative text-ivory py-32 overflow-hidden bg-navy">
        <HeroBackground video={a.hero.video} overlay={0.65} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{a.hero.surtitre}</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.05] max-w-4xl">{a.hero.titre}</h1>
          <p className="text-ivory/80 text-lg md:text-xl mt-8 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(a.hero.intro) }} />
          <p className="text-ivory text-lg md:text-xl mt-4 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(a.hero.argument_gold) }} />
          <p className="text-ivory/80 text-lg md:text-xl mt-6 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(a.hero.presentation) }} />
          <div className="flex flex-wrap gap-4 mt-10">
            <Link href={a.hero.cta_primary_href} className="px-7 py-4 bg-gold text-navy hover:bg-gold-soft rounded-full">{a.hero.cta_primary_label}</Link>
            <ContactButtons smsBody="Bonjour Romain, je cherche un bien. " mailSubject="Recherche d'un bien" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium" dangerouslySetInnerHTML={{ __html: inline(a.piliers.surtitre) }} />
        <h2 className="font-serif text-3xl md:text-4xl mt-3" dangerouslySetInnerHTML={{ __html: inline(a.piliers.titre) }} />

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {a.piliers.items.map((p, i) => (
            <div
              key={p.titre}
              className="group relative rounded-xl p-7 bg-white border border-ink/10 hover:border-gold transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/20"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition" />
              <div className="relative flex gap-5">
                <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-soft text-navy font-serif text-2xl font-bold grid place-items-center shadow-lg group-hover:scale-110 transition">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="font-serif text-2xl text-navy font-semibold group-hover:text-gold transition" dangerouslySetInnerHTML={{ __html: inline(p.titre) }} />
                  <p className="text-muted mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(p.desc) }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ivory-deep py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium" dangerouslySetInnerHTML={{ __html: inline(a.services.surtitre) }} />
          <h2 className="font-serif text-3xl md:text-4xl mt-3" dangerouslySetInnerHTML={{ __html: inline(a.services.titre) }} />
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {a.services.items.map((s) => (
              <div key={s.titre} className="shine-hover rounded-xl p-7 bg-white border border-ink/10">
                <div className="font-serif text-2xl text-navy font-semibold" dangerouslySetInnerHTML={{ __html: inline(s.titre) }} />
                <p className="text-muted mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(s.desc) }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-ivory py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{a.secteurs_section.surtitre}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{a.secteurs_section.titre}</h2>
          <p className="text-ivory/70 mt-4 max-w-2xl">{a.secteurs_section.intro}</p>
          <div className="mt-10">
            <CityMap height={560} includeLimitrophes={true} />
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <div className="text-base font-semibold uppercase tracking-[0.25em] text-gold mb-4">{a.secteurs_section.groupe_mont_dor_label}</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {secteurs
                  .filter((s) => !["saint-just-saint-rambert", "andrezieux-boutheon"].includes(s.slug))
                  .map((s) => (
                    <Link key={s.slug} href={`/secteurs/${s.slug}`} className="group p-4 bg-navy-soft hover:bg-gold hover:text-navy transition border border-ivory/10 hover:border-gold rounded-xl">
                      <div className="font-serif text-lg">{s.nom}</div>
                      <div className="text-xs text-ivory/60 group-hover:text-navy/70 mt-1">{formatPrix(s.prixM2Maison)}/m²</div>
                    </Link>
                  ))}
              </div>
            </div>
            <div>
              <div className="text-base font-semibold uppercase tracking-[0.25em] text-gold mb-4">{a.secteurs_section.groupe_forez_label}</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {secteurs
                  .filter((s) => ["saint-just-saint-rambert", "andrezieux-boutheon"].includes(s.slug))
                  .map((s) => (
                    <Link key={s.slug} href={`/secteurs/${s.slug}`} className="group p-4 bg-navy-soft hover:bg-gold hover:text-navy transition border border-ivory/10 hover:border-gold rounded-xl">
                      <div className="font-serif text-lg">{s.nom}</div>
                      <div className="text-xs text-ivory/60 group-hover:text-navy/70 mt-1">{formatPrix(s.prixM2Maison)}/m²</div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-deep py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{site.vendre.zones_section.surtitre}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{site.vendre.zones_section.titre}</h2>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {site.vendre.zones_section.zones.map((z) => (
              <Link key={z.slug} href={`/vendre/${z.slug}`} className="group bg-white border border-ink/10 hover:border-navy rounded-2xl overflow-hidden">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={z.image} alt={z.titre} className="no-round w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                </div>
                <div className="p-6">
                  <div className="font-serif text-xl text-navy group-hover:text-gold transition">{z.titre}</div>
                  <p className="text-sm text-muted mt-2">{z.desc}</p>
                  <span className="inline-block mt-4 text-xs text-navy link-underline">{a.secteurs_section.zones_lien_label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA
        variant="ivory"
        titre={a.cta_final.titre}
        intro={a.cta_final.intro}
        smsBody="Bonjour Romain, je cherche un bien. "
        mailSubject="Recherche d'un bien"
      />
    </>
  );
}
