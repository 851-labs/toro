import type { ReactNode } from "react";
import { Check, Shield, X } from "lucide-react";
import { Button } from "../button";

export interface CodexPermissionOption {
  readonly id: string;
  readonly kind: string;
  readonly name: string;
}

export interface CodexPermissionCardProps {
  readonly options: readonly CodexPermissionOption[];
  readonly title: ReactNode;
  readonly onRespond: (optionId: string) => void;
}

export function CodexPermissionCard({ onRespond, options, title }: CodexPermissionCardProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-950">
        <Shield size={16} />
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isAllow = option.kind.startsWith("allow");
          return (
            <Button
              icon={isAllow ? <Check size={14} /> : <X size={14} />}
              key={option.id}
              onClick={() => onRespond(option.id)}
              variant={isAllow ? "primary" : "danger"}
            >
              {option.name}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
