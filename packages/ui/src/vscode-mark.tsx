export interface VsCodeMarkProps {
  readonly className?: string;
  readonly size?: number;
}

export function VsCodeMark({ className, size = 16 }: VsCodeMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-vscode-mark="true"
      fill="none"
      height={size}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M11.3 1.7 4.8 7.3 2.1 5.1 1 5.9v4.2l1.1.8 2.7-2.2 6.5 5.6 3.7-1.6V3.3l-3.7-1.6Z"
        fill="#007ACC"
      />
      <path d="M11.4 4.8 7.1 8l4.3 3.2V4.8Z" fill="#33A6F2" />
    </svg>
  );
}
