"use client";
import { useState } from "react";

export default function Page() {
  const [mdp, setMdp] = useState("");
  const [mdp2, setMdp2] = useState("");
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mdp !== mdp2) { setEtat("err"); setMsg("Les deux mots de passe ne correspondent pas."); return; }
    if (mdp.length < 8) { setEtat("err"); setMsg("Au moins 8 caractères."); return; }
    setEtat("envoi"); setMsg("");
    try {
      const r = await fetch("/api/admin/password/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: mdp }),
      });
      const d = await r.json();
      if (r.ok) { setEtat("ok"); setMsg("Mot de passe modifié ✔"); setMdp(""); setMdp2(""); }
      else { setEtat("err"); setMsg(d.message || "Échec."); }
    } catch { setEtat("err"); setMsg("Erreur réseau."); }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Mon mot de passe</h1>
      <p className="text-slate-500 mt-1 mb-6">Choisissez un nouveau mot de passe pour accéder à cet espace.</p>
      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-5 max-w-sm space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1">Nouveau mot de passe</span>
          <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-600 mb-1">Confirmer</span>
          <input type="password" value={mdp2} onChange={(e) => setMdp2(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800" />
        </label>
        {msg && <p className={`text-sm ${etat === "err" ? "text-red-600" : "text-emerald-600"}`}>{msg}</p>}
        <button type="submit" disabled={etat === "envoi"}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50">
          {etat === "envoi" ? "Modification…" : "Modifier"}
        </button>
      </form>
    </div>
  );
}
