"use client";
import { useState } from "react";
import Link from "next/link";

type Point = { slug: string; nom: string; x: number; y: number; prix: number; actifs: number };

const points: Point[] = [
  { slug: "saint-cyr-au-mont-dor", nom: "Saint-Cyr", x: 240, y: 180, prix: 7200, actifs: 3 },
  { slug: "saint-didier-au-mont-dor", nom: "Saint-Didier", x: 310, y: 230, prix: 6800, actifs: 5 },
  { slug: "champagne-au-mont-dor", nom: "Champagne", x: 380, y: 290, prix: 5800, actifs: 2 },
  { slug: "limonest", nom: "Limonest", x: 200, y: 110, prix: 5600, actifs: 4 },
  { slug: "dardilly", nom: "Dardilly", x: 130, y: 200, prix: 5200, actifs: 6 },
  { slug: "ecully", nom: "Écully", x: 320, y: 350, prix: 5900, actifs: 3 },
];

export default function MontDorMap() {
  const [hover, setHover] = useState<Point | null>(null);

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 600 460" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 40px rgba(201,162,95,.15))" }}>
        <defs>
          <linearGradient id="ridge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9a25f" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c9a25f" stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id="dotGlow">
            <stop offset="0%" stopColor="#c9a25f" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c9a25f" stopOpacity="0" />
          </radialGradient>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#c9a25f" strokeWidth="0.4" opacity="0.25" />
          </pattern>
        </defs>

        {/* Saône river */}
        <path d="M 540 60 C 510 140, 530 220, 500 290 C 480 350, 510 410, 490 460" fill="none" stroke="#c9a25f" strokeWidth="2" strokeOpacity="0.35" strokeDasharray="4 6" />
        <text x="500" y="50" fill="#c9a25f" fontSize="11" opacity="0.6" fontStyle="italic">Saône →</text>

        {/* Mountain ridges (hand-drawn feel) */}
        <path d="M 60 250 Q 130 130, 200 90 T 360 130 T 460 200 T 540 270" fill="url(#ridge)" stroke="#c9a25f" strokeWidth="1.2" strokeOpacity="0.5" />
        <path d="M 80 320 Q 160 230, 230 200 T 380 230 T 470 310" fill="url(#ridge)" stroke="#c9a25f" strokeWidth="1" strokeOpacity="0.4" />
        <path d="M 100 380 Q 200 320, 280 300 T 410 340 T 480 400" fill="url(#ridge)" stroke="#c9a25f" strokeWidth="0.8" strokeOpacity="0.3" />

        {/* Forest hatch */}
        <path d="M 150 130 Q 220 100, 280 130 L 280 180 Q 220 200, 150 180 Z" fill="url(#hatch)" />
        <path d="M 90 280 Q 160 260, 200 290 L 200 330 Q 140 350, 90 320 Z" fill="url(#hatch)" />

        {/* Lyon indicator */}
        <circle cx="500" cy="380" r="3" fill="#c9a25f" opacity="0.5" />
        <text x="510" y="384" fill="#c9a25f" fontSize="11" opacity="0.6" fontStyle="italic">Lyon</text>

        {/* Points */}
        {points.map((p, i) => {
          const isHover = hover?.slug === p.slug;
          return (
            <Link key={p.slug} href={`/secteurs/${p.slug}`}>
              <g
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={p.x} cy={p.y} r="32" fill="url(#dotGlow)" opacity={isHover ? 1 : 0.5} />
                <circle cx={p.x} cy={p.y} r={isHover ? 9 : 6} fill="#c9a25f" stroke="#0c1e2e" strokeWidth="2" style={{ transition: "all .3s" }}>
                  <animate attributeName="r" values="6;8;6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                </circle>
                <text x={p.x} y={p.y - 18} textAnchor="middle" fill="#faf6ef" fontSize="11" fontWeight="500" style={{ letterSpacing: "0.05em" }}>
                  {p.nom.toUpperCase()}
                </text>
                {isHover && (
                  <g>
                    <rect x={p.x + 16} y={p.y - 10} width="130" height="48" fill="#0c1e2e" stroke="#c9a25f" strokeWidth="1" />
                    <text x={p.x + 24} y={p.y + 6} fill="#c9a25f" fontSize="10" style={{ letterSpacing: "0.15em" }}>PRIX/M²</text>
                    <text x={p.x + 24} y={p.y + 24} fill="#faf6ef" fontSize="14" fontWeight="600">{p.prix.toLocaleString("fr-FR")} €</text>
                    <text x={p.x + 95} y={p.y + 6} fill="#c9a25f" fontSize="10" style={{ letterSpacing: "0.15em" }}>BIENS</text>
                    <text x={p.x + 95} y={p.y + 24} fill="#faf6ef" fontSize="14" fontWeight="600">{p.actifs}</text>
                  </g>
                )}
              </g>
            </Link>
          );
        })}

        {/* Compass */}
        <g transform="translate(60, 60)">
          <circle r="18" fill="none" stroke="#c9a25f" strokeWidth="0.5" opacity="0.4" />
          <path d="M 0 -14 L 4 0 L 0 14 L -4 0 Z" fill="#c9a25f" opacity="0.5" />
          <text y="-22" textAnchor="middle" fill="#c9a25f" fontSize="10" opacity="0.6">N</text>
        </g>

        {/* Title */}
        <text x="60" y="430" fill="#c9a25f" fontSize="10" style={{ letterSpacing: "0.3em" }} opacity="0.7">CARTE - MONT D'OR & OUEST LYONNAIS</text>
        <text x="60" y="448" fill="#faf6ef" fontSize="9" opacity="0.4" fontStyle="italic">Survolez les points pour découvrir le marché local</text>
      </svg>
    </div>
  );
}
