"use client";
import { useEffect } from "react";

export default function RevealOnScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("section, article > div, [data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => {
      const e = el as HTMLElement;
      if (e.dataset.revealed === "1") return;
      e.style.opacity = "0";
      e.style.transform = "translateY(20px)";
      e.style.transition = "opacity .8s ease-out, transform .8s ease-out";
      e.dataset.revealed = "1";
      io.observe(e);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
