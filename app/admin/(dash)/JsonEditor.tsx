"use client";
/* Éditeur récursif générique : rend n'importe quelle valeur de contenu (texte, nombre,
 * booléen, liste, objet imbriqué) en champs éditables. Détecte les champs média (image /
 * vidéo) pour proposer un envoi de fichier. Contrôlé : chaque niveau remonte sa valeur
 * mise à jour au parent. Suffit à couvrir tout le contenu du site sans coder chaque champ. */
import { useState } from "react";

const humaniser = (k: string) =>
  k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const estMedia = (k: string) =>
  /image|photo|logo|video|galerie|thumb|hero|banniere|visuel|couverture|illustration|fond/i.test(k);

const estLong = (k: string, v: string) =>
  v.length > 60 || /intro|texte|description|desc|body|message|note|contenu|paragraphe|bio|resume|chapo/i.test(k);

/* ---- Champ média : URL + envoi de fichier + aperçu ---- */
function MediaField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [envoi, setEnvoi] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file: File) {
    setEnvoi(true); setErr("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch("/api/upload/", { method: "POST", body: fd });
      const d = await r.json();
      if (d.ok) onChange(d.url); else setErr(d.message || "Échec de l'envoi.");
    } catch { setErr("Erreur réseau."); }
    setEnvoi(false);
  }

  const estVideo = /\.mp4($|\?)/i.test(value);
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-1">
        <input
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… ou /api/media/…"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800 font-mono"
        />
        <label className="inline-flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
          <span className="px-2.5 py-1 bg-slate-200 rounded hover:bg-slate-300">{envoi ? "Envoi…" : "Choisir un fichier"}</span>
          <input type="file" accept="image/*,video/mp4" hidden disabled={envoi}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {err && <span className="text-xs text-red-600 ml-2">{err}</span>}
      </div>
      {value && !estVideo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0" />
      )}
      {value && estVideo && <div className="w-20 h-20 grid place-items-center text-2xl bg-slate-100 rounded-lg shrink-0">🎬</div>}
    </div>
  );
}

/* ---- Nœud récursif ---- */
export default function JsonEditor({
  value, onChange, fieldKey = "", depth = 0,
}: {
  value: any; onChange: (v: any) => void; fieldKey?: string; depth?: number;
}) {
  // Chaînes
  if (typeof value === "string") {
    if (estMedia(fieldKey)) return <MediaField value={value} onChange={onChange} />;
    if (estLong(fieldKey, value)) {
      return (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(10, Math.max(2, Math.ceil(value.length / 70)))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800 leading-relaxed"
        />
      );
    }
    return (
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800"
      />
    );
  }

  // Nombres
  if (typeof value === "number") {
    return (
      <input
        type="number" value={value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800"
      />
    );
  }

  // Booléens
  if (typeof value === "boolean") {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
        {value ? "Activé" : "Désactivé"}
      </label>
    );
  }

  // Tableaux
  if (Array.isArray(value)) {
    const gabarit = () => {
      const modele = value[0];
      if (modele && typeof modele === "object" && !Array.isArray(modele)) {
        return Object.fromEntries(Object.keys(modele).map((k) => [k, typeof modele[k] === "number" ? 0 : typeof modele[k] === "boolean" ? false : Array.isArray(modele[k]) ? [] : ""]));
      }
      return typeof modele === "number" ? 0 : "";
    };
    const set = (i: number, v: any) => { const c = [...value]; c[i] = v; onChange(c); };
    const suppr = (i: number) => onChange(value.filter((_, j) => j !== i));
    const bouger = (i: number, d: number) => {
      const j = i + d; if (j < 0 || j >= value.length) return;
      const c = [...value]; [c[i], c[j]] = [c[j], c[i]]; onChange(c);
    };
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => bouger(i, -1)} className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100" title="Monter">↑</button>
                <button type="button" onClick={() => bouger(i, 1)} className="px-2 py-0.5 text-xs bg-white border border-slate-200 rounded hover:bg-slate-100" title="Descendre">↓</button>
                <button type="button" onClick={() => suppr(i)} className="px-2 py-0.5 text-xs bg-white border border-red-200 text-red-600 rounded hover:bg-red-50" title="Supprimer">✕</button>
              </div>
            </div>
            <JsonEditor value={item} onChange={(v) => set(i, v)} fieldKey={fieldKey} depth={depth + 1} />
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, gabarit()])} className="text-sm px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
          + Ajouter
        </button>
      </div>
    );
  }

  // Objets
  if (value && typeof value === "object") {
    const set = (k: string, v: any) => onChange({ ...value, [k]: v });
    return (
      <div className={depth > 0 ? "space-y-4 pl-4 border-l-2 border-slate-200" : "space-y-5"}>
        {Object.keys(value).map((k) => (
          <FieldRow key={k} label={humaniser(k)} nested={value[k] !== null && typeof value[k] === "object"}>
            <JsonEditor value={value[k]} onChange={(v) => set(k, v)} fieldKey={k} depth={depth + 1} />
          </FieldRow>
        ))}
      </div>
    );
  }

  // null / undefined → champ texte simple
  return (
    <input
      value={value ?? ""} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800"
    />
  );
}

function FieldRow({ label, nested, children }: { label: string; nested: boolean; children: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(true);
  if (nested) {
    return (
      <div>
        <button type="button" onClick={() => setOuvert(!ouvert)} className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
          <span className="text-xs text-slate-400">{ouvert ? "▾" : "▸"}</span> {label}
        </button>
        {ouvert && children}
      </div>
    );
  }
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
