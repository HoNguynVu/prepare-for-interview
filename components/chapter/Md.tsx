import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Minimal renderer for the Markdown subset used by chapter data:
 * paragraphs (blank line), **bold** and `inline code`. No HTML is ever injected.
 */

const TOKEN = /(\*\*(?:[^*]|\*(?!\*))+\*\*|`[^`]+`)/g;

const codeClass =
  "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";

function renderInline(text: string): ReactNode[] {
  return text
    .split(TOKEN)
    .filter(Boolean)
    .map((part, i) => {
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {renderInline(part.slice(2, -2))}
          </strong>
        );
      }
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className={codeClass}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <Fragment key={i}>{part}</Fragment>;
    });
}

export function MdInline({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

export function Md({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className={cn("space-y-3 leading-7", className)}>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}
