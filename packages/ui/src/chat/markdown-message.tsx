import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components as ReactMarkdownComponents } from "react-markdown";
import { Streamdown, type Components as StreamdownComponents } from "streamdown";
import { cn } from "../cn";

export interface CodexMarkdownMessageProps {
  readonly children: string;
  readonly isStreaming?: boolean;
}

export function CodexMarkdownMessage({ children, isStreaming }: CodexMarkdownMessageProps) {
  if (isStreaming) {
    return (
      <div data-markdown-renderer="streamdown">
        <Streamdown
          animated={{ duration: 120, sep: "word", stagger: 8 }}
          className="space-y-3"
          components={markdownComponents as StreamdownComponents}
          controls={false}
          isAnimating
          lineNumbers={false}
          mode="streaming"
          parseIncompleteMarkdown
          skipHtml
        >
          {children}
        </Streamdown>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-markdown-renderer="react-markdown">
      <ReactMarkdown components={markdownComponents as ReactMarkdownComponents} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}

type MarkdownAnchorProps = ComponentPropsWithoutRef<"a"> & { readonly node?: unknown };
type MarkdownBlockquoteProps = ComponentPropsWithoutRef<"blockquote"> & {
  readonly node?: unknown;
};
type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & { readonly node?: unknown };
type MarkdownHeadingProps = ComponentPropsWithoutRef<"h3"> & { readonly node?: unknown };
type MarkdownListItemProps = ComponentPropsWithoutRef<"li"> & { readonly node?: unknown };
type MarkdownListProps = ComponentPropsWithoutRef<"ol"> & { readonly node?: unknown };
type MarkdownUnorderedListProps = ComponentPropsWithoutRef<"ul"> & { readonly node?: unknown };
type MarkdownParagraphProps = ComponentPropsWithoutRef<"p"> & { readonly node?: unknown };
type MarkdownPreProps = ComponentPropsWithoutRef<"pre"> & { readonly node?: unknown };
type MarkdownTableProps = ComponentPropsWithoutRef<"table"> & { readonly node?: unknown };
type MarkdownTableCellProps = ComponentPropsWithoutRef<"td"> & { readonly node?: unknown };
type MarkdownTableHeaderProps = ComponentPropsWithoutRef<"th"> & { readonly node?: unknown };

const markdownComponents = {
  a({ children, className, href, node: _node, ...props }: MarkdownAnchorProps) {
    return (
      <a
        className={cn(
          "font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-600",
          className,
        )}
        href={href}
        rel="noreferrer"
        target={href?.startsWith("#") ? undefined : "_blank"}
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote({ children, className, node: _node, ...props }: MarkdownBlockquoteProps) {
    return (
      <blockquote
        className={cn(
          "border-l-2 border-zinc-200 pl-3 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300",
          className,
        )}
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  code({ children, className, node: _node, ...props }: MarkdownCodeProps) {
    const isBlock = className?.includes("language-");
    return (
      <code
        className={cn(
          isBlock
            ? "font-mono text-xs text-zinc-700 dark:text-zinc-200"
            : "rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.88em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,
  inlineCode({ children, className, node: _node, ...props }: MarkdownCodeProps) {
    return (
      <code
        className={cn(
          "rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.88em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  li({ children, className, node: _node, ...props }: MarkdownListItemProps) {
    return (
      <li className={cn("pl-1 leading-7", className)} {...props}>
        {children}
      </li>
    );
  },
  ol({ children, className, node: _node, ...props }: MarkdownListProps) {
    return (
      <ol className={cn("ml-5 list-decimal space-y-1", className)} {...props}>
        {children}
      </ol>
    );
  },
  p({ children, className, node: _node, ...props }: MarkdownParagraphProps) {
    return (
      <p className={cn("my-0 leading-7", className)} {...props}>
        {children}
      </p>
    );
  },
  pre({ children, className, node: _node, ...props }: MarkdownPreProps) {
    return (
      <pre
        className={cn(
          "overflow-x-auto rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-5 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    );
  },
  table({ children, className, node: _node, ...props }: MarkdownTableProps) {
    return (
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-sm", className)} {...props}>
          {children}
        </table>
      </div>
    );
  },
  td({ children, className, node: _node, ...props }: MarkdownTableCellProps) {
    return (
      <td
        className={cn("border border-zinc-200 px-2 py-1 dark:border-zinc-700", className)}
        {...props}
      >
        {children}
      </td>
    );
  },
  th({ children, className, node: _node, ...props }: MarkdownTableHeaderProps) {
    return (
      <th
        className={cn(
          "border border-zinc-200 bg-zinc-50 px-2 py-1 text-left font-medium dark:border-zinc-700 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        {children}
      </th>
    );
  },
  ul({ children, className, node: _node, ...props }: MarkdownUnorderedListProps) {
    return (
      <ul className={cn("ml-5 list-disc space-y-1", className)} {...props}>
        {children}
      </ul>
    );
  },
};

function Heading({ children, className, node: _node, ...props }: MarkdownHeadingProps) {
  return (
    <h3 className={cn("my-0 text-base font-semibold leading-7", className)} {...props}>
      {children}
    </h3>
  );
}
