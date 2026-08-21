"use client";

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  display?: string;
  hint?: string;
  inputWidth?: string;
};

/**
 * Champ numérique double : règle (input range) + saisie manuelle (input number) synchronisés.
 * Permet à l'utilisateur de choisir entre slider ergonomique ou saisie précise.
 */
export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  display,
  hint,
  inputWidth = "w-32",
}: Props) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  return (
    <div>
      <div className="flex justify-between mb-2 items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
        <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gold/40 focus-within:border-gold rounded-sm">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChange(clamp(n));
            }}
            className={`no-round ${inputWidth} font-serif text-lg text-navy bg-transparent outline-none text-right`}
          />
          {suffix && <span className="text-xs text-muted">{suffix}</span>}
        </div>
      </div>
      {display && <div className="font-serif text-2xl text-navy mb-2 text-right">{display}</div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold"
      />
      <div className="flex justify-between text-[10px] text-muted mt-1">
        <span>{min.toLocaleString("fr-FR")}{suffix ? ` ${suffix}` : ""}</span>
        <span>{max.toLocaleString("fr-FR")}{suffix ? ` ${suffix}` : ""}</span>
      </div>
      {hint && <div className="text-[11px] text-muted mt-1">{hint}</div>}
    </div>
  );
}
