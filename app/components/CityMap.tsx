"use client";
import { useEffect, useRef, useState } from "react";
import communesGeo from "../lib/communes-geo.json";
import { formatPrix } from "../lib/format";
import { useSecteurs, useSettings } from "../lib/ClientData";

type Tier = "primaire" | "secondaire" | "limitrophe";

const ZONES: Record<string, { tier: Tier; zone: "mont-dor" | "forez" }> = {
  // Mont d'Or / Ouest lyonnais - zone primaire (doré)
  "ecully":                   { tier: "primaire", zone: "mont-dor" },
  "dardilly":                 { tier: "primaire", zone: "mont-dor" },
  "limonest":                 { tier: "primaire", zone: "mont-dor" },
  "champagne-au-mont-dor":    { tier: "primaire", zone: "mont-dor" },
  "saint-cyr-au-mont-dor":    { tier: "primaire", zone: "mont-dor" },
  "saint-didier-au-mont-dor": { tier: "primaire", zone: "mont-dor" },
  // Forez - zone secondaire (cuivre)
  "saint-just-saint-rambert": { tier: "primaire", zone: "forez" },
  "andrezieux-boutheon":      { tier: "primaire", zone: "forez" },
  // Limitrophes Mont d'Or / Ouest lyonnais
  "tassin-la-demi-lune":      { tier: "limitrophe", zone: "mont-dor" },
  "charbonnieres-les-bains":  { tier: "limitrophe", zone: "mont-dor" },
  "la-tour-de-salvagny":      { tier: "limitrophe", zone: "mont-dor" },
  "lissieu":                  { tier: "limitrophe", zone: "mont-dor" },
  "marcy-letoile":            { tier: "limitrophe", zone: "mont-dor" },
  "couzon-au-mont-dor":       { tier: "limitrophe", zone: "mont-dor" },
  "saint-romain-au-mont-dor": { tier: "limitrophe", zone: "mont-dor" },
  "albigny-sur-saone":        { tier: "limitrophe", zone: "mont-dor" },
  "curis-au-mont-dor":        { tier: "limitrophe", zone: "mont-dor" },
  "poleymieux-au-mont-dor":   { tier: "limitrophe", zone: "mont-dor" },
  "caluire-et-cuire":         { tier: "limitrophe", zone: "mont-dor" },
  "collonges-au-mont-dor":    { tier: "limitrophe", zone: "mont-dor" },
  "chasselay":                { tier: "limitrophe", zone: "mont-dor" },
  "marcilly-d-azergues":      { tier: "limitrophe", zone: "mont-dor" },
  "chazay-d-azergues":        { tier: "limitrophe", zone: "mont-dor" },
  "craponne":                 { tier: "limitrophe", zone: "mont-dor" },
  "francheville":             { tier: "limitrophe", zone: "mont-dor" },
  "civrieux-d-azergues":      { tier: "limitrophe", zone: "mont-dor" },
  "lozanne":                  { tier: "limitrophe", zone: "mont-dor" },
  "dommartin":                { tier: "limitrophe", zone: "mont-dor" },
  "lyon":                     { tier: "limitrophe", zone: "mont-dor" },
  "fontaines-sur-saone":      { tier: "limitrophe", zone: "mont-dor" },
  "sainte-foy-les-lyon":      { tier: "limitrophe", zone: "mont-dor" },
  "villeurbanne":             { tier: "limitrophe", zone: "mont-dor" },
  "saint-genis-les-ollieres": { tier: "limitrophe", zone: "mont-dor" },
  // Limitrophes Plaine du Forez
  "bonson":                   { tier: "limitrophe", zone: "forez" },
  "sury-le-comtal":           { tier: "limitrophe", zone: "forez" },
  "saint-marcellin-en-forez": { tier: "limitrophe", zone: "forez" },
  "veauche":                  { tier: "limitrophe", zone: "forez" },
  "saint-cyprien":            { tier: "limitrophe", zone: "forez" },
  "chambles":                 { tier: "limitrophe", zone: "forez" },
  "veauchette":               { tier: "limitrophe", zone: "forez" },
  "unieux":                   { tier: "limitrophe", zone: "forez" },
  "la-fouillouse":            { tier: "limitrophe", zone: "forez" },
  "saint-romain-le-puy":      { tier: "limitrophe", zone: "forez" },
  "roche-la-moliere":         { tier: "limitrophe", zone: "forez" },
  "firminy":                  { tier: "limitrophe", zone: "forez" },
  "villars":                  { tier: "limitrophe", zone: "forez" },
  "saint-priest-en-jarez":    { tier: "limitrophe", zone: "forez" },
  "l-etrat":                  { tier: "limitrophe", zone: "forez" },
  "la-tour-en-jarez":         { tier: "limitrophe", zone: "forez" },
  "saint-heand":              { tier: "limitrophe", zone: "forez" },
  "saint-bonnet-les-oules":   { tier: "limitrophe", zone: "forez" },
  "saint-galmier":            { tier: "limitrophe", zone: "forez" },
  "saint-etienne":            { tier: "limitrophe", zone: "forez" },
  "chamboeuf":                { tier: "limitrophe", zone: "forez" },
};

const STYLE = {
  "mont-dor-primaire":  { color: "#c9a25f", fillColor: "#c9a25f", fillOpacity: 0.35, weight: 2 },
  "mont-dor-limitrophe":{ color: "#c9a25f", fillColor: "#c9a25f", fillOpacity: 0.10, weight: 1, dashArray: "4 4" },
  "forez-primaire":     { color: "#5b8aa0", fillColor: "#5b8aa0", fillOpacity: 0.35, weight: 2 },
  "forez-limitrophe":   { color: "#5b8aa0", fillColor: "#5b8aa0", fillOpacity: 0.10, weight: 1, dashArray: "4 4" },
};

type Props = {
  slugs?: string[];
  height?: number;
  showLegend?: boolean;
  includeLimitrophes?: boolean;
  zoneFilter?: "mont-dor" | "forez" | "all";
};

export default function CityMap({
  slugs,
  height = 480,
  showLegend = true,
  includeLimitrophes = true,
  zoneFilter = "all",
}: Props) {
  const settings = useSettings();
  const secteurs = useSecteurs();
  // Libellés de la carte, éditables via le CMS (Réglages globaux → Carte)
  const CARTE = {
    legendeTitre: settings.carte?.legende_titre ?? "Mes secteurs d'intervention",
    labelMontDor: settings.carte?.label_mont_dor ?? "Mont d'Or / Ouest lyonnais",
    labelForez: settings.carte?.label_forez ?? "Plaine du Forez",
    labelLimitrophes: settings.carte?.label_limitrophes ?? "Communes limitrophes (mobilité)",
    aide: settings.carte?.aide ?? "Clic = fiche commune · Molette = zoom",
  };
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ destroy: () => void } | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const visibleSlugs = (() => {
    if (slugs) return slugs;
    return Object.keys(ZONES).filter((s) => {
      const z = ZONES[s];
      if (zoneFilter !== "all" && z.zone !== zoneFilter) return false;
      if (!includeLimitrophes && z.tier === "limitrophe") return false;
      return true;
    });
  })();

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let destroyed = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (destroyed || !ref.current) return;

      type GeoEntry = { geometry: GeoJSON.Geometry; nom: string; center: [number, number] };
      const geo = communesGeo as unknown as Record<string, GeoEntry>;
      const features = visibleSlugs.map((s) => ({ slug: s, ...geo[s] })).filter((f) => f.geometry);
      if (!features.length) return;

      const map = L.map(ref.current, {
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
        minZoom: 7,
        maxZoom: 16,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);

      features.forEach((f) => {
        const z = ZONES[f.slug];
        if (!z) return;
        const styleKey = `${z.zone}-${z.tier === "primaire" ? "primaire" : "limitrophe"}` as keyof typeof STYLE;
        const baseStyle = STYLE[styleKey];
        const sec = secteurs.find((s) => s.slug === f.slug);

        const layer = L.geoJSON(f.geometry as GeoJSON.GeoJsonObject, { style: baseStyle as L.PathOptions }).addTo(layerGroup);

        const zoneLabel = z.zone === "mont-dor" ? CARTE.labelMontDor : CARTE.labelForez;
        const tierLabel = z.tier === "primaire" ? "" : "Commune limitrophe";
        const tooltip = `<div style="font-family:Montserrat,sans-serif;padding:4px 6px;line-height:1.3;min-width:180px">
          <div style="color:${z.zone === "mont-dor" ? "#c9a25f" : "#5b8aa0"};font-size:9px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600">${zoneLabel}</div>
          <div style="font-weight:700;color:#061b2c;font-size:15px;margin-top:3px">${f.nom}</div>
          ${tierLabel ? `<div style="color:#888;font-size:10px;font-style:italic;margin-top:2px">${tierLabel}</div>` : ""}
          ${sec ? `<div style="color:#6b6355;font-size:11px;margin-top:5px"><strong>${formatPrix(sec.prixM2Maison)}/m²</strong> · ${sec.delaiVente}j</div>` : ""}
          ${sec ? `<div style="color:#c9a25f;font-size:10px;margin-top:5px;font-weight:600">▶ Cliquer pour la fiche</div>` : `<div style="color:#888;font-size:10px;margin-top:5px;font-style:italic">Couverture sur demande</div>`}
        </div>`;
        layer.bindTooltip(tooltip, { sticky: true, direction: "top" });

        layer.on("mouseover", () => {
          layer.setStyle({ fillOpacity: Math.min(0.65, baseStyle.fillOpacity + 0.3), weight: baseStyle.weight + 1 });
          setHoveredSlug(f.slug);
        });
        layer.on("mouseout", () => {
          layer.setStyle(baseStyle as L.PathOptions);
          setHoveredSlug(null);
        });
        if (sec) layer.on("click", () => { window.location.href = `/secteurs/${f.slug}/`; });
      });

      const all = L.featureGroup(layerGroup.getLayers() as L.FeatureGroup[]);
      try { map.fitBounds(all.getBounds(), { padding: [40, 40] }); } catch {}

      mapRef.current = { destroy: () => map.remove() };
    })();

    return () => { destroyed = true; mapRef.current?.destroy(); mapRef.current = null; };
  }, [visibleSlugs.join(",")]);

  const hovered = hoveredSlug ? (communesGeo as Record<string, { nom: string }>)[hoveredSlug] : null;
  const hoveredZone = hoveredSlug ? ZONES[hoveredSlug] : null;

  return (
    <div className="relative">
      <div ref={ref} style={{ height: `${height}px`, background: "#0f2c44" }} className="border border-gold/30 rounded-xl overflow-hidden" />

      {showLegend && (
        <div className="absolute top-4 left-4 z-[1000] bg-navy/95 text-ivory px-4 py-3 max-w-[300px] rounded-xl">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">{CARTE.legendeTitre}</div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 inline-block" style={{ background: "rgba(201,162,95,0.55)", border: "2px solid #c9a25f" }} />
              <span className="text-ivory">{CARTE.labelMontDor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 inline-block" style={{ background: "rgba(91,138,160,0.55)", border: "2px solid #5b8aa0" }} />
              <span className="text-ivory">{CARTE.labelForez}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 inline-block" style={{ background: "rgba(201,162,95,0.15)", border: "1px dashed #c9a25f" }} />
              <span className="text-ivory/75 italic">{CARTE.labelLimitrophes}</span>
            </div>
          </div>
          <div className="text-[10px] text-ivory/60 mt-2 pt-2 border-t border-ivory/15">{CARTE.aide}</div>
        </div>
      )}

      {hovered && hoveredZone && (
        <div
          className="absolute bottom-4 right-4 z-[1000] px-4 py-2 pointer-events-none rounded-xl"
          style={{ background: hoveredZone.zone === "mont-dor" ? "#c9a25f" : "#5b8aa0", color: "#061b2c" }}
        >
          <div className="text-[10px] uppercase tracking-widest opacity-80">{hoveredZone.zone === "mont-dor" ? "Mont d'Or" : "Forez"}{hoveredZone.tier === "limitrophe" ? " · limitrophe" : ""}</div>
          <div className="font-serif text-lg leading-tight font-semibold">{hovered.nom}</div>
        </div>
      )}
    </div>
  );
}
