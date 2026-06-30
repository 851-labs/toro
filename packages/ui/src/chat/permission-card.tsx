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
    <section className="rounded-[18px] border border-zinc-200 bg-white px-4 py-3 text-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Shield size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="min-w-0 font-medium text-zinc-900">{title}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {options.map((option) => {
              const isAllow = option.kind.startsWith("allow");
              return (
                <Button
                  className="h-8"
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
        </div>
      </div>
    </section>
  );
}
