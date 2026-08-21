"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import SliderInput from "../../components/SliderInput";
import ContactCTA from "../../components/ContactCTA";
import { useSecteurs, useSecteursDetails, useSiteContent } from "../../lib/ClientData";

// Taux annuels recalibrés mai 2026 - après correction marché 2024 + stabilisation 2025
// Maison vs Appartement : maisons un peu plus tendues sur Mont d'Or, apparts plus stables
const tendances: Record<string, { evolMaison: number; evolAppart: number; volatilite: number; demande: string }> = {
  "saint-cyr-au-mont-dor":    { evolMaison: 2.2, evolAppart: 1.8, volatilite: 1.2, demande: "Très forte" },
  "saint-didier-au-mont-dor": { evolMaison: 2.0, evolAppart: 1.6, volatilite: 1.0, demande: "Très forte" },
  "ecully":                   { evolMaison: 1.5, evolAppart: 1.2, volatilite: 1.4, demande: "Forte" },
  "champagne-au-mont-dor":    { evolMaison: 2.5, evolAppart: 2.0, volatilite: 1.8, demande: "Forte (effet métro)" },
  "limonest":                 { evolMaison: 1.8, evolAppart: 1.4, volatilite: 1.3, demande: "Forte" },
  "dardilly":                 { evolMaison: 1.2, evolAppart: 0.9, volatilite: 1.3, demande: "Stable" },
  "saint-just-saint-rambert": { evolMaison: 1.0, evolAppart: 0.8, volatilite: 1.5, demande: "Stable" },
  "andrezieux-boutheon":      { evolMaison: 0.8, evolAppart: 0.6, volatilite: 1.6, demande: "Stable" },
};

export default function Page() {
  const secteurs = useSecteurs();
  const secteursDetails = useSecteursDetails();
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["projection"] ?? {};
  const [valeur, setValeur] = useState(750000);
  const [commune, setCommune] = useState("saint-didier-au-mont-dor");
  const [horizon, setHorizon] = useState(5);
  const [typeBien, setTypeBien] = useState<"maison" | "appartement">("maison");

  const data = useMemo(() => {
    const t = tendances[commune];
    const tauxAnnuel = typeBien === "maison" ? t.evolMaison : t.evolAppart;
    const taux = tauxAnnuel / 100;

    // Historique 5 ans passés (depuis les données réelles secteursDetails)
    const det = secteursDetails[commune];
    const histo = det?.evolution_prix ?? [];
    const histo5 = histo.slice(-5); // 5 dernières années (2021-2025)

    // Reconstruire la valeur passée du bien sur la base de l'évolution % de la commune
    const annees: number[] = [];
    const passe: number[] = [];
    if (histo5.length > 0) {
      const ref2025 = histo5[histo5.length - 1].prixM2;
      for (const e of histo5) {
        const ratio = e.prixM2 / ref2025;
        annees.push(-(2025 - e.annee));
        passe.push(Math.round(valeur * ratio));
      }
    }

    // Projection future
    const optimiste: number[] = [];
    const central: number[] = [];
    const prudent: number[] = [];
    for (let y = 0; y <= horizon; y++) {
      annees.push(y);
      optimiste.push(valeur * Math.pow(1 + taux + t.volatilite / 100, y));
      central.push(valeur * Math.pow(1 + taux, y));
      prudent.push(valeur * Math.pow(1 + taux - t.volatilite / 100, y));
    }

    const fullCentral = [...passe.slice(0, -1), ...central];
    const fullOptimiste = [...passe.slice(0, -1), ...optimiste];
    const fullPrudent = [...passe.slice(0, -1), ...prudent];

    return {
      annees, fullCentral, fullOptimiste, fullPrudent,
      central, optimiste, prudent, passe,
      tauxAnnuel, t,
      plusValueCentrale: central[horizon] - valeur,
    };
  }, [valeur, commune, horizon, typeBien]);

  const max = Math.max(...data.fullOptimiste);
  const min = Math.min(...data.fullPrudent);
  const range = max - min || 1;

  const sect = secteurs.find((s) => s.slug === commune)!;
  const passeStart = data.passe[0];
  const passeYears = data.annees.filter((y) => y < 0).length;

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 06"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre_prefix ?? "Combien vaudra mon bien dans"} {horizon} {t.titre_suffix ?? "ans ?"}</h1>
      <div className="rounded-xl mt-6 p-4 bg-gold/10 border-l-2 border-gold">
        <p className="text-sm text-ink/85 leading-relaxed">
          ⚠️ {t.avertissement ?? "Projection indicative. Basée sur les tendances 2020-2025 réelles par commune et type de bien. Ne préjuge pas de l'évolution future, qui dépend du contexte économique, réglementaire (loi Climat, fiscalité) et local. Pour une analyse fiable, une étude personnalisée intégrant les spécificités de votre bien est nécessaire."}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 mt-12">
        <div className="space-y-6">
          <div className="rounded-xl p-5 bg-gold/5 border border-gold/30">
            <SliderInput
              label="Valeur actuelle estimée"
              value={valeur}
              onChange={setValeur}
              min={150000}
              max={3000000}
              step={10000}
              suffix="€"
              display={formatPrix(valeur)}
            />
          </div>

          <div className="rounded-xl p-5 bg-gold/5 border border-gold/30">
            <SliderInput
              label="Horizon de projection"
              value={horizon}
              onChange={setHorizon}
              min={1}
              max={10}
              step={1}
              suffix="ans"
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted mb-2">Type de bien</div>
            <div className="grid grid-cols-2 gap-2">
              {(["maison", "appartement"] as const).map((t) => (
                <button key={t} onClick={() => setTypeBien(t)} className={`p-4 border capitalize ${typeBien===t?"bg-navy text-ivory border-navy":"border-ink/15 hover:border-navy"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted mb-2">Commune</div>
            <select value={commune} onChange={(e) => setCommune(e.target.value)} className="rounded-xl w-full p-4 bg-white border border-ink/15 font-serif text-lg text-navy outline-none">
              {secteurs.map((s) => <option key={s.slug} value={s.slug}>{s.nom}</option>)}
            </select>
          </div>

          <div className="p-6 bg-ivory-deep">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Marché {sect.nom}</div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div><div className="text-muted text-xs">Évolution annuelle estimée ({typeBien})</div><div className="font-serif text-2xl text-navy mt-1">{data.tauxAnnuel > 0 ? "+" : ""}{data.tauxAnnuel.toFixed(1)} %</div></div>
              <div><div className="text-muted text-xs">Demande</div><div className="font-serif text-base text-navy mt-1">{data.t.demande}</div></div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-xl bg-navy text-ivory p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.resultat_titre ?? "Projection scénario central"}</div>
            <div className="flex items-baseline gap-4 mt-2">
              <div className="font-serif text-5xl text-gold">{formatPrix(data.central[horizon])}</div>
              <div className="text-ivory/60 text-sm">soit <span className="text-gold">{data.plusValueCentrale >= 0 ? "+" : ""}{formatPrix(data.plusValueCentrale)}</span> de variation</div>
            </div>
            <div className="text-xs text-ivory/50 mt-2">Soit {data.plusValueCentrale >= 0 ? "+" : ""}{((data.plusValueCentrale / valeur) * 100).toFixed(1)} % sur {horizon} ans</div>
          </div>

          <div className="rounded-xl bg-white border border-ink/10 p-6 mt-4">
            <svg viewBox="0 0 600 280" className="w-full h-auto">
              <defs>
                <linearGradient id="centralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a25f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c9a25f" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 0.25, 0.5, 0.75, 1].map((p) => (
                <line key={p} x1="60" y1={20 + p * 220} x2="580" y2={20 + p * 220} stroke="#1a1a1a" strokeOpacity="0.05" />
              ))}
              {[0.25, 0.5, 0.75, 1].map((p) => (
                <text key={p} x="55" y={24 + p * 220} fontSize="9" fill="#6b6355" textAnchor="end">
                  {formatPrix(max - p * range)}
                </text>
              ))}
              {data.annees.map((y, i) => {
                if (i % Math.ceil(data.annees.length / 8) !== 0 && i !== data.annees.length - 1) return null;
                return (
                  <text key={i} x={60 + (i / (data.annees.length - 1)) * 520} y="270" fontSize="9" fill="#6b6355" textAnchor="middle">
                    {y < 0 ? `${y}a` : y === 0 ? "Auj." : `+${y}a`}
                  </text>
                );
              })}

              {/* Zone de transition passé/futur */}
              <line x1={60 + (passeYears / (data.annees.length - 1)) * 520} y1="20" x2={60 + (passeYears / (data.annees.length - 1)) * 520} y2="240" stroke="#c9a25f" strokeOpacity="0.3" strokeDasharray="3 3" />

              {/* Aire prudent/optimiste sur le futur */}
              <path
                d={data.fullOptimiste.slice(passeYears).map((v, i) => `${i === 0 ? "M" : "L"} ${60 + ((passeYears + i) / (data.annees.length - 1)) * 520} ${20 + ((max - v) / range) * 220}`).join(" ") +
                   " " + data.fullPrudent.slice(passeYears).reverse().map((v, i) => `L ${60 + ((data.annees.length - 1 - i) / (data.annees.length - 1)) * 520} ${20 + ((max - v) / range) * 220}`).join(" ") + " Z"}
                fill="url(#centralGrad)"
              />

              {/* Historique (passé) */}
              <polyline fill="none" stroke="#0c1e2e" strokeWidth="2"
                points={data.passe.map((v, i) => `${60 + (i / (data.annees.length - 1)) * 520},${20 + ((max - v) / range) * 220}`).join(" ")} />

              {/* Central futur */}
              <polyline fill="none" stroke="#c9a25f" strokeWidth="2.5"
                points={data.central.map((v, i) => `${60 + ((passeYears + i) / (data.annees.length - 1)) * 520},${20 + ((max - v) / range) * 220}`).join(" ")} />

              {/* Points marqués */}
              {data.passe.map((v, i) => (
                <circle key={`p${i}`} cx={60 + (i / (data.annees.length - 1)) * 520} cy={20 + ((max - v) / range) * 220} r="2.5" fill="#0c1e2e" />
              ))}
              {data.central.map((v, i) => (
                <circle key={`f${i}`} cx={60 + ((passeYears + i) / (data.annees.length - 1)) * 520} cy={20 + ((max - v) / range) * 220} r="3" fill="#c9a25f" stroke="#0c1e2e" strokeWidth="1.5" />
              ))}
            </svg>
            <div className="flex flex-wrap gap-4 text-xs text-muted mt-2 justify-center">
              <span><span className="inline-block w-4 h-0.5 bg-navy align-middle mr-1" /> Historique 5 ans</span>
              <span><span className="inline-block w-4 h-0.5 bg-gold align-middle mr-1" /> Projection centrale</span>
              <span><span className="inline-block w-4 h-2 bg-gold/30 align-middle mr-1" /> Fourchette prudent/optimiste</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card label="Prudent" v={data.prudent[horizon]} />
            <Card label="Central" v={data.central[horizon]} highlight />
            <Card label="Optimiste" v={data.optimiste[horizon]} />
          </div>

          <p className="text-xs text-muted mt-4 leading-relaxed">
            <strong>{t.methodologie_label ?? "Méthodologie :"}</strong> {t.methodologie ?? "historique 2020-2025 basé sur les chiffres Meilleurs Agents et DVF (Demandes de Valeurs Foncières). Projection forward basée sur les tendances long terme par commune et type de bien, intégrant la correction de 2024 et la stabilisation 2025. Ne constitue pas un engagement de valorisation."}
          </p>
        </div>
      </div>

    </div>

    <ContactCTA
        titre={t.cta_titre ?? "Analyse personnalisée de votre bien ?"}
        intro={t.cta_intro ?? "Une analyse approfondie croise la projection avec votre quartier précis, le DPE, l'état et les comparables récents pour une vraie estimation."}
    />
    </>
  );
}

function Card({ label, v, highlight }: { label: string; v: number; highlight?: boolean }) {
  return (
    <div className={`p-4 border ${highlight ? "border-gold bg-gold/5" : "border-ink/10 bg-white"}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`font-serif text-xl mt-1 ${highlight ? "text-gold" : "text-navy"}`}>{formatPrix(v)}</div>
    </div>
  );
}
