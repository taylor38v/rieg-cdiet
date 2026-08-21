"use client";
import { useRef } from "react";

type Review = { nom: string; contexte?: string; texte: string };

export default function ReviewsCarousel({ items }: { items?: readonly Review[] }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!items || items.length === 0) return null;

  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const amount = card ? card.offsetWidth + 24 : el.clientWidth;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className="relative mt-10">
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-2 px-2"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((r, i) => (
          <div
            key={i}
            data-card
            className="snap-start shrink-0 w-[85%] sm:w-[360px] bg-white border border-ink/10 rounded-2xl p-7 text-left shadow-sm"
          >
            <div className="text-gold text-lg tracking-[0.2em]">★★★★★</div>
            <p className="text-ink/80 mt-4 leading-relaxed">“{r.texte}”</p>
            <div className="mt-6 pt-5 border-t border-ink/10">
              <div className="font-serif text-lg text-navy">{r.nom}</div>
              {r.contexte && (
                <div className="text-[10px] text-muted mt-1 uppercase tracking-widest">{r.contexte}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={() => scroll(-1)}
            aria-label="Avis précédent"
            className="w-11 h-11 rounded-full border border-navy/20 text-navy grid place-items-center hover:bg-navy hover:text-ivory transition"
          >
            ←
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Avis suivant"
            className="w-11 h-11 rounded-full border border-navy/20 text-navy grid place-items-center hover:bg-navy hover:text-ivory transition"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
