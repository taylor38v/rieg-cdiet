"use client";
import { useEffect, useState } from "react";

type Props = {
  images?: string[];
  video?: string;
  intervalMs?: number;
  overlay?: number;
  position?: string;
};

const DEFAULTS = [
  "/photos/Ville-de-saint-didier-au-mont-d-or_1920.jpg",
  "/photos/IMG_7295.jpeg",
  "/photos/IMG_7134.jpeg",
  "/photos/IMG_7282.jpeg",
  "/photos/IMG_6971.jpeg",
];

export default function HeroBackground({
  images = DEFAULTS,
  video,
  intervalMs = 5500,
  overlay = 0.55,
  position = "center",
}: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (video || images.length <= 1) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs, video]);

  if (video) {
    return (
      <>
        {/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(video) ? (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${video})`,
              backgroundSize: "cover",
              backgroundPosition: position,
            }}
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: position }}
          >
            <source src={video} />
          </video>
        )}
        <div
          className="absolute inset-0 bg-navy"
          style={{ opacity: overlay }}
        />
      </>
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: position,
            opacity: i === active ? 1 : 0,
            animation: i === active ? "kenburns 12s ease-out forwards" : "none",
          }}
        />
      ))}
      <div
        className="absolute inset-0 bg-navy"
        style={{ opacity: overlay }}
      />
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </>
  );
}
