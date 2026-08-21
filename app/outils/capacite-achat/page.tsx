"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import SliderInput from "../../components/SliderInput";
import DureeChoice from "../../components/DureeChoice";
import ContactCTA from "../../components/ContactCTA";
import { useSecteurs, useSiteContent } from "../../lib/ClientData";

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
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["capacite-achat"] ?? {};
  const [revenu, setRevenu] = useState(5500);
  const [apport, setApport] = useState(80000);
  const [duree, setDuree] = useState(25);
  const [taux, setTaux] = useState(3.5);
  const [type, setType] = useState<"maison" | "appartement">("maison");

  const result = useMemo(() => {
    const mensualiteMax = revenu * 0.35;
    const r = taux / 100 / 12;
    const n = duree * 12;
    const capacite = mensualiteMax * (1 - Math.pow(1 + r, -n)) / r;
    const budgetTotal = capacite + apport;
    const fraisNotaire = budgetTotal * 0.075;
    const budgetBien = budgetTotal - fraisNotaire;

    const communes = secteurs.map((s) => {
      const prixM2 = type === "maison" ? s.prixM2Maison : s.prixM2Appart;
      const surface = budgetBien / prixM2;
      return { ...s, surface, prixM2, accessible: surface >= 60 };
    });

    return { mensualite: mensualiteMax, capacite, budgetTotal, budgetBien, fraisNotaire, communes };
  }, [revenu, apport, duree, taux, type]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 02"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "Combien puis-je acheter ?"}</h1>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 mt-12">
        <div className="space-y-8">
          <SliderInput
            label="Revenus nets mensuels du foyer"
            value={revenu}
            onChange={setRevenu}
            min={2000}
            max={20000}
            step={100}
            suffix="€/mois"
          />
          <SliderInput
            label="Apport personnel"
            value={apport}
            onChange={setApport}
            min={0}
            max={200000}
            step={1000}
            suffix="€"
          />
          <DureeChoice value={duree} onChange={setDuree} />
          <SliderInput
            label="Taux d'intérêt (hors assurance)"
            value={taux}
            onChange={setTaux}
            min={1}
            max={5}
            step={0.05}
            suffix="%"
          />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted mb-3">Type de bien recherché</div>
            <div className="grid grid-cols-2 gap-2">
              {(["maison", "appartement"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`p-4 border capitalize ${type===t?"bg-navy text-ivory border-navy":"border-ink/15 hover:border-navy"}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-navy text-ivory p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.resultat_titre ?? "Votre budget total"}</div>
            <div className="font-serif text-6xl text-gold mt-2">{formatPrix(result.budgetTotal)}</div>
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-ivory/10 text-sm">
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Capacité d'emprunt</div><div className="font-serif text-2xl mt-1">{formatPrix(result.capacite)}</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Apport</div><div className="font-serif text-2xl mt-1">{formatPrix(apport)}</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Mensualité max</div><div className="font-serif text-2xl mt-1">{formatPrix(result.mensualite)}</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Frais de notaire (~7,5%)</div><div className="font-serif text-2xl mt-1">{formatPrix(result.fraisNotaire)}</div></div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-ink/10 p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.representation_surtitre ?? "Ce que cela représente"}</div>
            <h3 className="font-serif text-2xl mt-2">{t.representation_titre ?? "Surface accessible par commune"}</h3>
            <div className="mt-6 space-y-6">
              {ZONES.map((zone) => {
                const villes = zone.slugs
                  .map((slug) => result.communes.find((c) => c.slug === slug))
                  .filter(Boolean) as typeof result.communes;
                if (villes.length === 0) return null;
                return (
                  <div key={zone.titre}>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-gold font-medium pb-2 border-b border-gold/30 mb-3">{zone.titre}</div>
                    <div className="space-y-3">
                      {villes.map((c) => {
                        const pct = Math.min(100, (c.surface / 250) * 100);
                        return (
                          <div key={c.slug}>
                            <div className="flex justify-between text-sm">
                              <span className="text-navy">{c.nom}</span>
                              <span className={c.accessible ? "font-medium" : "text-muted"}>{Math.round(c.surface)} m²</span>
                            </div>
                            <div className="h-1.5 bg-ink/5 mt-1 relative overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted mt-6 leading-relaxed">
              {t.note ?? "Calcul indicatif sur la base d'un taux d'endettement à 35%, frais de notaire 7,5%, prix moyens de marché. Soumis à l'accord d'un établissement bancaire."}
            </p>
          </div>
        </div>
      </div>

    </div>

    <ContactCTA
      titre={t.cta_titre ?? "Affinons votre projet ensemble"}
      intro={t.cta_intro ?? "Mise en relation avec un courtier partenaire pour optimiser votre plan de financement, puis sélection de biens correspondant à votre capacité."}
    />
    </>
  );
}
