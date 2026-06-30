import type { PermissionRequest, PlanEntry, Session, ToolCall } from "@toro/domain";
import { Button, CodexToolCall, StatusBadge } from "@toro/ui";
import { Check, ClipboardList, Shield, Terminal, X } from "lucide-react";
import { hostClient } from "../lib/host-client";

interface InspectorPanelProps {
  readonly session: Session | null;
}

export function InspectorPanel({ session }: InspectorPanelProps) {
  return (
    <aside
      aria-label="Session details"
      className="grid min-h-0 min-w-0 grid-rows-[auto_auto_1fr] border-l border-zinc-200 bg-white"
    >
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
      <Panel title="Tool calls" icon={<Terminal size={15} />} scroll>
        <div className="space-y-3">
          {(session?.toolCalls ?? []).map((toolCall) => (
            <ToolCallCard key={toolCall.id} toolCall={toolCall} />
          ))}
          {session?.toolCalls.length === 0 ? (
            <div className="text-sm text-zinc-400">No tool calls</div>
          ) : null}
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
    <section className="min-h-0 border-b border-zinc-200">
      <div className="flex h-10 items-center gap-2 border-b border-zinc-100 px-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {props.icon}
        <h2 className="text-xs font-medium uppercase tracking-wide">{props.title}</h2>
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
          <span className="min-w-0 flex-1 text-zinc-700">{entry.content}</span>
        </li>
      ))}
    </ol>
  );
}

function PermissionCard({ request }: { readonly request: PermissionRequest }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="mb-3 text-sm font-medium text-zinc-900">{request.toolCall.title}</div>
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
    <CodexToolCall kind={toolCall.kind} status={toolCall.status} title={toolCall.title}>
      {toolCall.content.length > 0 ? toolCall.content.join("\n") : null}
    </CodexToolCall>
  );
}
