import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { CodexComposer, StatusBadge } from "@toro/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import styles from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    links: [{ href: styles, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1.0", name: "viewport" },
      { title: "Toro Internal" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <InternalLayout>
          <Outlet />
        </InternalLayout>
        <Scripts />
      </body>
    </html>
  );
}

type GuideRoute = "/" | "/composer" | "/empty" | "/sidebar";

function InternalLayout({ children }: { readonly children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeRoute = guideRouteFromPathname(pathname);
  const [composerValue, setComposerValue] = useState("");

  return (
    <main className="internal-shell bg-white text-zinc-950">
      <aside
        className="border-r border-zinc-200 bg-[#f2f5f5] px-3 py-5"
        data-internal-sidebar="true"
      >
        <div className="mb-8 font-semibold">Toro UI</div>
        <nav className="flex flex-col gap-0.5 text-[13px]">
          {guideNavItems.map((item) => (
            <GuideNavLink active={activeRoute === item.to} key={item.to} {...item} />
          ))}
        </nav>
      </aside>
      <section className="internal-content">
        <header
          className="flex items-center justify-between border-b border-zinc-200/80 px-5"
          data-internal-content-header="true"
        >
          <h1 className="text-lg font-semibold">{viewTitle(activeRoute)}</h1>
          <StatusBadge label="reference" tone="neutral" />
        </header>
        <div
          className={
            activeRoute === "/sidebar"
              ? "min-h-0 overflow-hidden"
              : "min-h-0 overflow-auto px-8 py-8"
          }
        >
          {children}
        </div>
        {activeRoute === "/composer" ? (
          <CodexComposer
            accessLabel="Full access"
            canSend={composerValue.trim().length > 0}
            contextStrip={{
              branchLabel: "main",
              environmentLabel: "Work locally",
              projectLabel: "toro",
            }}
            contextItems={contextItems}
            modelLabel="5.5 Medium"
            onChange={setComposerValue}
            onSubmit={() => setComposerValue("")}
            placeholder="Ask for follow-up changes"
            value={composerValue}
          />
        ) : (
          <div />
        )}
      </section>
    </main>
  );
}

const guideNavItems = [
  { label: "Chat Elements", to: "/" },
  { label: "Sidebar Groups", to: "/sidebar" },
  { label: "Empty States", to: "/empty" },
  { label: "Composer States", to: "/composer" },
] satisfies ReadonlyArray<{ readonly label: string; readonly to: GuideRoute }>;

const contextItems = [
  { detail: "apps/desktop/src/app.tsx", id: "app", label: "app.tsx" },
  { detail: "packages/ui/src/chat/composer.tsx", id: "composer", label: "composer.tsx" },
  { detail: "scripts/verify-ui.mjs", id: "verify", label: "verify-ui.mjs" },
];

function GuideNavLink({
  active,
  label,
  to,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly to: GuideRoute;
}) {
  return (
    <Link
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex h-7 w-full items-center rounded-lg bg-zinc-200 px-3 text-left font-medium"
          : "flex h-7 w-full items-center rounded-lg px-3 text-left text-zinc-500 hover:bg-zinc-200/70"
      }
      data-internal-sidebar-item="true"
      to={to}
    >
      {label}
    </Link>
  );
}

function guideRouteFromPathname(pathname: string): GuideRoute {
  if (pathname === "/sidebar" || pathname === "/empty" || pathname === "/composer") {
    return pathname;
  }
  return "/";
}

function viewTitle(route: GuideRoute) {
  if (route === "/sidebar") {
    return "Codex Sidebar Groups";
  }
  if (route === "/composer") {
    return "Codex Composer States";
  }
  if (route === "/empty") {
    return "Codex Empty States";
  }
  return "Codex Chat Surface";
}
