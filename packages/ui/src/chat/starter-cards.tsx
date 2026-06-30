import type { ReactNode } from "react";
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
          <span
            className="mb-6 block text-zinc-900 dark:text-zinc-100"
            data-starter-card-icon={card.icon}
          >
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
  if (icon === "github") return <GitHubMark />;
  if (icon === "linear") return <LinearMark />;
  return <SlackMark />;
}

function SlackMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-6 -translate-x-0.5 -translate-y-0.5"
      viewBox="0 0 20 20"
    >
      <rect fill="#36C5F0" height="8" rx="2" width="4" x="4" y="1" />
      <rect fill="#2EB67D" height="4" rx="2" width="8" x="8" y="5" />
      <rect fill="#E01E5A" height="4" rx="2" width="8" x="1" y="11" />
      <rect fill="#ECB22E" height="8" rx="2" width="4" x="11" y="11" />
      <rect fill="#E01E5A" height="4" rx="2" width="4" x="4" y="7" />
      <rect fill="#2EB67D" height="4" rx="2" width="4" x="9" y="9" />
      <rect fill="#36C5F0" height="4" rx="2" width="4" x="7" y="4" />
      <rect fill="#ECB22E" height="4" rx="2" width="4" x="12" y="9" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20">
      <path
        clipRule="evenodd"
        d="M10 1.8a8.2 8.2 0 0 0-2.6 16c.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-1.9-.2-3.9-.9-3.9-4.1 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.2 0 0 .7-.2 2.3.8.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.6-1 2.3-.8 2.3-.8.5 1.2.2 2 .1 2.2.5.6.8 1.3.8 2.2 0 3.2-2 3.9-3.9 4.1.3.3.6.8.6 1.6v2.1c0 .2.2.5.6.4A8.2 8.2 0 0 0 10 1.8Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function LinearMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20">
      <circle cx="10" cy="10" fill="currentColor" r="8" />
      <path
        className="stroke-white dark:stroke-[#111]"
        d="M3.9 12.1 12.1 3.9M5.8 15l9.2-9.2M9.1 16.8l7.7-7.7"
        strokeWidth="1.8"
      />
    </svg>
  );
}
