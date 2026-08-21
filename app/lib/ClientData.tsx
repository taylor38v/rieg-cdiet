"use client";
/* Contexte qui expose le contenu du site aux composants CLIENT (Header, Footer,
 * WhatsApp, carte, outils…). Alimenté une seule fois par le layout racine, qui lit
 * les Blobs côté serveur. Les composants client n'accèdent jamais aux Blobs
 * directement. */
import { createContext, useContext } from "react";
import type { SiteData } from "./content";

const Ctx = createContext<SiteData | null>(null);

export function ClientDataProvider({ value, children }: { value: SiteData; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useData(): SiteData {
  const v = useContext(Ctx);
  if (!v) throw new Error("ClientDataProvider manquant au-dessus de ce composant.");
  return v;
}

export const useSettings = () => useData().settings;
export const useSecteurs = () => useData().secteurs;
export const useSecteursDetails = () => useData().secteursDetails;
export const useSiteContent = () => useData().site;
