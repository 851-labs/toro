import type { ReactNode } from "react";
import { Select } from "@base-ui-components/react/select";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface ToroSelectProps {
  readonly ariaLabel: string;
  readonly className?: string;
  readonly icon?: ReactNode;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly string[];
  readonly tone?: "default" | "orange";
  readonly value: string;
}

export function ToroSelect({
  ariaLabel,
  className,
  icon,
  onValueChange,
  options,
  tone = "default",
  value,
}: ToroSelectProps) {
  return (
    <Select.Root
      items={options.map((option) => ({ label: option, value: option }))}
      modal={false}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onValueChange(String(nextValue));
      }}
      value={value}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-8 max-w-36 items-center gap-1 rounded-md px-1 text-sm font-medium outline-none hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-zinc-300 dark:hover:bg-zinc-700/70 dark:focus-visible:ring-zinc-600",
          tone === "orange" ? "text-orange-600" : "text-zinc-500 dark:text-zinc-400",
          className,
        )}
        data-base-ui-select="true"
      >
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <Select.Value>
          {(selectedValue) => (
            <span className="truncate">{selectedValue ? String(selectedValue) : value}</span>
          )}
        </Select.Value>
        <Select.Icon className="shrink-0 text-current">
          <ChevronDown size={13} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" sideOffset={6}>
          <Select.Popup className="min-w-[var(--anchor-width)] rounded-lg border border-zinc-200 bg-white p-1 text-sm text-zinc-900 shadow-lg outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  className="flex h-8 cursor-default items-center rounded-md px-2 outline-none data-[highlighted]:bg-zinc-100 data-[selected]:font-medium dark:data-[highlighted]:bg-zinc-800"
                  key={option}
                  value={option}
                >
                  <Select.ItemText>{option}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
