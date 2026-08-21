"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import SliderInput from "../../components/SliderInput";
import ContactCTA from "../../components/ContactCTA";
import { useSiteContent } from "../../lib/ClientData";

const dpeColors: Record<string, string> = { A: "#2a8a3e", B: "#52a539", C: "#a4c733", D: "#f7e93a", E: "#f3a82e", F: "#ea612a", G: "#d33c1d" };

export default function Page() {
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["dpe-express"] ?? {};
  const [typeBien, setTypeBien] = useState<"maison" | "appartement">("maison");
  const [annee, setAnnee] = useState(1985);
  const [surface, setSurface] = useState(120);
  const [chauffage, setChauffage] = useState<"gaz" | "electrique" | "fioul" | "pac" | "bois">("gaz");
  const [isolation, setIsolation] = useState<"aucune" | "partielle" | "complete">("partielle");
  const [vitrage, setVitrage] = useState<"simple" | "double" | "triple">("double");

  const r = useMemo(() => {
    let conso = 200;
    if (annee < 1948) conso = 350;
    else if (annee < 1975) conso = 320;
    else if (annee < 1990) conso = 240;
    else if (annee < 2005) conso = 180;
    else if (annee < 2012) conso = 130;
    else if (annee < 2022) conso = 75;
    else conso = 50;

    if (typeBien === "appartement") conso *= 0.75;

    if (chauffage === "fioul") conso *= 1.15;
    if (chauffage === "electrique" && annee < 2005) conso *= 1.1;
    if (chauffage === "pac") conso *= 0.55;
    if (chauffage === "bois") conso *= 0.85;

    if (isolation === "aucune") conso *= 1.4;
    if (isolation === "complete") conso *= 0.65;

    if (vitrage === "simple") conso *= 1.25;
    if (vitrage === "triple") conso *= 0.92;

    const classes: { c: string; max: number }[] = [
      { c: "A", max: 70 }, { c: "B", max: 110 }, { c: "C", max: 180 },
      { c: "D", max: 250 }, { c: "E", max: 330 }, { c: "F", max: 420 }, { c: "G", max: Infinity },
    ];
    const dpe = classes.find((cl) => conso <= cl.max)!.c;

    const factureMin = (conso * surface) * (chauffage === "gaz" ? 0.08 : chauffage === "fioul" ? 0.13 : chauffage === "electrique" ? 0.21 : chauffage === "pac" ? 0.13 : 0.07);

    const travaux: { item: string; cout: number; gainKwh: number }[] = [];
    if (typeBien === "maison" && isolation === "aucune") travaux.push({ item: "Isolation des combles", cout: surface * 45, gainKwh: 30 });
    if (isolation !== "complete") {
      const labelIso = typeBien === "maison" ? "Isolation extérieure (ITE)" : "Isolation thermique par l'intérieur (ITI)";
      const coutM2 = typeBien === "maison" ? 180 : 80;
      const gain = typeBien === "maison" ? 60 : 35;
      travaux.push({ item: labelIso, cout: surface * coutM2, gainKwh: gain });
    }
    if (vitrage === "simple") travaux.push({ item: "Remplacement double vitrage", cout: surface * 80, gainKwh: 25 });
    if (chauffage === "fioul" || (chauffage === "electrique" && annee < 2005)) travaux.push({ item: "Pompe à chaleur air-eau", cout: 16000, gainKwh: 80 });
    if (chauffage === "gaz" && annee < 2005) travaux.push({ item: "Chaudière gaz à condensation", cout: 6500, gainKwh: 30 });

    const coutTotal = travaux.reduce((a, b) => a + b.cout, 0);
    const consoApresTravaux = Math.max(40, conso - travaux.reduce((a, b) => a + b.gainKwh, 0));
    const dpeApres = classes.find((cl) => consoApresTravaux <= cl.max)!.c;
    const aidesEstimees = coutTotal * 0.35;
    const coutNet = coutTotal - aidesEstimees;

    const decoteVente: Record<string, number> = { A: 0, B: 0, C: 0, D: 3, E: 8, F: 13, G: 17 };
    const impactVente = decoteVente[dpe] ?? 0;

    const interdictionLoc = dpe === "G" ? "interdit depuis 2025" : dpe === "F" ? "interdit en 2028" : dpe === "E" ? "interdit en 2034" : null;

    return { conso: Math.round(conso), dpe, dpeApres, factureMin, travaux, coutTotal, aidesEstimees, coutNet, impactVente, interdictionLoc };
  }, [typeBien, annee, surface, chauffage, isolation, vitrage]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 07"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "DPE express"}</h1>
      <p className="text-muted mt-4 max-w-2xl">{t.intro ?? "Estimation rapide de la classe DPE de votre bien et plan de travaux pour passer en classe C ou B. Basé sur les coefficients officiels de la méthode 3CL 2021."}</p>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 mt-12">
        <div className="space-y-6">
          <Choice label="Type de bien" value={typeBien} onChange={setTypeBien} options={[
            { v: "maison", l: "Maison" }, { v: "appartement", l: "Appartement" },
          ]} />
          <SliderInput
            label="Année de construction"
            value={annee}
            onChange={setAnnee}
            min={1900}
            max={2026}
            step={1}
            suffix=""
          />
          <SliderInput
            label="Surface habitable"
            value={surface}
            onChange={setSurface}
            min={15}
            max={350}
            step={5}
            suffix="m²"
          />
          <Choice label="Mode de chauffage" value={chauffage} onChange={setChauffage} options={[
            { v: "gaz", l: "Gaz" }, { v: "electrique", l: "Électrique" }, { v: "fioul", l: "Fioul" }, { v: "pac", l: "Pompe à chaleur" }, { v: "bois", l: "Bois / granulés" },
          ]} />
          <Choice label="Isolation" value={isolation} onChange={setIsolation} options={[
            { v: "aucune", l: "Aucune" }, { v: "partielle", l: "Partielle (combles)" }, { v: "complete", l: "Complète (ITE + combles)" },
          ]} />
          <Choice label="Vitrage" value={vitrage} onChange={setVitrage} options={[
            { v: "simple", l: "Simple" }, { v: "double", l: "Double" }, { v: "triple", l: "Triple" },
          ]} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-navy text-ivory p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.classe_titre ?? "Classe DPE estimée"}</div>
            <div className="flex items-center gap-6 mt-4">
              <div className="font-serif text-8xl leading-none px-8 py-4" style={{ background: dpeColors[r.dpe], color: r.dpe === "D" ? "#0c1e2e" : "#fff" }}>{r.dpe}</div>
              <div>
                <div className="font-serif text-3xl">{r.conso} kWh/m²/an</div>
                <div className="text-ivory/60 text-sm mt-1">Facture chauffage estimée : <span className="text-gold">{formatPrix(r.factureMin)}/an</span></div>
              </div>
            </div>
            {r.interdictionLoc && (
              <div className="mt-5 p-3 bg-rose-900/30 border-l-2 border-rose-300 text-sm">
                ⚠️ Bien classé {r.dpe} : <strong>location {r.interdictionLoc}</strong> par la loi Climat & Résilience.
              </div>
            )}
            {r.impactVente > 0 && (
              <div className="mt-3 text-sm text-ivory/70">Impact sur la vente : <span className="text-gold font-medium">décote de ~{r.impactVente} %</span> à attendre vs un bien équivalent en C.</div>
            )}
          </div>

          {r.travaux.length > 0 ? (
            <div className="rounded-xl bg-white border border-ink/10 p-6">
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">Plan de travaux pour passer en classe {r.dpeApres}</div>
              <div className="mt-5 space-y-3">
                {r.travaux.map((t) => (
                  <div key={t.item} className="flex justify-between items-baseline border-b border-ink/5 pb-2">
                    <span>{t.item}</span>
                    <span className="font-serif text-navy">{formatPrix(t.cout)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-ink/10">
                <div><div className="text-xs text-muted uppercase tracking-widest">Coût total</div><div className="font-serif text-xl text-navy mt-1">{formatPrix(r.coutTotal)}</div></div>
                <div><div className="text-xs text-muted uppercase tracking-widest">Aides (MaPrimeRénov')</div><div className="font-serif text-xl text-gold mt-1">−{formatPrix(r.aidesEstimees)}</div></div>
                <div><div className="text-xs text-muted uppercase tracking-widest">Reste à charge</div><div className="font-serif text-xl text-navy mt-1">{formatPrix(r.coutNet)}</div></div>
              </div>
              <div className="mt-4 p-4 bg-gold/10">
                <div className="text-sm">Après travaux : nouveau DPE estimé <strong className="font-serif text-2xl text-gold ml-1">{r.dpeApres}</strong> · plus-value à la revente potentielle de <strong>+{Math.round(r.impactVente * 0.7)} %</strong>.</div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-gold/10 border border-gold p-6">
              <div className="font-serif text-xl text-navy">{t.bien_performant_titre ?? "Bien déjà performant ✓"}</div>
              <p className="text-sm text-muted mt-2">{t.bien_performant_texte ?? "Aucun travaux énergétiques majeurs nécessaires. Atout fort à valoriser dans l'annonce."}</p>
            </div>
          )}

          <div className="rounded-xl bg-ivory-deep p-5 text-sm leading-relaxed">
            <strong className="text-navy">{t.disclaimer_label ?? "Important :"}</strong> {t.disclaimer_texte ?? "cette estimation indicative ne remplace pas un DPE officiel réalisé par un diagnostiqueur certifié (obligatoire à la vente, ~150 €). Une mise en relation avec un diagnostiqueur partenaire et un courtier MaPrimeRénov' permet d'optimiser le dossier d'aides."}
          </div>
        </div>
      </div>

    </div>

    <ContactCTA
        titre={t.cta_titre ?? "Plan de rénovation énergétique ?"}
        intro={t.cta_intro ?? "Un accompagnement complet : diagnostiqueur, devis travaux, dossier MaPrimeRénov', puis valorisation à la revente."}
    />
    </>
  );
}

function Choice<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)} className={`p-3 text-sm border ${value===o.v?"bg-navy text-ivory border-navy":"bg-white border-ink/15 hover:border-navy"}`}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}
