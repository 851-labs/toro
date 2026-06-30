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
    <section className="text-sm">
      <div className="flex items-start gap-2 rounded-xl px-2 py-2 text-zinc-600 hover:bg-zinc-50">
        <span className="flex size-6 shrink-0 items-center justify-center text-orange-600">
          <Shield size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="min-w-0 font-medium text-zinc-900">{title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
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
