import type { Metadata } from "next";
import { getSiteContent } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const av = site["avis-de-valeur"];
  return {
    title: av.meta_title,
    description: av.meta_description,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
