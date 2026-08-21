import type { Metadata } from "next";
import { getSiteContent } from "../../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const t = (site as any)["outils-pages"]["acheter-vs-louer"];
  return {
    title: t.meta_title,
    description: t.meta_description,
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
