import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { Button as BaseButton } from "@base-ui-components/react/button";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  FileText,
  GitBranch,
  Laptop,
  Plus,
  Shield,
  Square,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../button";
import { cn } from "../cn";
import { ToroSelect } from "../select";

export interface CodexComposerContextItem {
  readonly detail?: string;
  readonly id: string;
  readonly label: string;
}

export interface CodexComposerProps {
  readonly accessLabel: string;
  readonly canSend: boolean;
  readonly children?: ReactNode;
  readonly contextItems?: readonly CodexComposerContextItem[];
  readonly contextStrip?: CodexComposerContextStrip;
  readonly isRunning?: boolean;
  readonly lifted?: boolean;
  readonly modelLabel: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onStop?: () => void;
  readonly onSubmit: () => void;
}

export interface CodexComposerContextStrip {
  readonly branchLabel?: string;
  readonly environmentLabel?: string;
  readonly projectLabel?: string;
}

const accessOptions = ["Full access", "Ask first", "Read only"] as const;
const modelOptions = ["5.5 Medium", "5.5 High", "5.5 Low"] as const;

interface ComposerKeyEvent {
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly key: string;
  readonly metaKey: boolean;
  readonly nativeEvent?: { readonly isComposing?: boolean };
  readonly shiftKey: boolean;
}

export function shouldSubmitComposerKey(event: ComposerKeyEvent): boolean {
  return (
    event.key === "Enter" &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.nativeEvent?.isComposing
  );
}

export function CodexComposer({
  accessLabel,
  canSend,
  children,
  contextItems = [],
  contextStrip,
  isRunning,
  lifted,
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

  useEffect(() => {
    setSelectedAccess(accessLabel);
  }, [accessLabel]);

  useEffect(() => {
    setSelectedModel(modelLabel);
  }, [modelLabel]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (canSend) {
      onSubmit();
    }
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!shouldSubmitComposerKey(event)) {
      return;
    }
    event.preventDefault();
    if (canSend) {
      onSubmit();
    }
  }

  return (
    <form className={cn("px-6 pb-6", lifted && "mb-16")} onSubmit={submit}>
      <div
        className="relative z-10 mx-auto max-w-[760px] rounded-[22px] border border-zinc-200 bg-white p-3 shadow-[0_14px_50px_rgba(15,23,42,0.12)] dark:border-zinc-700 dark:bg-[#2b2b2b] dark:shadow-none"
        data-composer-surface="true"
      >
        <textarea
          aria-label="Message agent"
          className="max-h-48 min-h-16 w-full resize-none bg-transparent px-2 py-2 text-base leading-6 text-zinc-950 outline-none placeholder:text-zinc-300 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={placeholder}
          value={value}
        />
        {contextOpen ? (
          <div
            aria-label="Context sources"
            className="mb-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-2 dark:border-zinc-700 dark:bg-[#242424]"
            role="region"
          >
            {contextItems.length > 0 ? (
              <div className="grid max-h-36 gap-1 overflow-auto">
                {contextItems.map((item) => {
                  const selected = selectedContextIds.includes(item.id);
                  return (
                    <BaseButton
                      aria-label={`Attach context ${item.label}`}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-h-9 items-center gap-2 rounded-xl px-2 text-left text-sm hover:bg-white dark:hover:bg-zinc-700/70",
                        selected &&
                          "bg-white text-zinc-950 shadow-sm dark:bg-zinc-700 dark:text-zinc-100",
                      )}
                      data-base-ui-button="true"
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
                    </BaseButton>
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
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                key={item.id}
              >
                <FileText size={12} className="shrink-0 text-zinc-400" />
                <span className="truncate">{item.label}</span>
                <BaseButton
                  aria-label={`Remove context ${item.label}`}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                  data-base-ui-button="true"
                  onClick={() => setSelectedContextIds((ids) => ids.filter((id) => id !== item.id))}
                  type="button"
                >
                  <X size={11} />
                </BaseButton>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-700">
          <div className="flex min-w-0 items-center gap-3 text-sm text-zinc-500">
            <BaseButton
              aria-expanded={contextOpen}
              aria-label="Add context"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/70 dark:hover:text-zinc-100",
                contextOpen && "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",
              )}
              data-base-ui-button="true"
              onClick={() => setContextOpen((open) => !open)}
              type="button"
            >
              <Plus size={18} />
            </BaseButton>
            <ToroSelect
              ariaLabel="Access mode"
              icon={<Shield size={16} />}
              onValueChange={setSelectedAccess}
              options={accessOptions}
              tone="orange"
              value={selectedAccess}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span
              aria-hidden="true"
              className="hidden size-7 shrink-0 items-center justify-center sm:flex"
              data-composer-affordance="status"
            >
              <span className="size-3 rounded-full border-2 border-zinc-200 border-t-zinc-400" />
            </span>
            <ToroSelect
              ariaLabel="Model"
              className="hidden sm:inline-flex"
              icon={<Zap size={15} />}
              onValueChange={setSelectedModel}
              options={modelOptions}
              value={selectedModel}
            />
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
                className="size-9 rounded-full bg-zinc-600 p-0 hover:bg-zinc-800"
                icon={<ArrowUp size={18} strokeWidth={2.4} />}
                type="submit"
                variant="primary"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-300 dark:bg-zinc-500 dark:text-zinc-900"
                data-composer-send-disabled="true"
              >
                <ArrowUp size={18} strokeWidth={2.4} />
              </span>
            )}
          </div>
        </div>
      </div>
      {contextStrip ? <ComposerContextStrip context={contextStrip} /> : null}
      {children}
    </form>
  );
}

function ComposerContextStrip({ context }: { readonly context: CodexComposerContextStrip }) {
  const items: { icon: ReactNode; label: string; menuHint?: boolean }[] = [];
  if (context.projectLabel) {
    items.push({ icon: <FileText size={15} />, label: context.projectLabel });
  }
  if (context.environmentLabel) {
    items.push({ icon: <Laptop size={15} />, label: context.environmentLabel, menuHint: true });
  }
  if (context.branchLabel) {
    items.push({ icon: <GitBranch size={15} />, label: context.branchLabel, menuHint: true });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className="-mt-3 mx-auto max-w-[760px] rounded-b-[22px] bg-zinc-50 px-5 pb-4 pt-6 text-sm text-zinc-500 dark:bg-[#242424] dark:text-zinc-400"
      data-composer-context-strip="true"
    >
      <div className="flex min-w-0 items-center gap-5">
        {items.map((item) => (
          <span className="inline-flex min-w-0 items-center gap-1.5" key={item.label}>
            <span className="shrink-0 text-zinc-400">{item.icon}</span>
            <span className="truncate font-medium">{item.label}</span>
            {item.menuHint ? (
              <ChevronDown
                aria-hidden="true"
                className="shrink-0 text-zinc-500"
                data-composer-context-chevron="true"
                size={13}
              />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
