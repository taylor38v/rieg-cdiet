"use client";
/* Bandeau affiché quand on visite le site en mode aperçu (cookie `apercu`).
 * Rappelle qu'on voit un rendu non publié et propose de quitter l'aperçu. */
import { useEffect, useState } from "react";

export default function PreviewBanner() {
  const [on, setOn] = useState(false);
  const [path, setPath] = useState("/");

  useEffect(() => {
    setOn(document.cookie.split(";").some((c) => c.trim().startsWith("apercu=1")));
    setPath(window.location.pathname);
  }, []);

  if (!on) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999 }}
      className="bg-amber-500 text-black text-sm py-2 px-4 flex items-center justify-center gap-4 shadow-lg">
      <span><strong>Mode aperçu</strong> — vous voyez le rendu <strong>non encore publié</strong>.</span>
      <a href={`/api/admin/preview/exit/?to=${encodeURIComponent(path)}`}
        className="underline font-medium hover:no-underline whitespace-nowrap">Quitter l'aperçu</a>
    </div>
  );
}
