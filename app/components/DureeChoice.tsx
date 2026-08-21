"use client";

type Props = {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  options?: number[];
};

export default function DureeChoice({
  label = "Durée du prêt",
  value,
  onChange,
  options = [10, 15, 20, 25],
}: Props) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted mb-2">{label}</div>
      <div className="grid grid-cols-4 gap-2">
        {options.map((d) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={`p-3 border text-sm transition ${
              value === d
                ? "bg-navy text-ivory border-navy"
                : "bg-white border-ink/15 hover:border-navy"
            }`}
          >
            {d} ans
          </button>
        ))}
      </div>
    </div>
  );
}
