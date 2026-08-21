"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";
import HeroBackground from "../components/HeroBackground";
import ContactButtons from "../components/ContactButtons";
import ContactCTA from "../components/ContactCTA";
import CityMap from "../components/CityMap";
import { useSiteContent } from "../lib/ClientData";

const inline = (s: string) => marked.parseInline(s) as string;

const types = ["Maison", "Appartement", "Villa", "Terrain", "Immeuble", "Local commercial"];
const etats = ["Neuf", "Rénové récemment", "Bon état", "À rafraîchir", "Travaux importants"];
const delais = ["Dès que possible", "Dans 3 mois", "Dans 6 mois", "Dans un an", "Je me renseigne"];

export default function Page() {
  const site = useSiteContent();
  const av = site["avis-de-valeur"];
  const [showForm, setShowForm] = useState(false);

  const startForm = () => {
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  if (showForm) return <Wizard onCancel={() => setShowForm(false)} />;

  return (
    <>
      <section className="relative text-ivory py-32 overflow-hidden bg-navy">
        <HeroBackground video={av.hero.video} overlay={0.65} />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{av.hero.surtitre}</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.05] max-w-4xl">{av.hero.titre}</h1>
          <p className="text-ivory/80 text-lg md:text-xl mt-8 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(av.hero.intro1) }} />
          <p className="text-ivory/80 text-lg md:text-xl mt-4 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(av.hero.intro2) }} />
          {av.hero.intro_complement && <p className="text-ivory/80 text-lg md:text-xl mt-4 max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(av.hero.intro_complement) }} />}
          <div className="flex flex-wrap gap-4 mt-10">
            <button onClick={startForm} className="px-7 py-4 bg-gold text-navy font-medium hover:bg-gold-soft rounded-full">{av.hero.cta_primary_label}</button>
            <ContactButtons smsBody="Bonjour Romain, je souhaite un avis de valeur de mon bien. " mailSubject="Demande d'avis de valeur" />
          </div>
          <div className="mt-4 text-xs text-ivory/60">{av.hero.mention}</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium" dangerouslySetInnerHTML={{ __html: inline(av.forces.surtitre) }} />
        <h2 className="font-serif text-3xl md:text-4xl mt-3" dangerouslySetInnerHTML={{ __html: inline(av.forces.titre) }} />
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {av.forces.items.map((it, i) => (
            <div
              key={it.titre}
              className="group relative shine-hover rounded-xl p-7 bg-white border border-ink/10 hover:border-gold transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/20"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/20 transition" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-soft text-navy font-serif text-2xl font-bold shadow-lg group-hover:scale-110 transition">
                  0{i + 1}
                </div>
                <div className="font-serif text-2xl text-navy mt-4 font-semibold group-hover:text-gold transition" dangerouslySetInnerHTML={{ __html: inline(it.titre) }} />
                <p className="text-muted mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(it.desc) }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy text-ivory py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium" dangerouslySetInnerHTML={{ __html: inline(av.etapes.surtitre) }} />
          <h2 className="font-serif text-3xl md:text-4xl mt-3" dangerouslySetInnerHTML={{ __html: inline(av.etapes.titre) }} />

          <div className="mt-16 relative">
            <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-gold via-gold/30 to-gold/0 hidden md:block" />
            <div className="space-y-6">
              {av.etapes.items.map((e, i) => (
                <div
                  key={e.num}
                  className="group relative rounded-xl shine-hover bg-navy-soft border border-ivory/10 hover:border-gold p-6 md:pl-20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/10"
                >
                  <div className="flex items-start gap-4 md:block">
                    <div className="shrink-0 md:absolute md:left-2 md:top-6 w-12 h-12 rounded-full bg-gold text-navy font-serif text-xl font-bold grid place-items-center shadow-lg group-hover:scale-110 transition">
                      {e.num}
                    </div>
                    <div>
                      <div className="font-serif text-2xl font-semibold group-hover:text-gold transition" dangerouslySetInnerHTML={{ __html: inline(e.titre) }} />
                      <div className="text-ivory/75 mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: inline(e.desc) }} />
                    </div>
                  </div>
                  {i < av.etapes.items.length - 1 && (
                    <div className="absolute right-6 bottom-6 text-gold/30 group-hover:text-gold transition text-2xl">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy text-ivory py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{av.carte_section.surtitre}</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-3">{av.carte_section.titre}</h2>
          <p className="text-ivory/70 mt-4 max-w-2xl">{av.carte_section.intro}</p>
          <div className="mt-10">
            <CityMap height={520} includeLimitrophes={true} />
          </div>
        </div>
      </section>

      <section className="bg-ivory-deep py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-navy">{av.cta_final.titre}</h2>
          <p className="text-muted mt-4">{av.cta_final.intro}</p>
          <button onClick={startForm} className="inline-block mt-8 px-8 py-4 bg-navy text-ivory rounded-full hover:bg-gold hover:text-navy transition rounded-full">
            {av.cta_final.cta_label}
          </button>
        </div>
      </section>

    </>
  );
}

function Wizard({ onCancel }: { onCancel: () => void }) {
  const site = useSiteContent();
  const av = site["avis-de-valeur"];
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ type: "", ville: "", adresse: "", surface: "", pieces: "", etat: "", delai: "", nom: "", email: "", tel: "" });
  const set = (k: string, v: string) => setData({ ...data, [k]: v });

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const submit = async () => {
    try {
      await fetch("/api/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "avis-de-valeur", ...data, telephone: data.tel }),
      });
    } catch {}
    setStep(6);
  };

  const steps = [
    { title: "Quel type de bien ?", sub: "Étape 1 / 6",
      body: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {types.map((t) => (
            <button key={t} onClick={() => { set("type", t); setStep(1); }} className={`p-6 border text-left transition ${data.type===t?"border-navy bg-navy text-ivory":"border-ink/15 hover:border-navy"}`}>
              <div className="font-serif text-xl">{t}</div>
            </button>
          ))}
        </div>
      )},
    { title: "Où se situe votre bien ?", sub: "Étape 2 / 6",
      body: (
        <div className="space-y-4">
          <Field label="Ville" value={data.ville} onChange={(v) => set("ville", v)} placeholder="Saint-Didier-au-Mont-d'Or" />
          <Field label="Adresse (confidentielle)" value={data.adresse} onChange={(v) => set("adresse", v)} placeholder="12 rue de la République" />
        </div>
      )},
    { title: "Caractéristiques du bien", sub: "Étape 3 / 6",
      body: (
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Surface (m²)" type="number" value={data.surface} onChange={(v) => set("surface", v)} placeholder="150" />
          <Field label="Nombre de pièces" type="number" value={data.pieces} onChange={(v) => set("pieces", v)} placeholder="5" />
        </div>
      )},
    { title: "Quel est l'état du bien ?", sub: "Étape 4 / 6",
      body: (
        <div className="space-y-3">
          {etats.map((e) => (
            <button key={e} onClick={() => { set("etat", e); setStep(4); }} className={`w-full p-4 border text-left transition ${data.etat===e?"border-navy bg-navy text-ivory":"border-ink/15 hover:border-navy"}`}>{e}</button>
          ))}
        </div>
      )},
    { title: "À quelle échéance souhaitez-vous vendre ?", sub: "Étape 5 / 6",
      body: (
        <div className="space-y-3">
          {delais.map((d) => (
            <button key={d} onClick={() => { set("delai", d); setStep(5); }} className={`w-full p-4 border text-left transition ${data.delai===d?"border-navy bg-navy text-ivory":"border-ink/15 hover:border-navy"}`}>{d}</button>
          ))}
        </div>
      )},
    { title: "Où recevoir votre avis de valeur ?", sub: "Étape 6 / 6",
      body: (
        <div className="space-y-4">
          <Field label="Nom & prénom" value={data.nom} onChange={(v) => set("nom", v)} />
          <Field label="Email" type="email" value={data.email} onChange={(v) => set("email", v)} />
          <Field label="Téléphone" type="tel" value={data.tel} onChange={(v) => set("tel", v)} />
          <p className="text-xs text-muted">{av.confidentialite}</p>
        </div>
      )},
  ];

  if (step === 6) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{av.wizard_merci.surtitre}</div>
        <h1 className="font-serif text-5xl mt-4">{av.wizard_merci.titre_prefix} {data.nom || ""} 🌿</h1>
        <p className="text-muted mt-6 leading-relaxed">{av.wizard_merci.intro}</p>
        <Link href={av.wizard_merci.cta_href} className="inline-block mt-10 px-7 py-4 bg-navy text-ivory rounded-full">{av.wizard_merci.cta_label}</Link>
      </div>
    );
  }

  const current = steps[step];
  const canContinue =
    (step === 0 && data.type) ||
    (step === 1 && data.ville) ||
    (step === 2 && data.surface && data.pieces) ||
    (step === 3 && data.etat) ||
    (step === 4 && data.delai) ||
    (step === 5 && data.nom && data.email && data.tel);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <button onClick={onCancel} className="text-sm text-muted hover:text-navy mb-6 inline-flex items-center gap-1">← Retour à la page Avis de valeur</button>
      <div className="flex gap-1 mt-4 mb-12">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 ${i<=step?"bg-gold":"bg-ink/10"}`} />
        ))}
      </div>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{current.sub}</div>
      <h2 className="font-serif text-4xl md:text-5xl mt-3">{current.title}</h2>
      <div className="mt-10">{current.body}</div>
      <div className="flex justify-between mt-10">
        <button onClick={() => setStep(Math.max(0, step - 1))} className={`text-sm text-muted hover:text-navy ${step===0?"invisible":""}`}>← Précédent</button>
        {step !== 0 && step !== 3 && step !== 4 && (
          <button onClick={() => canContinue && (step === 5 ? submit() : setStep(step + 1))} disabled={!canContinue} className={`px-7 py-3 ${canContinue?"bg-navy text-ivory hover:bg-gold hover:text-navy":"bg-ink/10 text-muted cursor-not-allowed"}`}>
            {step === 5 ? "Recevoir mon avis de valeur" : "Continuer"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-xl mt-2 w-full px-4 py-3 bg-white border border-ink/15 focus:border-navy outline-none" />
    </label>
  );
}
