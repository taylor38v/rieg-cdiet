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
  const t = (site as any)["outils-pages"]?.["acheter-vs-louer"] ?? {};
  const [prix, setPrix] = useState(450000);
  const [loyer, setLoyer] = useState(1450);
  const [apport, setApport] = useState(60000);
  const [taux, setTaux] = useState(3.6);
  const [duree, setDuree] = useState(20);
  const [horizon, setHorizon] = useState(10);
  const [evolBien, setEvolBien] = useState(2.5);
  const [evolLoyer, setEvolLoyer] = useState(2);
  const [rendementPlacement, setRendementPlacement] = useState(4);

  const r = useMemo(() => {
    const fraisNotaire = prix * 0.075;
    const totalInvest = prix + fraisNotaire;
    const emprunt = Math.max(0, totalInvest - apport);
    const m = taux / 100 / 12;
    const n = duree * 12;
    const mensualite = emprunt > 0 ? emprunt * m / (1 - Math.pow(1 + m, -n)) : 0;
    const tfAnnuel = prix * 0.0035;
    const chargesProprio = prix * 0.005;

    // --- Scénario achat ---
    let resteDu = emprunt;
    let valeurBien = prix;
    let paiementsAchat = apport; // décaissement initial
    for (let y = 1; y <= horizon; y++) {
      for (let i = 0; i < 12; i++) {
        const interet = resteDu * m;
        const capital = Math.min(resteDu, mensualite - interet);
        resteDu -= capital;
        paiementsAchat += mensualite;
      }
      paiementsAchat += tfAnnuel + chargesProprio;
      valeurBien *= 1 + evolBien / 100;
    }
    const patrimoineAchat = valeurBien - resteDu;
    const netAchat = patrimoineAchat - paiementsAchat;

    // --- Scénario location + placement de l'apport et des économies ---
    let loyerCumul = 0;
    let loyerCourant = loyer;
    let placement = apport; // l'apport est placé dès le départ
    for (let y = 1; y <= horizon; y++) {
      for (let i = 0; i < 12; i++) {
        const coutAchatMois = mensualite + (tfAnnuel + chargesProprio) / 12;
        const economie = Math.max(0, coutAchatMois - loyerCourant);
        placement = placement * (1 + rendementPlacement / 100 / 12) + economie;
      }
      loyerCumul += loyerCourant * 12;
      loyerCourant *= 1 + evolLoyer / 100;
    }
    const patrimoineLocataire = placement;
    const paiementsLoc = apport + loyerCumul;
    const netLoc = patrimoineLocataire - paiementsLoc;

    // --- Point de bascule ---
    const seuil = (() => {
      let v = prix;
      let d = emprunt;
      let paiA = apport;
      let lCum = 0;
      let lCour = loyer;
      let placBascule = apport;
      for (let y = 1; y <= 30; y++) {
        for (let i = 0; i < 12; i++) {
          const ii = d * m;
          const cap = Math.min(d, mensualite - ii);
          d -= cap;
          paiA += mensualite;
          const coutAchatMois = mensualite + (tfAnnuel + chargesProprio) / 12;
          const economie = Math.max(0, coutAchatMois - lCour);
          placBascule = placBascule * (1 + rendementPlacement / 100 / 12) + economie;
        }
        v *= 1 + evolBien / 100;
        paiA += tfAnnuel + chargesProprio;
        lCum += lCour * 12;
        lCour *= 1 + evolLoyer / 100;
        const netA = (v - d) - paiA;
        const netL = placBascule - (apport + lCum);
        if (netA > netL) return y;
      }
      return null;
    })();

    return {
      mensualite,
      patrimoineAchat,
      patrimoineLocataire,
      paiementsAchat,
      paiementsLoc,
      netAchat,
      netLoc,
      seuil,
      fraisNotaire,
    };
  }, [prix, loyer, apport, taux, duree, horizon, evolBien, evolLoyer, rendementPlacement]);

  const winner = r.netAchat > r.netLoc ? "achat" : "location";

  return (
    <>
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <Link href="/outils" className="text-sm text-muted hover:text-navy">← Tous les outils</Link>
      <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium mt-8">{t.surtitre ?? "Outil 03"}</div>
      <h1 className="font-serif text-3xl md:text-4xl mt-3">{t.titre ?? "Acheter ou louer ?"}</h1>
      <p className="text-muted mt-4 max-w-2xl">{t.intro ?? "Comparaison financière complète sur votre durée d'occupation. Intègre frais de notaire, intérêts, taxe foncière, charges, valorisation et placement alternatif de l'apport."}</p>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 mt-12">
        <div className="space-y-6">
          <SliderInput label="Prix du bien" value={prix} onChange={setPrix} min={50000} max={2000000} step={5000} suffix="€" display={formatPrix(prix)} />
          <SliderInput label="Loyer mensuel équivalent" value={loyer} onChange={setLoyer} min={300} max={4000} step={25} suffix="€" />
          <SliderInput label="Apport disponible" value={apport} onChange={setApport} min={0} max={200000} step={1000} suffix="€" />
          <SliderInput label="Taux du prêt" value={taux} onChange={setTaux} min={1} max={5} step={0.05} suffix="%" />
          <DureeChoice value={duree} onChange={setDuree} />
          <div className="border-t border-ink/10 pt-4 mt-4 space-y-5">
            <SliderInput label="Durée d'occupation envisagée" value={horizon} onChange={setHorizon} min={1} max={25} step={1} suffix="ans" />
            <SliderInput label="Évolution annuelle du bien" value={evolBien} onChange={setEvolBien} min={-2} max={6} step={0.1} suffix="%" />
            <SliderInput label="Évolution annuelle des loyers" value={evolLoyer} onChange={setEvolLoyer} min={0} max={5} step={0.1} suffix="%" />
            <SliderInput label="Rendement placement (assurance-vie, ETF…)" value={rendementPlacement} onChange={setRendementPlacement} min={0} max={8} step={0.1} suffix="%" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-navy text-ivory p-8">
            <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.verdict_prefix ?? "Verdict à"} {horizon} {t.verdict_suffix ?? "ans"}</div>
            <div className="font-serif text-4xl mt-3">
              {winner === "achat" ? <span className="text-gold">{t.verdict_achat ?? "L'achat est financièrement plus avantageux"}</span> : <span className="text-gold">{t.verdict_location ?? "La location est financièrement plus avantageuse"}</span>}
            </div>
            <div className="text-ivory/70 text-sm mt-3">
              {r.seuil ? <>{t.bascule_prefix ?? "Le point de bascule (où l'achat devient gagnant) se situe à"} <span className="text-gold font-medium">{r.seuil} {t.bascule_unite ?? "ans"}</span> {t.bascule_suffix ?? "d'occupation."}</> : (t.bascule_aucun ?? "Sur les 30 prochaines années, la location reste financièrement préférable dans cette configuration.")}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className={`rounded-xl p-6 ${winner === "achat" ? "bg-gold/10 border border-gold" : "bg-white border border-ink/10"}`}>
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.scenario_achat_titre ?? "Scénario achat"}</div>
              <div className="mt-4 space-y-3 text-sm">
                <Row l="Patrimoine net (valeur − dette)" v={formatPrix(r.patrimoineAchat)} highlight />
                <Row l="Mensualité de prêt" v={`${formatPrix(r.mensualite)} /mois`} />
                <Row l="Frais de notaire payés" v={formatPrix(r.fraisNotaire)} />
                <Row l="Total décaissé sur la période" v={formatPrix(r.paiementsAchat)} />
                <Row l="Solde net (patrimoine − décaissé)" v={formatPrix(r.netAchat)} red={r.netAchat < 0} />
              </div>
            </div>
            <div className={`rounded-xl p-6 ${winner === "location" ? "bg-gold/10 border border-gold" : "bg-white border border-ink/10"}`}>
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{t.scenario_location_titre ?? "Scénario location + placement"}</div>
              <div className="mt-4 space-y-3 text-sm">
                <Row l="Capital placé constitué" v={formatPrix(r.patrimoineLocataire)} highlight />
                <Row l="Loyer initial" v={`${loyer} € /mois`} />
                <Row l={`Apport placé à ${rendementPlacement}%`} v={formatPrix(apport)} />
                <Row l="Total décaissé (apport + loyers)" v={formatPrix(r.paiementsLoc)} />
                <Row l="Solde net (placement − décaissé)" v={formatPrix(r.netLoc)} red={r.netLoc < 0} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-ivory-deep p-5 text-sm leading-relaxed">
            <strong className="text-navy">{t.a_retenir_label ?? "À retenir :"}</strong> {t.a_retenir ?? "ce comparatif est purement financier. La propriété apporte aussi de la sécurité, la possibilité de transmettre, la liberté de transformer. La location offre flexibilité géographique et zéro travaux. Un échange permet de mettre ces chiffres en perspective avec votre projet de vie."}
          </div>
        </div>
      </div>

    </div>

    <ContactCTA
        titre={t.cta_titre ?? "Me contacter pour en parler"}
        intro={t.cta_intro ?? "Mettre ces chiffres en face d'un vrai bien, d'une vraie ville, d'un vrai projet de vie : un échange en visio ou en agence pour aller plus loin."}
    />
    </>
  );
}

function Row({ l, v, highlight, red }: { l: string; v: string; highlight?: boolean; red?: boolean }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-muted text-xs">{l}</span>
      <span className={`font-serif ${highlight ? "text-2xl text-gold" : red ? "text-base text-rose-700" : "text-base text-navy"}`}>{v}</span>
    </div>
  );
}
