import type { ReactNode } from "react";
import { Code2, MessageSquare, Radio } from "lucide-react";
import { cn } from "../cn";

export interface CodexStarterCard {
  readonly description: string;
  readonly icon: "github" | "linear" | "slack";
  readonly title: string;
}

export interface CodexStarterCardsProps {
  readonly cards?: readonly CodexStarterCard[];
  readonly className?: string;
}

const defaultCards = [
  {
    description: "Catch up on engineering threads",
    icon: "slack",
    title: "Connect messaging",
  },
  {
    description: "Review PRs, code, and CI checks",
    icon: "github",
    title: "Connect GitHub",
  },
  {
    description: "Track bugs and implementation work",
    icon: "linear",
    title: "Connect Linear",
  },
] satisfies readonly CodexStarterCard[];

export function CodexStarterCards({ cards = defaultCards, className }: CodexStarterCardsProps) {
  return (
    <div
      className={cn("mx-auto grid w-full max-w-[880px] grid-cols-3 gap-4", className)}
      data-starter-cards="true"
    >
      {cards.map((card) => (
        <article
          className="min-h-[150px] rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-left dark:border-zinc-700 dark:bg-[#141414]"
          data-starter-card="true"
          key={card.title}
        >
          <span className="mb-6 block text-zinc-900 dark:text-zinc-100">
            {starterIcon(card.icon)}
          </span>
          <h3 className="text-base font-medium text-zinc-950 dark:text-zinc-100">{card.title}</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            {card.description}
          </p>
        </article>
      ))}
    </div>
  );
}

function starterIcon(icon: CodexStarterCard["icon"]): ReactNode {
  if (icon === "github") return <Code2 size={19} />;
  if (icon === "linear") return <Radio size={19} />;
  return <MessageSquare size={19} className="text-[#611f69]" />;
}
