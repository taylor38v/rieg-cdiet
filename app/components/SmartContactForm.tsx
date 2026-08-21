"use client";
import { useState, useMemo } from "react";

type Intent = "vendre" | "acheter" | "estimation" | "investir" | "louer" | "rejoindre" | "autre";

type State = {
  intent?: Intent;
  typeBien?: string;
  ville?: string;
  budget?: string;
  budgetMin?: number;
  budgetMax?: number;
  surface?: string;
  delai?: string;
  motivation?: string;
  financement?: string;
  pieces?: string;
  prixSouhaite?: string;
  experience?: string;
  exclusif?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  tel?: string;
  message?: string;
  rappelQuand?: string;
};

const intents: { v: Intent; emoji: string; titre: string; sub: string }[] = [
  { v: "vendre",     emoji: "🏷️", titre: "Vendre un bien",      sub: "Maison, appartement, terrain, immeuble" },
  { v: "estimation", emoji: "📐", titre: "Estimer mon bien",    sub: "Avis de valeur argumenté sous 24 - 48h" },
  { v: "acheter",    emoji: "🔎", titre: "Acheter un bien",     sub: "Résidence principale ou secondaire" },
  { v: "investir",   emoji: "📈", titre: "Investir dans le locatif", sub: "Recherche de rentabilité" },
  { v: "louer",      emoji: "🔑", titre: "Louer / faire louer", sub: "Mise en location et gestion" },
  { v: "rejoindre",  emoji: "🤝", titre: "Rejoindre l'équipe iad", sub: "Reconversion ou nouveau défi pro" },
  { v: "autre",      emoji: "💬", titre: "Autre demande",       sub: "Une question, un conseil…" },
];

export default function SmartContactForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<State>({});
  const set = (patch: Partial<State>) => setData((d) => ({ ...d, ...patch }));
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  type Step = { key: keyof State | "qualif" | "coords" | "final"; render: () => React.ReactNode; canSkip?: boolean };
  const flow = useMemo<Step[]>(() => {
    const base: Step[] = [];
    if (!data.intent) return [];

    if (data.intent === "vendre" || data.intent === "estimation") {
      base.push(
        choiceStep("typeBien", "Quel type de bien ?", ["Maison", "Appartement", "Villa / propriété", "Terrain", "Immeuble", "Local commercial"], data, set, () => setStep((s) => s + 1)),
        textStep("ville", "Dans quelle commune ?", "Saint-Didier, Écully, Limonest…", data, set),
        textStep("surface", "Surface habitable approximative ?", "Ex : 150 m²", data, set, "number", "m²"),
        choiceStep("delai", "À quelle échéance souhaitez-vous vendre ?", ["Maintenant - j'ai pris ma décision", "Dans 3 mois", "Dans 6 mois", "Dans un an", "Je me renseigne, sans urgence"], data, set, () => setStep((s) => s + 1)),
      );
      if (data.intent === "vendre") {
        base.push(choiceStep("exclusif", "Êtes-vous déjà en mandat avec une agence ?", ["Non, libre", "Oui, mandat simple", "Oui, mandat exclusif", "Je préfère en parler"], data, set, () => setStep((s) => s + 1)));
      }
      base.push(textareaStep("motivation", "En une phrase, quelle est votre motivation principale ?", "Mutation pro, agrandissement de la famille, succession, projet d'investissement, séparation… (facultatif)", data, set, true));
    }

    if (data.intent === "acheter" || data.intent === "investir") {
      base.push(
        choiceStep("typeBien", data.intent === "investir" ? "Quel type d'investissement ?" : "Que recherchez-vous ?", data.intent === "investir" ? ["Studio / T1", "T2 / T3", "T4 et +", "Immeuble de rapport", "Local commercial", "Pas encore décidé"] : ["Maison", "Appartement", "Villa / propriété", "Terrain à bâtir", "Pas encore décidé"], data, set, () => setStep((s) => s + 1)),
        textStep("ville", data.intent === "investir" ? "Quelle zone de prospection ?" : "Quelle commune visez-vous ?", "Saint-Didier, Écully, Lyon Ouest…", data, set),
        choiceStep("budget", "Votre budget global ?", ["< 300 000 €", "300 000 - 600 000 €", "600 000 - 1 M€", "1 - 1,5 M€", "1,5 - 2,5 M€", "> 2,5 M€", "Je me renseigne"], data, set, () => setStep((s) => s + 1)),
        choiceStep("financement", "Où en êtes-vous du financement ?", ["Cash / sans prêt", "Accord de principe banque ✓", "Étude en cours avec courtier", "Pas encore commencé", "Besoin d'aide pour le financement"], data, set, () => setStep((s) => s + 1)),
        choiceStep("delai", "À quel horizon souhaitez-vous concrétiser ?", ["J'achète si je trouve LE bien maintenant", "Dans 3 mois", "Dans 6 mois", "Dans un an", "Je commence à regarder"], data, set, () => setStep((s) => s + 1)),
      );
    }

    if (data.intent === "louer") {
      base.push(
        choiceStep("typeBien", "Que souhaitez-vous faire ?", ["Mettre mon bien en location", "Confier la gestion locative", "Trouver un locataire seulement", "Trouver un bien à louer"], data, set, () => setStep((s) => s + 1)),
        textStep("ville", "Dans quelle commune ?", "Ville…", data, set),
      );
    }

    if (data.intent === "rejoindre") {
      base.push(
        choiceStep("experience", "Quel est votre profil ?", ["Déjà conseiller immobilier", "Reconversion (autre métier)", "Première expérience pro", "Cumul activité / temps partiel"], data, set, () => setStep((s) => s + 1)),
        textareaStep("motivation", "Pourquoi iad et pourquoi maintenant ?", "Quelques mots sur votre projet…", data, set, true),
      );
    }

    if (data.intent === "autre") {
      base.push(textareaStep("message", "Décrivez-nous votre demande", "Une question, un projet, un conseil…", data, set));
    }

    base.push({
      key: "coords",
      render: () => (
        <div>
          <Question num={base.length} sub="Vos coordonnées · réponse en 24 h max">Comment vous joindre ?</Question>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <Input label="Prénom" value={data.prenom} onChange={(v) => set({ prenom: v })} required />
            <Input label="Nom" value={data.nom} onChange={(v) => set({ nom: v })} />
          </div>
          <div className="mt-4">
            <Input label="Email" type="email" value={data.email} onChange={(v) => set({ email: v })} required placeholder="prenom@exemple.fr" />
          </div>
          <div className="mt-4">
            <Input label="Téléphone (mobile de préférence)" type="tel" value={data.tel} onChange={(v) => set({ tel: v })} required placeholder="06 ··· ··· ···" />
          </div>
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-muted mb-3">Quand préférez-vous être recontacté ?</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["Dès que possible", "Aujourd'hui", "Cette semaine", "Soir / week-end"].map((q) => (
                <button key={q} onClick={() => set({ rappelQuand: q })} className={`p-3 text-sm border ${data.rappelQuand === q ? "bg-navy text-ivory border-navy" : "bg-white border-ink/15 hover:border-navy"}`}>{q}</button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-[11px] text-muted leading-relaxed">
            Vos coordonnées sont strictement confidentielles. Romain est le seul à les recevoir, jamais transmises à un tiers ni utilisées pour du démarchage commercial.
          </div>
        </div>
      ),
    });
    return base;
  }, [data]);

  const totalSteps = data.intent ? flow.length + 1 : 1;
  const currentIdx = data.intent ? step + 1 : 0;
  const progress = ((currentIdx) / totalSteps) * 100;

  const submit = async () => {
    setSubmitting(true);
    const payload = {
      source: "contact",
      ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== "")),
      _resume: resumeText(data),
    };
    try {
      await fetch("/api/lead/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch {}
    setSubmitting(false);
    setSent(true);
  };

  if (sent) return <SentScreen data={data} />;

  if (!data.intent) {
    return (
      <Wrapper progress={0}>
        <Question num={0} sub="Première question · 30 secondes au total">Avant tout - quel est votre besoin ?</Question>
        <div className="mt-8 grid md:grid-cols-2 gap-3">
          {intents.map((i) => (
            <button key={i.v} onClick={() => { set({ intent: i.v }); setStep(0); }} className="rounded-xl group flex items-start gap-4 p-5 bg-white border border-ink/15 hover:border-navy hover:bg-ivory-deep text-left transition">
              <span className="text-3xl mt-0.5">{i.emoji}</span>
              <span>
                <span className="block font-serif text-xl text-navy group-hover:text-gold transition">{i.titre}</span>
                <span className="block text-sm text-muted mt-1">{i.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </Wrapper>
    );
  }

  const isCoords = step === flow.length - 1;
  const canContinue = isCoords ? data.prenom && data.email && data.tel : true;

  return (
    <Wrapper progress={progress}>
      {flow[step]?.render()}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={() => (step === 0 ? set({ intent: undefined }) : setStep(step - 1))}
          className="text-sm text-muted hover:text-navy"
        >
          ← {step === 0 ? "Changer de besoin" : "Précédent"}
        </button>
        {(isCoords || flow[step]?.key === "motivation" || flow[step]?.key === "message" || flow[step]?.key === "ville" || flow[step]?.key === "surface") && (
          <button
            onClick={isCoords ? submit : () => setStep(step + 1)}
            disabled={!canContinue || submitting}
            className={`px-7 py-3.5 transition ${canContinue && !submitting ? "bg-navy text-ivory hover:bg-navy-soft" : "bg-ink/10 text-muted cursor-not-allowed"}`}
          >
            {submitting ? "Envoi…" : isCoords ? "Envoyer ma demande" : "Continuer"}
          </button>
        )}
      </div>
    </Wrapper>
  );
}

function Wrapper({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <div className="bg-ivory-deep border border-ink/10">
      <div className="h-1 bg-ink/5">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="p-8 md:p-12">{children}</div>
    </div>
  );
}

function Question({ num, sub, children }: { num: number; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">
        <span className="font-serif text-lg leading-none">{String(num + 1).padStart(2, "0")}</span>
        <span>·</span>
        <span className="text-muted">{sub}</span>
      </div>
      <h2 className="font-serif text-4xl md:text-5xl text-navy mt-3 leading-tight">{children}</h2>
    </div>
  );
}

function choiceStep(key: keyof State, q: string, options: string[], data: State, set: (p: Partial<State>) => void, advance: () => void) {
  return {
    key,
    render: () => (
      <div>
        <Question num={1} sub="Choix unique">{q}</Question>
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {options.map((o) => (
            <button key={o} onClick={() => { set({ [key]: o } as Partial<State>); setTimeout(advance, 150); }} className={`p-4 border text-left transition ${(data as Record<string, string>)[key as string] === o ? "bg-navy text-ivory border-navy" : "bg-white border-ink/15 hover:border-navy"}`}>{o}</button>
          ))}
        </div>
      </div>
    ),
  };
}

function textStep(key: keyof State, q: string, ph: string, data: State, set: (p: Partial<State>) => void, type: string = "text", suffix?: string) {
  return {
    key,
    render: () => (
      <div>
        <Question num={1} sub="Texte court">{q}</Question>
        <div className="mt-8 flex items-baseline gap-3">
          <input
            type={type}
            value={(data as Record<string, string>)[key as string] || ""}
            onChange={(e) => set({ [key]: e.target.value } as Partial<State>)}
            placeholder={ph}
            className="rounded-xl flex-1 p-4 bg-white border border-ink/15 focus:border-navy outline-none font-serif text-2xl text-navy"
            autoFocus
          />
          {suffix && <span className="text-muted text-lg">{suffix}</span>}
        </div>
      </div>
    ),
  };
}

function textareaStep(key: keyof State, q: string, ph: string, data: State, set: (p: Partial<State>) => void, optional?: boolean) {
  return {
    key,
    render: () => (
      <div>
        <Question num={1} sub={optional ? "Facultatif - ça aide toujours" : "Texte libre"}>{q}</Question>
        <textarea
          rows={5}
          value={(data as Record<string, string>)[key as string] || ""}
          onChange={(e) => set({ [key]: e.target.value } as Partial<State>)}
          placeholder={ph}
          className="rounded-xl mt-8 w-full p-4 bg-white border border-ink/15 focus:border-navy outline-none resize-none"
        />
      </div>
    ),
  };
}

function Input({ label, value, onChange, type = "text", required, placeholder }: { label: string; value: string | undefined; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted">{label}{required && " *"}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-xl mt-2 w-full px-4 py-3 bg-white border border-ink/15 focus:border-navy outline-none" />
    </label>
  );
}

function resumeText(d: State): string {
  const lines: string[] = [];
  lines.push(`Intention : ${d.intent}`);
  if (d.typeBien) lines.push(`Type : ${d.typeBien}`);
  if (d.ville) lines.push(`Commune : ${d.ville}`);
  if (d.surface) lines.push(`Surface : ${d.surface} m²`);
  if (d.budget) lines.push(`Budget : ${d.budget}`);
  if (d.financement) lines.push(`Financement : ${d.financement}`);
  if (d.delai) lines.push(`Échéance : ${d.delai}`);
  if (d.exclusif) lines.push(`Mandat actuel : ${d.exclusif}`);
  if (d.experience) lines.push(`Expérience : ${d.experience}`);
  if (d.motivation) lines.push(`Motivation : ${d.motivation}`);
  if (d.message) lines.push(`Message : ${d.message}`);
  if (d.rappelQuand) lines.push(`Rappel souhaité : ${d.rappelQuand}`);
  return lines.join(" | ");
}

function SentScreen({ data }: { data: State }) {
  const isUrgent = data.delai?.toLowerCase().includes("maintenant") || data.delai?.toLowerCase().includes("possible") || data.rappelQuand?.includes("Aujourd'hui") || data.rappelQuand?.includes("Dès que");
  const intentLabel = intents.find((i) => i.v === data.intent)?.titre.toLowerCase() ?? "votre projet";

  const promesse = (() => {
    if (data.intent === "vendre") return ["Étude de votre marché local et comparables récents", "Premier avis de valeur indicatif sous 24 - 48h", "Proposition d'une visite qualitative gratuite si vous le souhaitez"];
    if (data.intent === "estimation") return ["Analyse comparative avec 5 transactions récentes proches", "Avis de valeur argumenté écrit sous 24 - 48h", "Visite sur place si vous voulez affiner"];
    if (data.intent === "acheter" || data.intent === "investir") return ["Sélection des biens disponibles correspondant à vos critères", "Accès aux biens off-market iad (avant publication)", "Mise en relation courtier si besoin de financement"];
    if (data.intent === "louer") return ["Avis de valeur locative avec loyers comparables", "Présentation des options de gestion (full / mise en location seule)", "Devis transparent par retour"];
    if (data.intent === "rejoindre") return ["Présentation détaillée de l'offre iad et de la rémunération", "Échange honnête sur ce qui marche et ce qui est dur", "Mise en relation avec le manager local pour aller plus loin"];
    return ["Réponse personnelle de Romain", "Proposition d'un échange si pertinent", "Mise à disposition de la documentation utile"];
  })();

  return (
    <div className="rounded-xl bg-navy text-ivory p-8 md:p-12">
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Demande reçue ✓</div>
      <h2 className="font-serif text-3xl md:text-4xl mt-4">Merci {data.prenom}.</h2>
      <p className="text-ivory/80 mt-4 leading-relaxed">
        Votre demande concernant <strong className="text-gold">{intentLabel}</strong>{data.ville ? <> à <strong className="text-gold">{data.ville}</strong></> : null} est bien arrivée. Voici concrètement ce qui se prépare :
      </p>

      <div className="mt-6 space-y-3">
        {promesse.map((p, i) => (
          <div key={i} className="flex gap-3 p-3 bg-navy-soft">
            <span className="text-gold">✓</span>
            <span className="text-sm">{p}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 border-l-2 border-gold bg-gold/5">
        <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Engagement de réponse</div>
        <div className="font-serif text-2xl mt-2">
          {isUrgent ? "Vous êtes recontacté dans les 4 prochaines heures." : "Vous recevez une réponse personnelle sous 24 h."}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-ivory/10">
        <div className="text-xs uppercase tracking-widest text-gold mb-4">Vous voulez accélérer ?</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <a href="tel:+33679571473" className="p-4 bg-gold text-navy hover:bg-gold-soft text-center text-sm rounded-full">📞 06 79 57 14 73</a>
          <a href={`sms:+33679571473?body=${encodeURIComponent(`Bonjour Romain, je viens de remplir le formulaire pour ${intentLabel}.`)}`} target="_blank" rel="noopener" className="p-4 bg-[#25D366] text-white hover:bg-[#20bd5a] text-center text-sm rounded-full">💬 SMS</a>
          <a href="https://cal.com/romain-rieg-ckdm4p/30min" target="_blank" rel="noopener" className="p-4 border border-ivory/30 hover:bg-ivory/10 text-center text-sm rounded-full">📅 Réserver un créneau</a>
        </div>
      </div>
    </div>
  );
}
