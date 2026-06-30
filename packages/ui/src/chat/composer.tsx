import { FormEvent, useState } from "react";
import { ChevronDown, FileText, Plus, Send, Shield, Square, X, Zap } from "lucide-react";
import { Button } from "../button";
import { cn } from "../cn";

export interface CodexComposerContextItem {
  readonly detail?: string;
  readonly id: string;
  readonly label: string;
}

export interface CodexComposerProps {
  readonly accessLabel: string;
  readonly canSend: boolean;
  readonly contextItems?: readonly CodexComposerContextItem[];
  readonly isRunning?: boolean;
  readonly modelLabel: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onStop?: () => void;
  readonly onSubmit: () => void;
}

const accessOptions = ["Full access", "Ask first", "Read only"] as const;
const modelOptions = ["5.5 Medium", "5.5 High", "5.5 Low"] as const;

export function CodexComposer({
  accessLabel,
  canSend,
  contextItems = [],
  isRunning,
  modelLabel,
  onChange,
  onStop,
  onSubmit,
  placeholder,
  value,
}: CodexComposerProps) {
  const [contextOpen, setContextOpen] = useState(false);
  const [selectedContextIds, setSelectedContextIds] = useState<readonly string[]>([]);
  const [selectedAccess, setSelectedAccess] = useState(accessLabel);
  const [selectedModel, setSelectedModel] = useState(modelLabel);
  const selectedContextItems = contextItems.filter((item) => selectedContextIds.includes(item.id));

  function submit(event: FormEvent) {
    event.preventDefault();
    if (canSend) {
      onSubmit();
    }
  }

  return (
    <form className="px-6 pb-6" onSubmit={submit}>
      <div className="mx-auto max-w-3xl rounded-[22px] border border-zinc-200 bg-white p-3 shadow-[0_14px_50px_rgba(15,23,42,0.12)]">
        <textarea
          aria-label="Message agent"
          className="max-h-48 min-h-20 w-full resize-none bg-transparent px-2 py-2 text-base leading-6 text-zinc-950 outline-none placeholder:text-zinc-300"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        {contextOpen ? (
          <div
            aria-label="Context sources"
            className="mb-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-2"
            role="region"
          >
            {contextItems.length > 0 ? (
              <div className="grid max-h-36 gap-1 overflow-auto">
                {contextItems.map((item) => {
                  const selected = selectedContextIds.includes(item.id);
                  return (
                    <button
                      aria-label={`Attach context ${item.label}`}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-h-9 items-center gap-2 rounded-xl px-2 text-left text-sm hover:bg-white",
                        selected && "bg-white text-zinc-950 shadow-sm",
                      )}
                      key={item.id}
                      onClick={() =>
                        setSelectedContextIds((ids) =>
                          selected ? ids.filter((id) => id !== item.id) : [...ids, item.id],
                        )
                      }
                      type="button"
                    >
                      <FileText size={14} className="shrink-0 text-zinc-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{item.label}</span>
                        {item.detail ? (
                          <span className="block truncate text-xs text-zinc-400">
                            {item.detail}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-2 py-1.5 text-sm text-zinc-400">
                Open a project to add context.
              </div>
            )}
          </div>
        ) : null}
        {selectedContextItems.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-2 px-1">
            {selectedContextItems.map((item) => (
              <span
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
                key={item.id}
              >
                <FileText size={12} className="shrink-0 text-zinc-400" />
                <span className="truncate">{item.label}</span>
                <button
                  aria-label={`Remove context ${item.label}`}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800"
                  onClick={() => setSelectedContextIds((ids) => ids.filter((id) => id !== item.id))}
                  type="button"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-zinc-500">
            <button
              aria-expanded={contextOpen}
              aria-label="Add context"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                contextOpen && "bg-zinc-100 text-zinc-900",
              )}
              onClick={() => setContextOpen((open) => !open)}
              type="button"
            >
              <Plus size={18} />
            </button>
            <label className="relative inline-flex items-center gap-1 font-medium text-orange-600">
              <Shield size={16} />
              <select
                aria-label="Access mode"
                className="max-w-32 appearance-none bg-transparent py-1 pl-0 pr-4 text-sm font-medium outline-none"
                onChange={(event) => setSelectedAccess(event.target.value)}
                value={selectedAccess}
              >
                {accessOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0" size={13} />
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <label className="relative hidden items-center gap-1 font-medium sm:inline-flex">
              <Zap size={15} />
              <select
                aria-label="Model"
                className="appearance-none bg-transparent py-1 pl-0 pr-4 text-sm font-medium outline-none"
                onChange={(event) => setSelectedModel(event.target.value)}
                value={selectedModel}
              >
                {modelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0" size={13} />
            </label>
            {isRunning ? (
              <Button
                aria-label="Stop"
                className="size-9 rounded-full p-0"
                icon={<Square size={15} />}
                onClick={onStop}
                type="button"
                variant="danger"
              />
            ) : canSend ? (
              <Button
                aria-label="Send"
                className="size-9 rounded-full bg-zinc-500 p-0 hover:bg-zinc-700"
                icon={<Send size={16} />}
                type="submit"
                variant="primary"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-300"
              >
                <Send size={16} />
              </span>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
