import type { Metadata } from "next";
import SmartContactForm from "../components/SmartContactForm";
import { getSiteContent, getSettings } from "../lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const c = site.contact;
  return {
    title: c.meta_title,
    description: c.meta_description,
  };
}

export default async function Page() {
  const site = await getSiteContent();
  const settings = await getSettings();
  const c = site.contact;
  return (
    <>
      <section className="hero-grad text-ivory py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{c.hero.surtitre}</div>
          <h1 className="font-serif text-4xl md:text-6xl mt-3 leading-[1.05] max-w-4xl">{c.hero.titre}</h1>
          <p className="text-ivory/80 text-lg mt-6 max-w-2xl leading-relaxed">{c.hero.intro}</p>
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-ivory/70">
            {c.hero.garanties.map((g) => <span key={g}>✓ {g}</span>)}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          <SmartContactForm />

          <aside className="space-y-6">
            <div className="rounded-xl bg-white border border-ink/10 p-6">
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{c.sidebar.surtitre}</div>
              <h2 className="font-serif text-2xl mt-2">{c.sidebar.titre}</h2>

              <div className="mt-6 space-y-3">
                <a href={`tel:${c.sidebar.telephone_lien}`} className="flex items-center gap-4 p-3 hover:bg-ivory-deep transition group rounded-xl">
                  <div className="w-12 h-12 grid place-items-center bg-gold text-navy font-serif text-xl rounded-full shrink-0">☎</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-muted">Téléphone</div>
                    <div className="font-serif text-lg text-navy group-hover:text-gold transition">{c.sidebar.telephone}</div>
                  </div>
                </a>

                <a href={`sms:+33679571473?body=Bonjour%20Romain%2C%20`} className="flex items-center gap-4 p-3 hover:bg-ivory-deep transition group rounded-xl">
                  <div className="w-12 h-12 grid place-items-center bg-navy text-gold font-serif text-xl rounded-full shrink-0">💬</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-muted">{settings.btn_sms_label ?? "Sms direct"}</div>
                    <div className="font-serif text-lg text-navy group-hover:text-gold transition">{c.sidebar.whatsapp_label}</div>
                  </div>
                </a>

                <a href={`mailto:${c.sidebar.email}`} className="flex items-center gap-4 p-3 hover:bg-ivory-deep transition group rounded-xl">
                  <div className="w-12 h-12 grid place-items-center bg-ivory-deep text-navy font-serif text-xl rounded-full shrink-0">✉</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-muted">Email</div>
                    <div className="font-serif text-lg text-navy group-hover:text-gold transition break-all">{c.sidebar.email}</div>
                  </div>
                </a>

                <a href="#contact-form" className="flex items-center gap-4 p-3 hover:bg-ivory-deep transition group rounded-xl">
                  <div className="w-12 h-12 grid place-items-center bg-navy text-ivory rounded-full shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="15" y2="17" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-muted">Formulaire</div>
                    <div className="font-serif text-lg text-navy group-hover:text-gold transition">{c.sidebar.formulaire_label}</div>
                  </div>
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-ink/10 text-sm text-muted">
                <div><strong className="text-navy">{c.sidebar.horaires_titre}</strong> · {c.sidebar.horaires_detail}</div>
                <div className="text-xs mt-1">{c.sidebar.horaires_note}</div>
              </div>
            </div>

            <div className="rounded-xl bg-navy text-ivory p-6">
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{c.engagement.surtitre}</div>
              <div className="mt-4 space-y-3 text-sm">
                {c.engagement.items.map((it) => (
                  <div key={it} className="flex gap-3"><span className="text-gold">✓</span><span>{it}</span></div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-ivory-deep p-6 text-sm text-muted leading-relaxed">
              <strong className="text-navy">{c.footer_form_titre}</strong><br />
              {c.footer_form_note}
            </div>
          </aside>
        </div>
      </div>

      <section className="bg-ivory-deep py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <div>
              <div className="text-base md:text-lg uppercase tracking-[0.25em] text-gold font-medium">{c.calendrier.surtitre}</div>
              <h2 className="font-serif text-4xl md:text-5xl text-navy mt-3 leading-tight">{c.calendrier.titre}</h2>
              <p className="text-muted mt-4 leading-relaxed">{c.calendrier.intro}</p>
              <ul className="mt-6 space-y-2 text-sm text-ink/85">
                {c.calendrier.puces.map((p) => (
                  <li key={p} className="flex gap-2"><span className="text-gold">✓</span>{p}</li>
                ))}
              </ul>
              <a href={c.calendrier.cal_url} target="_blank" rel="noopener" className="inline-block mt-6 px-6 py-3 bg-navy text-ivory hover:bg-gold hover:text-navy text-sm transition rounded-full">
                {c.calendrier.cta_label}
              </a>
            </div>
            <div className="rounded-xl bg-white border border-ink/10 overflow-hidden" style={{ minHeight: 660 }}>
              <iframe
                src={`${c.calendrier.cal_url}?embed=true&theme=light&hideEventTypeDetails=false`}
                title="Réserver un rendez-vous avec Romain Rieg"
                width="100%"
                height="660"
                frameBorder={0}
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
