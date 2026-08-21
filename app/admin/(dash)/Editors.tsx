"use client";
/* Harnais d'édition : charge une table via /api/admin/data/[table], laisse JsonEditor
 * la modifier, et la ré-enregistre. Trois variantes selon la forme du contenu. */
import { useEffect, useState, useCallback } from "react";
import JsonEditor from "./JsonEditor";

function useTable<T = any>(table: string) {
  const [data, setData] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [sauve, setSauve] = useState<"idle" | "envoi" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let vif = true;
    fetch(`/api/admin/data/${table}/`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Chargement impossible"))))
      .then((d) => { if (vif) { setData(d); setChargement(false); } })
      .catch((e) => { if (vif) { setErreur(e.message); setChargement(false); } });
    return () => { vif = false; };
  }, [table]);

  const save = useCallback(async (valeur: T) => {
    setSauve("envoi"); setMsg("");
    try {
      const r = await fetch(`/api/admin/data/${table}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valeur),
      });
      const d = await r.json();
      if (r.ok) { setSauve("ok"); setMsg("Enregistré ✔"); }
      else { setSauve("err"); setMsg(d.message || "Échec."); }
    } catch { setSauve("err"); setMsg("Erreur réseau."); }
    setTimeout(() => setSauve("idle"), 4000);
  }, [table]);

  return { data, setData, chargement, erreur, save, sauve, msg };
}

function SaveBar({ onSave, sauve, msg }: { onSave: () => void; sauve: string; msg: string }) {
  return (
    <div className="sticky bottom-0 -mx-5 md:-mx-8 mt-8 px-5 md:px-8 py-3 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center gap-4">
      <button
        onClick={onSave} disabled={sauve === "envoi"}
        className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50"
      >
        {sauve === "envoi" ? "Enregistrement…" : "Enregistrer"}
      </button>
      {msg && <span className={`text-sm ${sauve === "err" ? "text-red-600" : "text-emerald-600"}`}>{msg}</span>}
      <span className="text-xs text-slate-400 ml-auto hidden sm:block">Pensez à « Mettre le site à jour » pour publier.</span>
    </div>
  );
}

function Cadre({ titre, description, children }: { titre: string; description?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">{titre}</h1>
      {description && <p className="text-slate-500 mt-1 mb-6 max-w-2xl">{description}</p>}
      {children}
    </div>
  );
}

/* ---------- Objet entier (ex : Réglages) ---------- */
export function WholeEditor({ table, titre, description }: { table: string; titre: string; description?: string }) {
  const { data, setData, chargement, erreur, save, sauve, msg } = useTable<any>(table);
  if (chargement) return <Cadre titre={titre}><p className="text-slate-400">Chargement…</p></Cadre>;
  if (erreur) return <Cadre titre={titre}><p className="text-red-600">{erreur}</p></Cadre>;
  return (
    <Cadre titre={titre} description={description}>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <JsonEditor value={data} onChange={setData} />
      </div>
      <SaveBar onSave={() => save(data)} sauve={sauve} msg={msg} />
    </Cadre>
  );
}

/* ---------- Objet clé→entrée (ex : Pages, Communes, Zones) ---------- */
export function RecordEditor({
  table, titre, description, labelField, ordre,
}: { table: string; titre: string; description?: string; labelField?: string; ordre?: string[] }) {
  const { data, setData, chargement, erreur, save, sauve, msg } = useTable<Record<string, any>>(table);
  const [sel, setSel] = useState<string>("");

  if (chargement) return <Cadre titre={titre}><p className="text-slate-400">Chargement…</p></Cadre>;
  if (erreur || !data) return <Cadre titre={titre}><p className="text-red-600">{erreur || "Vide."}</p></Cadre>;

  const cles = ordre ? [...ordre.filter((k) => k in data), ...Object.keys(data).filter((k) => !ordre.includes(k))] : Object.keys(data);
  const courant = sel || cles[0];
  const nom = (k: string) => (labelField && data[k]?.[labelField]) || k;

  return (
    <Cadre titre={titre} description={description}>
      <div className="flex flex-wrap gap-2 mb-5">
        {cles.map((k) => (
          <button key={k} onClick={() => setSel(k)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${k === courant ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
            {nom(k)}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <JsonEditor value={data[courant]} onChange={(v) => setData({ ...data, [courant]: v })} />
      </div>
      <SaveBar onSave={() => save(data)} sauve={sauve} msg={msg} />
    </Cadre>
  );
}

/* ---------- Liste (ex : Articles) ---------- */
export function ListEditor({
  table, titre, description, labelField, gabarit,
}: { table: string; titre: string; description?: string; labelField: string; gabarit: () => any }) {
  const { data, setData, chargement, erreur, save, sauve, msg } = useTable<any[]>(table);
  const [i, setI] = useState(0);

  if (chargement) return <Cadre titre={titre}><p className="text-slate-400">Chargement…</p></Cadre>;
  if (erreur || !data) return <Cadre titre={titre}><p className="text-red-600">{erreur || "Vide."}</p></Cadre>;

  const set = (v: any) => { const c = [...data]; c[i] = v; setData(c); };
  const ajouter = () => { setData([gabarit(), ...data]); setI(0); };
  const suppr = (idx: number) => { if (!confirm("Supprimer cet élément ?")) return; setData(data.filter((_, j) => j !== idx)); setI(0); };

  return (
    <Cadre titre={titre} description={description}>
      <button onClick={ajouter} className="mb-4 text-sm px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700">+ Nouvel élément</button>
      <div className="grid md:grid-cols-[220px_1fr] gap-5 items-start">
        <div className="space-y-1">
          {data.map((it, idx) => (
            <div key={idx} className={`flex items-center rounded-lg border ${idx === i ? "border-slate-900 bg-white" : "border-slate-200 bg-white"}`}>
              <button onClick={() => setI(idx)} className="flex-1 text-left px-3 py-2 text-sm truncate">{it[labelField] || `(sans titre) #${idx + 1}`}</button>
              <button onClick={() => suppr(idx)} className="px-2 text-red-500 hover:text-red-700" title="Supprimer">✕</button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 min-w-0">
          {data[i] ? <JsonEditor value={data[i]} onChange={set} /> : <p className="text-slate-400">Sélectionnez un élément.</p>}
        </div>
      </div>
      <SaveBar onSave={() => save(data)} sauve={sauve} msg={msg} />
    </Cadre>
  );
}
