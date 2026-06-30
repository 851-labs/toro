import { cn } from "./cn";

interface StatusBadgeProps {
  readonly label: string;
  readonly tone?: "neutral" | "good" | "warn" | "bad";
}

const tones = {
  bad: "border-red-200 bg-red-50 text-red-700",
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-zinc-200 bg-zinc-100 text-zinc-600",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs", tones[tone])}>
      {label}
    </span>
  );
}
