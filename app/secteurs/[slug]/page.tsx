import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { marked } from "marked";
import { formatPrix } from "../../lib/format";
import { getSecteurs, getSecteursDetails } from "../../lib/content";
import HeroBackground from "../../components/HeroBackground";
import CityMap from "../../components/CityMap";
import MarketEvolution from "../../components/MarketEvolution";
import ContactCTA from "../../components/ContactCTA";

const inline = (s: string) => marked.parseInline(s) as string;

// Élision devant une voyelle : "de Andrézieux-Bouthéon" -> "d'Andrézieux-Bouthéon" (idem Écully).
const deNom = (nom: string) => (/^[aeiouyàâäéèêëîïôöûü]/i.test(nom) ? `d'${nom}` : `de ${nom}`);

const VIDEO_BG: Record<string, string> = {
  "saint-didier-au-mont-dor": "/videos/secteurs/saint-didier.mp4",
  "saint-cyr-au-mont-dor": "/videos/secteurs/saint-cyr.mp4",
  "ecully": "/videos/secteurs/ecully.mp4",
  "dardilly": "/videos/secteurs/dardilly.mp4",
  "limonest": "/videos/secteurs/limonest.mp4",
  "champagne-au-mont-dor": "/videos/secteurs/champagne.mp4",
  "saint-just-saint-rambert": "/videos/secteurs/saint-just.mp4",
  "andrezieux-boutheon": "/videos/secteurs/andrezieux.mp4",
};

export async function generateStaticParams() {
  const secteurs = await getSecteurs();
  return secteurs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: PageProps<"/secteurs/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const secteurs = await getSecteurs();
  const s = secteurs.find((x) => x.slug === slug);
  if (!s) return {};
  const secteursDetails = await getSecteursDetails();
  const d = secteursDetails[slug];
  return {
    title: d?.meta_title ?? `Conseiller iad à ${s.nom}`,
    description: d?.meta_description ?? `Avis de valeur, vente, acquisition et location à ${s.nom}. Connaissance fine du marché, des quartiers et du tissu local par Romain Rieg.`,
  };
}

export default async function Page(props: PageProps<"/secteurs/[slug]">) {
  const { slug } = await props.params;
  const secteurs = await getSecteurs();
  const s = secteurs.find((x) => x.slug === slug);
  const secteursDetails = await getSecteursDetails();
  const d = secteursDetails[slug];
  if (!s) notFound();

  // Fond du haut de page (image OU vidéo) : champ "video" de la commune, sinon vidéo par défaut.
  const heroVideo = d?.video || VIDEO_BG[slug];
  // Vidéo verticale dédiée à la rubrique "Visite vidéo" (champ distinct du hero).
  const visiteVideo = d?.video_visite;
  const instaUrl = d?.instagram_url || "https://www.instagram.com/romainrieg.immo/";

  return (
    <>
      <section className="relative text-ivory py-32 overflow-hidden bg-navy">
        <HeroBackground video={heroVideo} images={d?.galerie || (s.image ? [s.image] : [])} overlay={0.6} position={d?.hero_position} />
        <div className="relative max-w-7xl mx-auto px-6">
          <Link href="/" className="text-ivory/60 text-sm">← Accueil</Link>
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-6">{d?.cp ?? "Mon territoire"}{d?.intercommunalite ? ` · ${d.intercommunalite}` : ""}</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.05] max-w-4xl">{s.nom}</h1>
          <p className="text-ivory/80 text-lg mt-8 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(d?.intro ?? s.intro) }} />

          {d && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-12 max-w-4xl">
              {/* Tailles réduites de 15% par rapport à text-4xl/5xl et text-xs/sm (demande client). */}
              <div>
                <div className="font-serif text-[1.9rem] md:text-[2.55rem] text-gold font-semibold">{d.population.toLocaleString("fr-FR")}</div>
                <div className="text-[0.64rem] md:text-[0.74rem] uppercase tracking-widest text-ivory/70 mt-3 font-medium">Habitants</div>
              </div>
              <div>
                <div className="font-serif text-[1.9rem] md:text-[2.55rem] text-gold font-semibold">{d.superficie} km²</div>
                <div className="text-[0.64rem] md:text-[0.74rem] uppercase tracking-widest text-ivory/70 mt-3 font-medium">Superficie</div>
              </div>
              <div>
                <div className="font-serif text-[1.9rem] md:text-[2.55rem] text-gold font-semibold">{formatPrix(s.prixM2Maison)}</div>
                <div className="text-[0.64rem] md:text-[0.74rem] uppercase tracking-widest text-ivory/70 mt-3 font-medium">Prix m² maison</div>
              </div>
              <div>
                <div className="font-serif text-[1.9rem] md:text-[2.55rem] text-gold font-semibold">{s.delaiVente} j</div>
                <div className="text-[0.64rem] md:text-[0.74rem] uppercase tracking-widest text-ivory/70 mt-3 font-medium">Délai moyen</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {d?.ce_qui_differencie && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Ce qui différencie {s.nom}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">Pourquoi cette commune attire.</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-10">
            {d.ce_qui_differencie.map((c, i) => {
              const titre = typeof c === "object" ? (c.titre || "") : "";
              const desc = typeof c === "object" ? (c.description || "") : String(c);
              return (
                <div key={i} className="shine-hover rounded-xl flex gap-4 p-5 bg-ivory-deep border border-ink/5">
                  <span className="font-serif text-3xl text-gold leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-ink/85 leading-relaxed">
                    {titre && <strong className="text-navy">{titre}</strong>}
                    {titre && desc ? " : " : ""}
                    <span dangerouslySetInnerHTML={{ __html: inline(desc) }} />
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {d?.evolution_prix && d.evolution_prix.length > 0 && (
        <section className="bg-navy text-ivory py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Évolution du marché</div>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">Prix moyen au m² depuis 2020.</h2>
            <MarketEvolution
              evolutionPrix={d.evolution_prix}
              prixM2Maison={s.prixM2Maison}
              prixM2Appart={s.prixM2Appart}
            />
          </div>
        </section>
      )}

      {visiteVideo && (
        <section className="bg-ivory-deep py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Visite vidéo</div>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">{s.nom} en vidéo.</h2>
            <p className="text-muted mt-3 max-w-2xl">Un aperçu de la commune - paysages, ambiance, points de vue.</p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-2xl overflow-hidden shadow-xl bg-navy w-full max-w-[360px] aspect-[9/16]">
                <video
                  src={visiteVideo}
                  controls
                  playsInline
                  preload="metadata"
                  className="no-round w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="mt-6 text-center">
              <a href={instaUrl} target="_blank" rel="noopener" className="inline-block px-6 py-3 bg-navy text-ivory hover:bg-gold hover:text-navy text-sm transition rounded-full">Voir plus de contenus sur Instagram →</a>
            </div>
          </div>
        </section>
      )}

      {d?.quartiers && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Les quartiers</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">Une lecture quartier par quartier.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {d.quartiers.map((q) => (
              <div key={q.nom} className="shine-hover rounded-xl p-7 bg-white border border-ink/10">
                <div className="font-serif text-xl text-navy font-semibold">{q.nom}</div>
                {q.prix_indicatif && <div className="text-[10px] text-gold mt-2 uppercase tracking-widest">{q.prix_indicatif}</div>}
                <p className="text-sm text-muted mt-3 leading-relaxed">{q.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {d?.ecoles && (
        <section className="bg-ivory-deep py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Écoles & enseignement</div>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">Le réseau scolaire local.</h2>
            <p className="text-muted mt-3 max-w-2xl text-sm">Cliquez sur une école pour voir sa localisation Google Maps.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-10">
              {d.ecoles.map((e) => (
                <a
                  key={e.nom}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.nom + " " + s.nom)}`}
                  target="_blank"
                  rel="noopener"
                  className="group rounded-xl p-5 bg-white border border-ink/10 hover:border-gold transition block"
                >
                  <div className="text-[10px] uppercase tracking-widest text-gold">{e.type}</div>
                  <div className="font-serif text-xl text-navy mt-1 font-semibold group-hover:text-gold transition">{e.nom}</div>
                  {e.precision && <p className="text-sm text-muted mt-2 leading-relaxed">{e.precision}</p>}
                  <div className="text-[10px] text-gold mt-2 opacity-0 group-hover:opacity-100 transition">📍 Google Maps →</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {d?.restaurants && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Tables & adresses</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">Où l'on mange bien à {s.nom}.</h2>
          <p className="text-muted mt-3 max-w-2xl text-sm">Classé par note Google. Cliquez sur une adresse pour l'ouvrir dans Google Maps.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
            {[...d.restaurants]
              .sort((a, b) => (b.note ?? 0) - (a.note ?? 0))
              .map((r) => (
                <a
                  key={r.nom}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nom + " " + s.nom)}`}
                  target="_blank"
                  rel="noopener"
                  className="shine-hover group rounded-xl p-5 bg-white border border-ink/10 transition block"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] uppercase tracking-widest text-gold">{r.gamme}</div>
                    {r.note && (
                      <div className="text-xs font-semibold text-gold">★ {r.note.toFixed(1)}</div>
                    )}
                  </div>
                  <div className="font-serif text-xl text-navy mt-1 font-semibold group-hover:text-gold transition">{r.nom}</div>
                  <p className="text-sm text-muted mt-2 leading-relaxed">{r.cuisine}</p>
                  <div className="text-[10px] text-gold mt-3 opacity-0 group-hover:opacity-100 transition">📍 Ouvrir sur Google Maps →</div>
                </a>
              ))}
          </div>
        </section>
      )}

      {d?.associations && (
        <section className="bg-ivory-deep py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Vie associative</div>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">Le tissu local qui fait vivre la commune.</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-10">
              {d.associations.map((a) => (
                <div key={a.nom} className="shine-hover rounded-xl flex gap-4 p-5 bg-white border border-ink/5">
                  <span className="font-serif text-3xl text-gold leading-none">·</span>
                  <div>
                    <div className="font-serif text-xl text-navy font-semibold">{a.nom}</div>
                    <div className="text-sm text-muted mt-1 leading-relaxed">{a.activite}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {d?.galerie && d.galerie.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">En images</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{s.nom} comme je la vois.</h2>
          <p className="text-muted mt-3 max-w-2xl">Photos prises sur le terrain au gré de mes visites et de mes rencontres dans la commune.</p>
          <div className="grid md:grid-cols-3 gap-3 mt-10">
            {d.galerie.map((src, i) => (
              <div key={i} className="overflow-hidden bg-ivory-deep group rounded-xl aspect-[4/3]">
                <img src={src} alt={`${s.nom} ${i + 1}`} className="no-round w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
            ))}
            {[s.image, "/photos/IMG_7295.jpeg", "/photos/IMG_7282.jpeg"].filter((src) => src && !d.galerie?.includes(src)).slice(0, 3 - d.galerie.length).map((src, i) => (
              <div key={`f-${i}`} className="aspect-[4/3] overflow-hidden bg-ivory-deep group rounded-xl">
                <img src={src!} alt="" className="no-round w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Zoom sur la commune</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-3">{s.nom} en détail.</h2>
        <p className="text-muted mt-3 max-w-2xl">Vue rapprochée {deNom(s.nom)} pour visualiser ses contours et ses limites.</p>
        <div className="mt-10">
          <CityMap slugs={[slug]} height={520} showLegend={false} includeLimitrophes={false} />
        </div>
      </section>

      <ContactCTA
        variant="ivory"
        titre={`Un projet immobilier à ${s.nom} ?`}
        intro="Avis de valeur offert sous 24 - 48h, confidentiel, sans engagement."
        smsBody={`Bonjour Romain, j'ai un projet immobilier à ${s.nom}. `}
        mailSubject={`Projet immobilier à ${s.nom}`}
      />
    </>
  );
}
