"use client";
import Link from "next/link";
import { useSettings } from "../lib/ClientData";

type Props = {
  /** Inclure le bouton vers /contact (lien interne) */
  withContact?: boolean;
  /** Inclure le bouton téléphone */
  withTel?: boolean;
  /** Sujet pré-rempli pour le mail */
  mailSubject?: string;
  /** Body pré-rempli pour le SMS */
  smsBody?: string;
  /** Alignement des boutons */
  align?: "left" | "center";
  /** Conservé pour compat — le format est désormais unique sur tout le site */
  variant?: "primary" | "light";
};

/**
 * Format unique validé client :
 * - SMS direct / Mail : outline gold (bordure + texte or, fond transparent)
 * - Boutons texte (Me contacter, téléphone) : or rempli
 */
export default function ContactButtons({
  withContact = false,
  withTel = false,
  mailSubject = "",
  smsBody = "Bonjour Romain, ",
  align = "left",
}: Props) {
  const settings = useSettings();
  const smsHref = `sms:${settings.whatsapp}?body=${encodeURIComponent(smsBody)}`;
  const mailHref = `mailto:${settings.email}${mailSubject ? `?subject=${encodeURIComponent(mailSubject)}` : ""}`;

  const outlineGold = "border-2 border-gold text-gold bg-transparent hover:bg-gold hover:text-navy";
  const filledGold = "bg-gold text-navy font-semibold hover:bg-gold-soft";

  return (
    <div className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
      {withTel && (
        <a
          href={`tel:${settings.telephone_lien}`}
          className={`px-6 py-3 ${filledGold} rounded-full text-sm transition inline-flex items-center gap-2`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {settings.telephone}
        </a>
      )}
      <a
        href={smsHref}
        className={`px-6 py-3 ${outlineGold} rounded-full text-sm font-medium transition inline-flex items-center gap-2`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {settings.btn_sms_label ?? "Sms direct"}
      </a>
      <a
        href={mailHref}
        className={`px-6 py-3 ${outlineGold} rounded-full text-sm font-medium transition inline-flex items-center gap-2`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        {settings.btn_mail_label ?? "Email"}
      </a>
      {withContact && (
        <Link
          href="/contact"
          className={`px-6 py-3 ${filledGold} rounded-full text-sm transition`}
        >
          Me contacter
        </Link>
      )}
    </div>
  );
}
