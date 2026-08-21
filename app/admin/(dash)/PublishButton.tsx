"use client";
import { useState } from "react";

export default function PublishButton() {
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function publier() {
    setEtat("envoi"); setMsg("");
    try {
      const r = await fetch("/api/publish/", { method: "POST" });
      const data = await r.json();
      if (r.ok) { setEtat("ok"); setMsg(data.message || "En ligne ✔"); }
      else { setEtat("err"); setMsg(data.message || "Échec."); }
    } catch {
      setEtat("err"); setMsg("Erreur réseau.");
    }
    setTimeout(() => setEtat("idle"), 4000);
  }

  return (
    <div>
      <button
        onClick={publier} disabled={etat === "envoi"}
        className="w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-60"
      >
        {etat === "envoi" ? "Publication…" : "Mettre le site à jour"}
      </button>
      {msg && <p className={`text-xs mt-2 px-1 ${etat === "err" ? "text-red-300" : "text-emerald-300"}`}>{msg}</p>}
    </div>
  );
}
