import { FormEvent } from "react";
import { Send, Shield, Square, Zap } from "lucide-react";
import { Button } from "../button";

export interface CodexComposerProps {
  readonly accessLabel: string;
  readonly canSend: boolean;
  readonly isRunning?: boolean;
  readonly modelLabel: string;
  readonly placeholder: string;
  readonly value: string;
  readonly workspaceLabel: string;
  readonly onChange: (value: string) => void;
  readonly onStop?: () => void;
  readonly onSubmit: () => void;
}

export function CodexComposer({
  accessLabel,
  canSend,
  isRunning,
  modelLabel,
  onChange,
  onStop,
  onSubmit,
  placeholder,
  value,
  workspaceLabel,
}: CodexComposerProps) {
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
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <div className="flex min-w-0 items-center gap-3 text-sm text-zinc-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 font-medium text-orange-600">
              <Shield size={16} />
              {accessLabel}
            </span>
            <span className="hidden truncate sm:inline">{workspaceLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="hidden items-center gap-1 font-medium sm:inline-flex">
              <Zap size={15} />
              {modelLabel}
            </span>
            {isRunning ? (
              <Button
                aria-label="Stop"
                className="size-9 rounded-full p-0"
                icon={<Square size={15} />}
                onClick={onStop}
                type="button"
                variant="danger"
              />
            ) : (
              <Button
                aria-label="Send"
                className="size-9 rounded-full bg-zinc-500 p-0 hover:bg-zinc-700"
                disabled={!canSend}
                icon={<Send size={16} />}
                type="submit"
                variant="primary"
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
