"use client";
import { useState, useMemo } from "react";
import { formatPrix } from "../lib/format";

type Props = {
  evolutionPrix: { annee: number; prixM2: number; prix_appartement?: number }[];
  prixM2Maison: number;
  prixM2Appart: number;
};

export default function MarketEvolution({ evolutionPrix, prixM2Maison, prixM2Appart }: Props) {
  const [type, setType] = useState<"maison" | "appartement">("maison");

  // Repli : si la série "appartement" n'est pas saisie dans le CMS, on l'estime
  // à partir de la série "maison" (ratio des prix actuels de la commune).
  const ratio = prixM2Maison > 0 ? prixM2Appart / prixM2Maison : 1;

  const series = useMemo(() => {
    return evolutionPrix.map((e) => {
      if (type === "maison") return { annee: e.annee, prixM2: e.prixM2 };
      const appart =
        typeof e.prix_appartement === "number" && Number.isFinite(e.prix_appartement)
          ? e.prix_appartement
          : Math.round(e.prixM2 * ratio);
      return { annee: e.annee, prixM2: appart };
    });
  }, [evolutionPrix, type, ratio]);

  const evolMin = series.length ? Math.min(...series.map((e) => e.prixM2)) : 0;
  const evolMax = series.length ? Math.max(...series.map((e) => e.prixM2)) : 0;
  const evolRange = evolMax - evolMin || 1;
  const evolPct = evolMin > 0 ? ((evolMax - evolMin) / evolMin) * 100 : 0;

  return (
    <div className="rounded-xl bg-navy-soft p-4 sm:p-8 mt-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="text-xs uppercase tracking-widest text-gold">Prix au m² · {type}</div>
        <div className="inline-flex bg-navy p-1 rounded-full border border-ivory/15">
          {(["maison", "appartement"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-5 py-2 text-sm capitalize rounded-full transition ${
                type === t ? "bg-gold text-navy" : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* viewBox 560×320, largeur cappée sur desktop (max-w-2xl) pour éviter
          que les labels grossissent trop ; plot décalé pour que le label du
          haut tienne dans le cadre */}
      <svg viewBox="0 0 560 320" className="w-full h-auto max-w-2xl mx-auto block">
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1="60" y1={44 + p * 210} x2="528" y2={44 + p * 210} stroke="#ffffff" strokeOpacity="0.08" />
        ))}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <text key={p} x="52" y={48 + p * 210} fontSize="12" fill="#c9a25f" textAnchor="end" opacity="0.7">
            {formatPrix(evolMax - p * evolRange).replace(" €", "")}
          </text>
        ))}
        <polyline
          fill="none"
          stroke="#c9a25f"
          strokeWidth="2.5"
          points={series.map((e, i) => `${72 + (i / (series.length - 1)) * 416},${44 + ((evolMax - e.prixM2) / evolRange) * 210}`).join(" ")}
        />
        {series.map((e, i) => (
          <g key={i}>
            <circle
              cx={72 + (i / (series.length - 1)) * 416}
              cy={44 + ((evolMax - e.prixM2) / evolRange) * 210}
              r="5"
              fill="#c9a25f"
              stroke="#061b2c"
              strokeWidth="2"
            />
            <text x={72 + (i / (series.length - 1)) * 416} y="296" fontSize="13" fill="#faf6ef" textAnchor="middle" opacity="0.7">
              {e.annee}
            </text>
            <text
              x={72 + (i / (series.length - 1)) * 416}
              y={44 + ((evolMax - e.prixM2) / evolRange) * 210 - 13}
              fontSize="15"
              fill="#c9a25f"
              textAnchor="middle"
              fontWeight="700"
            >
              {(e.prixM2 / 1000).toFixed(1)}k
            </text>
          </g>
        ))}
      </svg>
      <div className="text-sm text-ivory/70 mt-4 text-center">
        Évolution sur 5 ans : <span className="text-gold font-medium">+{evolPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}
