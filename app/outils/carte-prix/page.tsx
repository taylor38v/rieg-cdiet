"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import { zones } from "../../lib/territoire";
import { useSecteurs, useSecteursDetails, useSiteContent } from "../../lib/ClientData";

// Slugs des communes ayant déjà une fiche dédiée → exclues de la section limitrophes
const FICHES_EXISTANTES = new Set([
  "Saint-Didier-au-Mont-d'Or",
  "Saint-Cyr-au-Mont-d'Or",
  "Écully",
  "Dardilly",
  "Limonest",
  "Champagne-au-Mont-d'Or",
  "Saint-Just-Saint-Rambert",
  "Andrézieux-Bouthéon",
]);

const ZONES: { titre: string; slugs: string[] }[] = [
  {
    titre: "Ouest Lyonnais",
    slugs: [
      "saint-cyr-au-mont-dor",
      "saint-didier-au-mont-dor",
      "ecully",
      "limonest",
      "champagne-au-mont-dor",
      "dardilly",
    ],
  },
  {
    titre: "Plaine du Forez",
    slugs: ["saint-just-saint-rambert", "andrezieux-boutheon"],
  },
];

export default function Page() {
  const secteurs = useSecteurs();
  const secteursDetails = useSecteursDetails();
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["carte-prix"] ?? {};
  const [type, setType] = useState<"maison" | "appartement">("maison");
  const [annee, setAnnee] = useState(2025);

  const data = useMemo(() => {
    return secteurs.map((s) => {
      const det = secteursDetails[s.slug];
      // `?.` sur evolution_prix aussi : le CMS peut retirer entièrement la liste.
      const evol = det?.evolution_prix?.find((e) => e.annee === annee);
      const evolPrev = det?.evolution_prix?.find((e) => e.annee === annee - 1);
      // Repli : série appartement estimée depuis la maison si elle n'est pas saisie au CMS.
      const ratio = s.prixM2Maison > 0 ? s.prixM2Appart / s.prixM2Maison : 1;
      const valeur = (e?: { prixM2: number; prix_appartement?: number }) => {
        if (!e) return undefined;
        if (type === "maison") return e.prixM2;
        return typeof e.prix_appartement === "number" && Number.isFinite(e.prix_appartement)
          ? e.prix_appartement
          : Math.round(e.prixM2 * ratio);
      };
      const prix = valeur(evol) ?? (type === "maison" ? s.prixM2Maison : s.prixM2Appart);
      const prixPrev = valeur(evolPrev) ?? prix;
      const deltaYoY = prixPrev > 0 ? ((prix - prixPrev) / prixPrev) * 100 : 0;
      // Image de la commune éditable via la Galerie photos du CMS (1re photo), sinon image d'origine.
      const image = det?.galerie?.[0] ?? s.image;
      return { ...s, image, prix, prixPrev, deltaYoY };
    });
  }, [type, annee]);

  const classement = [...data].sort((a, b) => b.prix - a.prix);
  const maxPrix = Math.max(...data.map((d) => d.prix));

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 01"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "Carte des prix immobiliers"}</h1>
      <p className="text-muted mt-4 max-w-2xl">{t.intro ?? "Prix moyens au m² par commune sur le Mont d'Or, l'Ouest lyonnais et la Plaine du Forez. Données Meilleurs Agents 2026 et DVF."}</p>

      {/* Contrôles */}
      <div className="rounded-xl flex flex-wrap gap-4 mt-10 items-center bg-navy text-ivory p-4">
        <div className="rounded-xl grid grid-cols-2 gap-1 bg-navy-soft p-1">
          {(["maison", "appartement"] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={`px-5 py-2 text-sm capitalize transition ${type === t ? "bg-gold text-navy" : "text-ivory/70 hover:text-ivory"}`}>{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-ivory/60">Année</span>
          <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))} className="bg-navy-soft border border-ivory/20 text-ivory px-3 py-2 text-sm outline-none">
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="ml-auto text-xs uppercase tracking-[0.25em] text-gold">Prix moyen au m² · {type} · {annee}</div>
      </div>

      {/* Grille bento par zone */}
      {ZONES.map((zone) => {
        const villes = zone.slugs.map((slug) => data.find((d) => d.slug === slug)).filter(Boolean) as typeof data;
        return (
          <section key={zone.titre} className="mt-10">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="font-serif text-2xl text-navy">{zone.titre}</h2>
              <div className="flex-1 border-t border-ink/10" />
              <div className="text-xs uppercase tracking-widest text-muted">{villes.length} commune{villes.length > 1 ? "s" : ""}</div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {villes.map((v) => {
                const intensity = v.prix / maxPrix;
                return (
                  <Link
                    key={v.slug}
                    href={`/secteurs/${v.slug}`}
                    className="group relative block overflow-hidden border border-ink/10 hover:border-gold transition aspect-[4/3]"
                  >
                    {/* Background image */}
                    {v.image && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${v.image})` }}
                      />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/20" />
                    {/* Gold intensity dot top right */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-ivory/70">Indice</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i < Math.ceil(intensity * 5) ? "bg-gold" : "bg-ivory/20"}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                      <div className="font-serif text-2xl">{v.nom}</div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <div className="font-serif text-3xl text-gold leading-none">{formatPrix(v.prix)}</div>
                        <div className="text-xs text-ivory/70">/m²</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${v.deltaYoY >= 0 ? "bg-gold/20 text-gold" : "bg-rose-500/20 text-rose-200"}`}>
                          {v.deltaYoY >= 0 ? "↑" : "↓"} {Math.abs(v.deltaYoY).toFixed(1)} % vs {annee - 1}
                        </span>
                        <span className="text-ivory/60 ml-auto group-hover:text-gold transition">Fiche commune →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Communes limitrophes - couverture étendue */}
      <section className="mt-16">
        <div className="flex items-baseline gap-4 mb-2">
          <h2 className="font-serif text-2xl text-navy">{t.limitrophes_titre ?? "Communes limitrophes"}</h2>
          <div className="flex-1 border-t border-ink/10" />
        </div>
        <p className="text-sm text-muted max-w-3xl mb-6">
          {t.limitrophes_intro ?? "Intervention également sur l'ensemble des communes limitrophes des zones de cœur. Prix indicatifs sur demande - fiches détaillées en cours d'enrichissement."}
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {zones
            .filter((z) => z.slug !== "saint-didier")
            .map((zone) => {
              const limitrophes = zone.limitrophes.filter((c) => !FICHES_EXISTANTES.has(c));
              if (limitrophes.length === 0) return null;
              return (
                <div key={zone.slug} className="rounded-xl bg-white border border-ink/10 p-6">
                  <div className="text-xs uppercase tracking-[0.25em] text-gold font-medium mb-3">
                    Autour de {zone.nom}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {limitrophes.map((c) => (
                      <Link
                        key={c}
                        href={`/contact?commune=${encodeURIComponent(c)}`}
                        className="px-3 py-1.5 text-xs bg-ivory-deep text-navy hover:bg-gold hover:text-navy border border-ink/10 hover:border-gold rounded-full transition"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink/5 text-xs text-muted">
                    {limitrophes.length} commune{limitrophes.length > 1 ? "s" : ""} · cliquez pour demander une estimation
                  </div>
                </div>
              );
            })}
        </div>
        <div className="rounded-xl mt-6 bg-gold/10 border-l-2 border-gold p-4 text-sm text-ink/85">
          {t.limitrophes_note ?? "Votre commune n'est pas listée ? La couverture s'étend à toute la couronne Ouest de la Métropole de Lyon et au bassin stéphanois."}{" "}
          <Link href="/contact" className="text-navy font-medium hover:text-gold underline">{t.limitrophes_note_lien ?? "Demander une estimation"}</Link>
        </div>
      </section>

      {/* Classement compact */}
      <div className="rounded-xl mt-16 bg-ivory-deep p-8">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.classement_titre ?? "Classement"} {annee} · {type}</div>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mt-6">
          {classement.map((c, i) => (
            <Link
              key={c.slug}
              href={`/secteurs/${c.slug}`}
              className="flex items-baseline gap-3 py-2 border-b border-ink/10 hover:border-gold transition group"
            >
              <span className="font-serif text-xl text-gold w-6 text-right">{i + 1}</span>
              <span className="font-serif text-base text-navy group-hover:text-gold transition flex-1">{c.nom}</span>
              <span className="font-serif text-lg text-navy">{formatPrix(c.prix)}</span>
              <span className="text-[10px] text-muted">/m²</span>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-muted leading-relaxed mt-6">
          <strong>{t.methodologie_label ?? "Méthodologie :"}</strong> {t.methodologie ?? "moyennes basées sur les données Meilleurs Agents 2026 (prix maisons pour les communes Mont d'Or, all-type pour la Plaine du Forez) et les transactions DVF. Données indicatives - chaque bien doit être évalué individuellement."}
        </p>
      </div>

      <div className="rounded-xl bg-navy text-ivory p-10 mt-10 text-center">
        <h3 className="font-serif text-3xl">{t.cta_titre ?? "Et votre bien, à quel prix ?"}</h3>
        <p className="text-ivory/70 mt-3">{t.cta_intro ?? "Une moyenne de marché ne suffit pas. Avis de valeur argumenté gratuit sous 24 - 48 h."}</p>
        <Link href="/avis-de-valeur" className="inline-block mt-6 px-7 py-4 bg-gold text-navy hover:bg-gold-soft rounded-full transition">{t.cta_label ?? "Demander mon avis de valeur"}</Link>
      </div>
    </div>
  );
}
