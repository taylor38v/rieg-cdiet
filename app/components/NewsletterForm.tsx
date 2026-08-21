"use client";
import { useState } from "react";

export default function NewsletterForm({ placeholder, bouton }: { placeholder: string; bouton: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/lead/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "newsletter", email }),
      });
    } catch {}
    setSent(true);
  }

  if (sent) return <p className="text-sm text-gold">Merci, votre inscription est bien prise en compte.</p>;

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <input
        type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-navy-soft border border-ivory/20 text-ivory text-sm outline-none focus:border-gold rounded-full"
      />
      <button type="submit" className="px-6 py-3 bg-gold text-navy text-sm font-medium hover:bg-gold-soft rounded-full">
        {bouton}
      </button>
    </form>
  );
}
