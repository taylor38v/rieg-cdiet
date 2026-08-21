"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);
    try {
      const r = await fetch("/api/admin/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) { setErreur(data.message || "Connexion refusée."); setEnvoi(false); return; }
      router.replace("/admin");
      router.refresh();
    } catch {
      setErreur("Erreur réseau. Réessayez.");
      setEnvoi(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-100 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-xl font-semibold text-slate-800">Back-office</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Espace d'administration du site.</p>

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Mot de passe</label>
        <input
          type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
        />

        {erreur && <p className="text-sm text-red-600 mt-4">{erreur}</p>}

        <button
          type="submit" disabled={envoi}
          className="w-full mt-6 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50"
        >
          {envoi ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
