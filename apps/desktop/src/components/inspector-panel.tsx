import type { PermissionRequest, PlanEntry, Session, ToolCall } from "@toro/domain";
import { Button, StatusBadge } from "@toro/ui";
import { Check, ClipboardList, Shield, Terminal, X } from "lucide-react";
import { hostClient } from "../lib/host-client";

interface InspectorPanelProps {
  readonly session: Session | null;
}

export function InspectorPanel({ session }: InspectorPanelProps) {
  return (
    <aside className="grid min-h-0 min-w-0 grid-rows-[auto_auto_1fr] border-l border-zinc-800 bg-zinc-950">
      <Panel title="Plan" icon={<ClipboardList size={15} />}>
        <Plan entries={session?.plan ?? []} />
      </Panel>
      <Panel title="Permissions" icon={<Shield size={15} />}>
        <div className="space-y-2">
          {(session?.permissions ?? []).map((request) => (
            <PermissionCard key={request.id} request={request} />
          ))}
          {session?.permissions.length === 0 ? (
            <div className="text-sm text-zinc-500">No pending requests</div>
          ) : null}
        </div>
      </Panel>
      <Panel title="Activity" icon={<Terminal size={15} />} scroll>
        <div className="space-y-3">
          {(session?.toolCalls ?? []).map((toolCall) => (
            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
          ))}
          <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2">
            <div className="mb-2 text-xs font-medium text-zinc-400">Logs</div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-zinc-500">
              {session?.logs.join("\n") ?? ""}
            </pre>
          </div>
        </div>
      </Panel>
    </aside>
  );
}

function Panel(props: {
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
  readonly scroll?: boolean;
}) {
  return (
    <section className="min-h-0 border-b border-zinc-800">
      <div className="flex h-9 items-center gap-2 border-b border-zinc-800 px-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {props.icon}
        {props.title}
      </div>
      <div className={props.scroll ? "h-[calc(100%-36px)] overflow-auto p-3" : "p-3"}>
        {props.children}
      </div>
    </section>
  );
}

function Plan({ entries }: { readonly entries: readonly PlanEntry[] }) {
  if (entries.length === 0) {
    return <div className="text-sm text-zinc-500">No plan</div>;
  }
  return (
    <ol className="space-y-2">
      {entries.map((entry, index) => (
        <li className="flex gap-2 text-sm" key={`${entry.content}-${index}`}>
          <StatusBadge
            label={entry.status}
            tone={
              entry.status === "completed"
                ? "good"
                : entry.status === "in_progress"
                  ? "warn"
                  : "neutral"
            }
          />
          <span className="min-w-0 flex-1 text-zinc-200">{entry.content}</span>
        </li>
      ))}
    </ol>
  );
}

function PermissionCard({ request }: { readonly request: PermissionRequest }) {
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
      <div className="mb-3 text-sm font-medium text-amber-100">{request.toolCall.title}</div>
      <div className="flex flex-wrap gap-2">
        {request.options.map((option) => (
          <Button
            icon={option.kind.startsWith("allow") ? <Check size={14} /> : <X size={14} />}
            key={option.id}
            onClick={() => void hostClient.respondToPermission(request.id, option.id)}
            variant={option.kind.startsWith("allow") ? "primary" : "danger"}
          >
            {option.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

function ToolCallCard({ toolCall }: { readonly toolCall: ToolCall }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 truncate text-sm font-medium text-zinc-200">{toolCall.title}</div>
        <StatusBadge
          label={toolCall.status}
          tone={
            toolCall.status === "completed" ? "good" : toolCall.status === "failed" ? "bad" : "warn"
          }
        />
      </div>
      <div className="text-xs text-zinc-500">{toolCall.kind}</div>
      {toolCall.content.length > 0 ? (
        <pre className="mt-2 whitespace-pre-wrap text-xs text-zinc-400">
          {toolCall.content.join("\n")}
        </pre>
      ) : null}
    </div>
  );
}
