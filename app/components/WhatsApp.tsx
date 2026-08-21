"use client";
import { useState, useEffect } from "react";
import { useSettings } from "../lib/ClientData";

export default function WhatsApp() {
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const wa = settings.whatsapp.replace(/\D/g, "");

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir la fiche contact"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[60] w-14 h-14 sm:w-24 sm:h-24 transition-all hover:scale-110"
        style={{ animation: "wapulse 2.4s infinite", borderRadius: "9999px", boxShadow: "0 10px 30px rgba(201,162,95,.4), 0 0 0 0 rgba(201,162,95,.7)" }}
      >
        <span className="block w-full h-full rounded-full overflow-hidden border-2 border-gold bg-navy">
          <img
            src="/photos/romain-pro.jpg"
            alt={settings.nom}
            className="no-round w-full h-full object-cover"
            style={{ objectPosition: "center 25%" }}
          />
        </span>
        <span className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-10 sm:h-10 grid place-items-center bg-gold rounded-full border-2 sm:border-[3px] border-ivory shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="#061b2c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-3.5 h-3.5 sm:w-[22px] sm:h-[22px]">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </span>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-navy/60 backdrop-blur-sm"
          />
          <div className="fixed bottom-6 left-6 right-6 sm:right-auto sm:bottom-24 z-[71] sm:max-w-[420px] bg-ivory border-2 border-gold shadow-2xl overflow-hidden rounded-2xl">
            <div className="relative bg-navy text-ivory px-6 pt-6 pb-5">
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute top-3 right-4 text-ivory/70 hover:text-gold text-2xl leading-none">×</button>
              <div className="flex items-center gap-4">
                <img src="/photos/romain-pro.jpg" alt={settings.nom} className="w-20 h-20 rounded-full object-cover border-2 border-gold shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-gold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" /> {settings.whatsapp_widget?.statut_en_ligne ?? "En ligne"}
                  </div>
                  <div className="font-serif text-2xl text-ivory mt-1">{settings.nom}</div>
                  <div className="text-xs text-ivory/70">{settings.titre}</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-ink/85 leading-relaxed italic text-justify">{settings.bio_courte}</p>

              <div className="mt-5 space-y-2">
                <a
                  href={`sms:${settings.whatsapp}?body=Bonjour%20${encodeURIComponent(settings.nom.split(" ")[0])}%20!`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 bg-gold text-navy rounded-full hover:bg-gold-soft transition"
                >
                  <span className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span className="font-medium text-sm">{settings.whatsapp_widget?.cta_sms_label ?? "Envoyer un SMS direct"}</span>
                  </span>
                  <span className="text-navy/70">→</span>
                </a>

                <a
                  href={`tel:${settings.telephone_lien}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 bg-navy text-ivory hover:bg-gold hover:text-navy transition rounded"
                >
                  <span className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="font-medium text-sm">{settings.telephone}</span>
                  </span>
                  <span className="opacity-70">→</span>
                </a>

                <a
                  href="/contact"
                  className="flex items-center justify-between gap-3 px-4 py-3.5 border border-navy text-navy hover:bg-navy hover:text-ivory transition rounded"
                >
                  <span className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span className="font-medium text-sm">{settings.whatsapp_widget?.cta_contact_label ?? "Contactez-moi (formulaire)"}</span>
                  </span>
                  <span className="opacity-70">→</span>
                </a>
              </div>

              <div className="mt-5 pt-5 border-t border-ink/10 text-[11px] text-muted text-center">
                {settings.whatsapp_widget?.reponse_label ?? "Réponse moyenne :"} <span className="text-navy font-medium">{settings.whatsapp_widget?.reponse_valeur ?? "8 minutes"}</span> · {settings.whatsapp_widget?.reponse_disponibilite ?? "Disponible 7j/7"}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes wapulse {
          0% { box-shadow: 0 10px 30px rgba(201,162,95,.4), 0 0 0 0 rgba(201,162,95,.55); }
          70% { box-shadow: 0 10px 30px rgba(201,162,95,.4), 0 0 0 22px rgba(201,162,95,0); }
          100% { box-shadow: 0 10px 30px rgba(201,162,95,.4), 0 0 0 0 rgba(201,162,95,0); }
        }
      `}</style>
    </>
  );
}
