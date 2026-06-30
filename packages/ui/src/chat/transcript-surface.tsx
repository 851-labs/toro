import type { ReactNode } from "react";
import { cn } from "../cn";

export interface CodexTranscriptSurfaceProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function CodexTranscriptSurface({ children, className }: CodexTranscriptSurfaceProps) {
  return (
    <div
      className={cn("mx-auto flex max-w-[960px] flex-col gap-5", className)}
      data-transcript-surface="true"
    >
      {children}
    </div>
  );
}
