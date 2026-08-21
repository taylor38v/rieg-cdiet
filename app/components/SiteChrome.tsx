"use client";
/* Enveloppe visible du site (header, pied de page, widget…). Masquée sous /admin
 * pour que le back-office ait sa propre présentation, sans déplacer les pages du site
 * dans un groupe de routes. */
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import WhatsApp from "./WhatsApp";
import RevealOnScroll from "./RevealOnScroll";

export default function SiteChrome({ justifie, children }: { justifie: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Header />
      <main className={`flex-1 ${justifie ? "" : "text-gauche"}`}>{children}</main>
      <Footer />
      <WhatsApp />
      <RevealOnScroll />
    </>
  );
}
