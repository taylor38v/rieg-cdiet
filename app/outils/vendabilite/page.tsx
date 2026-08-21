"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import SliderInput from "../../components/SliderInput";
import ContactCTA from "../../components/ContactCTA";
import { useSecteurs, useSiteContent } from "../../lib/ClientData";

const etats = ["Neuf / rénové <5 ans", "Bon état", "À rafraîchir", "Travaux importants"];
const dpes = ["A", "B", "C", "D", "E", "F", "G"];
const tensions: Record<string, number> = {
  "saint-didier-au-mont-dor": 9, "saint-cyr-au-mont-dor": 9, "ecully": 8,
  "champagne-au-mont-dor": 8, "limonest": 7, "dardilly": 7,
  "saint-just-saint-rambert": 5, "andrezieux-boutheon": 5,
};

export default function Page() {
  const secteurs = useSecteurs();
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["vendabilite"] ?? {};
  const [type, setType] = useState("Maison");
  const [secteur, setSecteur] = useState("saint-didier-au-mont-dor");
  const [surface, setSurface] = useState(150);
  const [etat, setEtat] = useState("Bon état");
  const [dpe, setDpe] = useState("C");
  const [prix, setPrix] = useState(900000);

  const r = useMemo(() => {
    const s = secteurs.find((x) => x.slug === secteur)!;
    const refM2 = type === "Maison" ? s.prixM2Maison : s.prixM2Appart;
    const prixM2 = prix / surface;
    const ecartPrix = (prixM2 - refM2) / refM2;
    const ecartAbs = Math.abs(ecartPrix);

    const etatScore = { "Neuf / rénové <5 ans": 25, "Bon état": 20, "À rafraîchir": 12, "Travaux importants": 5 }[etat] ?? 15;
    const dpeScore = { A: 25, B: 23, C: 20, D: 15, E: 8, F: 3, G: 0 }[dpe] ?? 15;
    // Tampon de 3 % à pleine note, puis décroissance linéaire jusqu'à 25 % d'écart où score = 0
    const prixScore = Math.max(0, Math.round(25 * (1 - Math.max(0, ecartAbs - 0.03) / 0.22)));
    const tensionScore = (tensions[secteur] ?? 6) * 2.5;

    const total = Math.round(etatScore + dpeScore + prixScore + tensionScore);
    const delaiEstime = Math.round(s.delaiVente * (1 + Math.max(0, ecartPrix) * 2.5) * (etat === "Travaux importants" ? 1.4 : 1));

    const verdict =
      total >= 80 ? { label: "Excellente vendabilité", color: "text-gold", desc: "Votre bien réunit tous les fondamentaux d'une vente rapide. Une mise en marché soignée et une stratégie d'enchère légère sont possibles." } :
      total >= 65 ? { label: "Bonne vendabilité", color: "text-gold", desc: "Bon profil commercial. Quelques ajustements peuvent maximiser le prix net vendeur." } :
      total >= 50 ? { label: "Vendabilité correcte", color: "text-navy", desc: "Le bien se vendra, mais le prix ou le DPE pénalisent. À travailler ensemble en stratégie." } :
      { label: "Vendabilité difficile", color: "text-navy", desc: "Plusieurs freins cumulés. Une estimation et un avis stratégique sont indispensables avant toute mise en marché." };

    const diags = [
      ecartPrix > 0.05
        ? { type: "warn", txt: `Le prix au m² est ${(ecartPrix * 100).toFixed(0)} % au-dessus du marché local (${formatPrix(refM2)}/m²). Risque de délai allongé.` }
        : ecartPrix < -0.05
        ? { type: "ok", txt: `Le prix au m² est ${Math.abs(ecartPrix * 100).toFixed(0)} % sous le marché - vente rapide probable, mais négociation à la baisse possible.` }
        : { type: "ok", txt: `Le prix est aligné avec la médiane du secteur (${formatPrix(refM2)}/m²). C'est le bon positionnement.` },
      ["E", "F", "G"].includes(dpe)
        ? { type: "warn", txt: `DPE ${dpe} : la loi Climat pénalise fortement les passoires. Décote de 8 à 17 % à prévoir vs un DPE C. Audit énergétique recommandé.` }
        : ["A", "B"].includes(dpe)
        ? { type: "ok", txt: `DPE ${dpe} : argument premium, surtout sur ce secteur. À mettre en avant dès l'annonce.` }
        : { type: "ok", txt: `DPE ${dpe} : standard de marché, neutre dans la négociation.` },
      (tensions[secteur] ?? 6) >= 8
        ? { type: "ok", txt: `${s.nom} est un marché en forte tension (note ${tensions[secteur]}/10). Stock limité, demande soutenue.` }
        : { type: "warn", txt: `${s.nom} est un marché plus posé (note ${tensions[secteur] ?? 6}/10). Mise en scène irréprochable nécessaire pour sortir du lot.` },
    ];

    return { total, etatScore, dpeScore, prixScore, tensionScore, delaiEstime, refM2, prixM2, verdict, diags };
  }, [type, secteur, surface, etat, dpe, prix]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 05"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "Diagnostic indicatif de vendabilité"}</h1>
      <p className="text-muted mt-4 max-w-2xl">{t.intro ?? "En 30 secondes, mesurez les chances réelles de vendre votre bien. Diagnostic personnalisé sur prix, DPE et tension de marché."}</p>
      <div className="rounded-xl mt-6 p-4 bg-gold/10 border-l-2 border-gold max-w-3xl">
        <p className="text-sm text-ink/85 leading-relaxed">
          ⚠️ <strong>{t.avertissement_titre ?? "Score indicatif basé sur les seules données saisies."}</strong> {t.avertissement ?? "Le résultat dépend directement de la précision des informations entrées. Pour un avis fiable et argumenté, un avis de valeur officiel gratuit est réalisé sous 24 - 48 h, basé sur une visite qualitative."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 mt-12">
        <div className="space-y-6">
          <RadioGroup label="Type de bien" value={type} onChange={setType} options={["Maison", "Appartement", "Terrain"]} />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted mb-2">Secteur</div>
            <select value={secteur} onChange={(e) => setSecteur(e.target.value)} className="w-full p-4 bg-white border border-gold/40 focus:border-gold font-serif text-xl text-navy outline-none">
              {secteurs.map((s) => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
            </select>
          </div>
          <SliderInput label="Surface habitable" value={surface} onChange={setSurface} min={15} max={350} step={5} suffix="m²" />
          <RadioGroup label="État général" value={etat} onChange={setEtat} options={etats} stack />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted mb-2">Classe DPE</div>
            <div className="grid grid-cols-7 gap-1">
              {dpes.map((d) => (
                <button key={d} onClick={() => setDpe(d)} className={`p-3 font-serif text-lg ${dpe===d?"bg-navy text-ivory":"bg-white border border-ink/15 hover:border-navy"}`}>{d}</button>
              ))}
            </div>
          </div>
          <SliderInput label="Prix de mise en vente souhaité" value={prix} onChange={setPrix} min={50000} max={5000000} step={5000} suffix="€" display={formatPrix(prix)} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-navy text-ivory p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.score_titre ?? "Score"}</div>
            <div className="flex items-end gap-3 mt-2">
              <div className="font-serif text-7xl text-gold leading-none">{r.total}</div>
              <div className="text-ivory/50 text-2xl font-serif mb-2">/100</div>
            </div>
            <div className={`mt-4 font-serif text-2xl ${r.verdict.color === "text-gold" ? "text-gold" : "text-ivory"}`}>{r.verdict.label}</div>
            <p className="text-ivory/70 text-sm mt-3 leading-relaxed">{r.verdict.desc}</p>
            <div className="mt-6 pt-6 border-t border-ivory/10 flex justify-between">
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Prix au m²</div><div className="font-serif text-xl mt-1">{formatPrix(r.prixM2)}</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Médiane secteur</div><div className="font-serif text-xl mt-1">{formatPrix(r.refM2)}</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Délai estimé</div><div className="font-serif text-xl mt-1">{r.delaiEstime} j</div></div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-ink/10 p-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.decomposition_titre ?? "Décomposition du score"}</div>
            {[
              ["État du bien", r.etatScore, 25],
              ["Performance énergétique", r.dpeScore, 25],
              ["Cohérence du prix", r.prixScore, 25],
              ["Tension du marché", r.tensionScore, 25],
            ].map(([l, v, max]) => (
              <div key={l as string} className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>{l}</span>
                  <span className="font-serif text-navy">{Math.round(v as number)}/{max}</span>
                </div>
                <div className="h-1.5 bg-ink/5 mt-1.5">
                  <div className="h-full bg-gold transition-all duration-500" style={{ width: `${((v as number) / (max as number)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-ink/10 p-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.diagnostic_titre ?? "Diagnostic en 3 points"}</div>
            <div className="mt-4 space-y-3">
              {r.diags.map((d, i) => (
                <div key={i} className={`flex gap-3 p-3 ${d.type === "ok" ? "bg-gold/5 border-l-2 border-gold" : "bg-navy/5 border-l-2 border-navy"}`}>
                  <span className={`font-serif text-lg ${d.type === "ok" ? "text-gold" : "text-navy"}`}>{d.type === "ok" ? "✓" : "!"}</span>
                  <p className="text-sm leading-relaxed">{d.txt}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-ivory-deep p-5 text-xs text-muted leading-relaxed">
            <strong className="text-navy">{t.sources_titre ?? "Sources de référence :"}</strong> {t.sources_intro ?? "ce diagnostic croise les prix médians par secteur (compilation interne) avec les données publiques officielles. Pour aller plus loin :"}{" "}
            <a href="https://www.meilleursagents.com/prix-immobilier/" target="_blank" rel="noopener" className="text-navy underline hover:text-gold">Meilleurs Agents</a>
            {" · "}
            <a href="https://app.dvf.etalab.gouv.fr/" target="_blank" rel="noopener" className="text-navy underline hover:text-gold">DVF (Demandes de Valeurs Foncières)</a>.
          </div>
        </div>
      </div>

    </div>

    <ContactCTA
        titre={t.cta_titre ?? "Avis de valeur officiel ?"}
        intro={t.cta_intro ?? "Visite de votre bien et rapport complet (comparables, photos, stratégie) sous 24 - 48 h. Gratuit et sans engagement."}
    />
    </>
  );
}

function RadioGroup({ label, value, onChange, options, stack }: { label: string; value: string; onChange: (v: string) => void; options: string[]; stack?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted mb-2">{label}</div>
      <div className={stack ? "space-y-2" : "grid grid-cols-3 gap-2"}>
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={`p-3 text-sm border text-left ${value===o?"bg-navy text-ivory border-navy":"bg-white border-ink/15 hover:border-navy"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}
