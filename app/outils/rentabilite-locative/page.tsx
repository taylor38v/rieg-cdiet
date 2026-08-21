"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { formatPrix } from "../../lib/format";
import SliderInput from "../../components/SliderInput";
import DureeChoice from "../../components/DureeChoice";
import ContactCTA from "../../components/ContactCTA";
import { useSiteContent } from "../../lib/ClientData";

export default function Page() {
  const site = useSiteContent();
  const t = (site as any)["outils-pages"]?.["rentabilite-locative"] ?? {};
  const [prix, setPrix] = useState(280000);
  const [loyer, setLoyer] = useState(1100);
  const [chargesAn, setChargesAn] = useState(1200);
  const [tf, setTf] = useState(1500);
  const [vacance, setVacance] = useState(4);
  const [tmi, setTmi] = useState(30);
  const [apport, setApport] = useState(40000);
  const [taux, setTaux] = useState(3.6);
  const [duree, setDuree] = useState(20);

  const r = useMemo(() => {
    const fraisNotaire = prix * 0.075;
    const totalInvest = prix + fraisNotaire;
    const emprunt = Math.max(0, totalInvest - apport);
    const r = taux / 100 / 12;
    const n = duree * 12;
    const mensualite = emprunt > 0 ? emprunt * r / (1 - Math.pow(1 + r, -n)) : 0;
    const assurance = emprunt * 0.0036 / 12;
    const loyerAnnuel = loyer * 12 * (1 - vacance / 100);
    const brut = (loyer * 12 / totalInvest) * 100;
    const chargesTotales = chargesAn + tf + (loyerAnnuel * 0.08);
    const revenuFoncierNet = loyerAnnuel - chargesTotales;
    const impot = Math.max(0, revenuFoncierNet * (tmi / 100 + 0.172));
    const cashflowAnnuel = loyerAnnuel - chargesTotales - mensualite * 12 - assurance * 12 - impot;
    const net = ((loyerAnnuel - chargesTotales) / totalInvest) * 100;
    const netNet = ((loyerAnnuel - chargesTotales - impot) / totalInvest) * 100;

    const evolution = Array.from({ length: 21 }, (_, y) => {
      const valeurBien = prix * Math.pow(1.025, y);
      const cashflowCumul = cashflowAnnuel * y;
      return { annee: y, valeur: valeurBien, cashflowCumul };
    });

    const valeurFinale = prix * Math.pow(1.025, duree);
    const totalCashflow = cashflowAnnuel * duree;
    const enrichissement = valeurFinale + totalCashflow - apport;

    return { brut, net, netNet, mensualite, assurance, cashflowAnnuel, totalInvest, fraisNotaire, emprunt, evolution, valeurFinale, totalCashflow, enrichissement };
  }, [prix, loyer, chargesAn, tf, vacance, tmi, apport, taux, duree]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 08"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "Rentabilité locative"}</h1>
      <p className="text-muted mt-4 max-w-2xl">{t.intro ?? "Rendement brut, net, cash-flow et enrichissement patrimonial sur 20 ans. Tient compte de la fiscalité, de la vacance locative et de l'évolution du marché."}</p>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 mt-12">
        <div className="space-y-5">
          <Block title="Le bien">
            <SliderInput label="Prix d'achat" value={prix} onChange={setPrix} min={50000} max={2000000} step={5000} suffix="€" display={formatPrix(prix)} />
            <SliderInput label="Loyer mensuel" value={loyer} onChange={setLoyer} min={300} max={4000} step={25} suffix="€" />
          </Block>
          <Block title="Charges annuelles">
            <SliderInput label="Charges (copro, entretien)" value={chargesAn} onChange={setChargesAn} min={0} max={4000} step={50} suffix="€" />
            <SliderInput label="Taxe foncière" value={tf} onChange={setTf} min={0} max={8000} step={50} suffix="€" />
            <SliderInput label="Vacance locative" value={vacance} onChange={setVacance} min={0} max={20} step={1} suffix="%" />
          </Block>
          <Block title="Financement">
            <SliderInput label="Apport" value={apport} onChange={setApport} min={0} max={200000} step={1000} suffix="€" />
            <SliderInput label="Taux du prêt" value={taux} onChange={setTaux} min={1} max={5} step={0.05} suffix="%" />
            <DureeChoice value={duree} onChange={setDuree} />
            <SliderInput
              label="TMI"
              value={tmi}
              onChange={setTmi}
              min={0}
              max={45}
              step={11}
              suffix="%"
              hint="TMI = Tranche Marginale d'Imposition (votre taux d'impôt sur les revenus locatifs). Tranches actuelles : 0 %, 11 %, 30 %, 41 %, 45 %."
            />
          </Block>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KPI label="Brut" v={`${r.brut.toFixed(2)} %`} sub="rendement" />
            <KPI label="Net" v={`${r.net.toFixed(2)} %`} sub="charges déduites" highlight />
            <KPI label="Net-net" v={`${r.netNet.toFixed(2)} %`} sub="après impôts" />
          </div>

          <div className="rounded-xl bg-navy text-ivory p-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.cashflow_titre ?? "Cash-flow mensuel après impôts"}</div>
            <div className="flex items-baseline gap-3 mt-2">
              <div className={`font-serif text-5xl ${r.cashflowAnnuel >= 0 ? "text-gold" : "text-rose-300"}`}>
                {r.cashflowAnnuel >= 0 ? "+" : ""}{Math.round(r.cashflowAnnuel / 12)} €/mois
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ivory/10 text-sm">
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Mensualité</div><div className="font-serif text-lg mt-1">{Math.round(r.mensualite + r.assurance)} €</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Loyer encaissé</div><div className="font-serif text-lg mt-1">{loyer} €</div></div>
              <div><div className="text-ivory/50 text-xs uppercase tracking-widest">Effort d'épargne</div><div className="font-serif text-lg mt-1">{r.cashflowAnnuel >= 0 ? "0 €" : `${Math.round(Math.abs(r.cashflowAnnuel) / 12)} €`}</div></div>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-ink/10 p-6">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.patrimoine_titre ?? "Patrimoine constitué dans"} {duree} {t.patrimoine_titre_suffix ?? "ans"}</div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs text-muted uppercase tracking-widest">Valeur du bien</div>
                <div className="font-serif text-3xl text-navy mt-1">{formatPrix(r.valeurFinale)}</div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase tracking-widest">Enrichissement net*</div>
                <div className="font-serif text-3xl text-gold mt-1">+{formatPrix(r.enrichissement)}</div>
              </div>
            </div>
            <svg viewBox="0 0 600 200" className="w-full mt-6">
              {[0, 0.5, 1].map((p) => <line key={p} x1="40" y1={20 + p * 140} x2="580" y2={20 + p * 140} stroke="#1a1a1a" strokeOpacity="0.05" />)}
              <polyline fill="none" stroke="#c9a25f" strokeWidth="2.5"
                points={r.evolution.map((e, i) => `${40 + (i / 20) * 540},${20 + 140 - (e.valeur / r.evolution[20].valeur) * 140}`).join(" ")} />
              {[0, 5, 10, 15, 20].map((y) => (
                <text key={y} x={40 + (y / 20) * 540} y="190" fontSize="9" fill="#6b6355" textAnchor="middle">{y}a</text>
              ))}
            </svg>
            <div className="text-[11px] text-muted">{t.note_enrichissement ?? "* valeur du bien + cash-flow cumulé − apport initial. Hors revente et fiscalité de plus-value."}</div>
          </div>

          <div className="rounded-xl bg-ivory-deep p-5 text-sm leading-relaxed">
            <strong className="text-navy">{t.verdict_label ?? "Verdict :"}</strong>{" "}
            {r.netNet >= 4
              ? (t.verdict_rentable ?? "Investissement rentable, à étudier.")
              : r.netNet >= 2.5
              ? (t.verdict_moyen ?? "Rentabilité moyenne - l'effort d'épargne reste raisonnable, le pari porte sur la valorisation patrimoniale.")
              : (t.verdict_faible ?? "Rentabilité faible : l'opération n'a de sens que si le bien est très bien placé pour la plus-value future.")}
          </div>
        </div>
      </div>

    </div>

    <ContactCTA
        titre={t.cta_titre ?? "Sélection de biens à fort rendement ?"}
        intro={t.cta_intro ?? "Sur le Mont d'Or, l'Ouest lyonnais et la Plaine du Forez, un sourcing investisseur identifie les biens off-market et les programmes neufs."}
    />
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 bg-ivory-deep">
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mb-4">{title}</div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
function KPI({ label, v, sub, highlight }: { label: string; v: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-5 ${highlight ? "bg-gold/10 border border-gold" : "bg-white border border-ink/10"}`}>
      <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
      <div className={`font-serif text-3xl mt-1 ${highlight ? "text-gold" : "text-navy"}`}>{v}</div>
      <div className="text-[10px] text-muted mt-1">{sub}</div>
    </div>
  );
}
