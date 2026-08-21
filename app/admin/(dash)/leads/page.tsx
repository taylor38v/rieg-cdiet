"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [leads, setLeads] = useState<any[] | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetch("/api/admin/data/leads/")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Chargement impossible"))))
      .then((d) => setLeads(Array.isArray(d) ? d : []))
      .catch((e) => setErreur(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Demandes reçues</h1>
      <p className="text-slate-500 mt-1 mb-6">Les messages envoyés via les formulaires du site (avis de valeur, contact…).</p>

      {erreur && <p className="text-red-600">{erreur}</p>}
      {!leads && !erreur && <p className="text-slate-400">Chargement…</p>}
      {leads && leads.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          Aucune demande pour le moment.
        </div>
      )}

      <div className="space-y-3">
        {leads?.map((l, i) => (
          <div key={l.id || i} className="bg-white rounded-xl border border-slate-200 p-4">
            {l.created_at && <div className="text-xs text-slate-400 mb-2">{new Date(l.created_at).toLocaleString("fr-FR")}</div>}
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {Object.entries(l).filter(([k]) => k !== "id" && k !== "created_at").map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-slate-400 shrink-0">{k} :</dt>
                  <dd className="text-slate-700 break-words">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
