import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Minimal renderer for the Markdown subset used by chapter data.
 * Inline: **bold** and `inline code`.
 * Blocks: paragraphs (blank line), ### headings, ``` code fences, GFM tables,
 * and "-" / "1." lists (nested by indentation). No HTML is ever injected.
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

// ---- block parsing ----------------------------------------------------------

interface ListItem {
  text: string;
  children?: ListBlock;
}
interface ListBlock {
  kind: "list";
  ordered: boolean;
  items: ListItem[];
}
type Block =
  | { kind: "p"; text: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "code"; text: string }
  | { kind: "table"; header: string[]; rows: string[][] }
  | ListBlock;

const FENCE = /^\s*```/;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const LIST_ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

const indentOf = (line: string) => line.length - line.trimStart().length;
const splitRow = (line: string) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

function isTableStart(lines: string[], i: number) {
  return TABLE_ROW.test(lines[i]) && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]);
}

function isBlockStart(lines: string[], i: number) {
  const l = lines[i];
  return FENCE.test(l) || HEADING.test(l) || LIST_ITEM.test(l) || isTableStart(lines, i);
}

/** Parses list lines starting at `start`; returns the list and the index after it. */
function parseList(lines: string[], start: number): [ListBlock, number] {
  const baseIndent = indentOf(lines[start]);
  const ordered = /^\d/.test(LIST_ITEM.exec(lines[start])![2]);
  const list: ListBlock = { kind: "list", ordered, items: [] };
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) break;
    const m = LIST_ITEM.exec(line);
    const indent = indentOf(line);
    if (m && indent === baseIndent) {
      list.items.push({ text: m[3] });
      i++;
    } else if (m && indent > baseIndent && list.items.length) {
      const [child, next] = parseList(lines, i);
      list.items[list.items.length - 1].children = child;
      i = next;
    } else if (!m && indent > baseIndent && list.items.length) {
      // continuation line of the previous item
      list.items[list.items.length - 1].text += "\n" + line.trim();
      i++;
    } else {
      break;
    }
  }
  return [list, i];
}

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (FENCE.test(line)) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }
    const h = HEADING.exec(line);
    if (h) {
      blocks.push({ kind: "heading", level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (isTableStart(lines, i)) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) rows.push(splitRow(lines[i++]));
      blocks.push({ kind: "table", header, rows });
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const [list, next] = parseList(lines, i);
      blocks.push(list);
      i = next;
      continue;
    }
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) para.push(lines[i++]);
    blocks.push({ kind: "p", text: para.join("\n") });
  }
  return blocks;
}

// ---- block rendering --------------------------------------------------------

function MdList({ list }: { list: ListBlock }) {
  const Tag = list.ordered ? "ol" : "ul";
  return (
    <Tag className={cn("space-y-1.5 pl-5", list.ordered ? "list-decimal" : "list-disc")}>
      {list.items.map((item, i) => (
        <li key={i} className="whitespace-pre-line pl-1 marker:text-zinc-400">
          {renderInline(item.text)}
          {item.children && (
            <div className="mt-1.5">
              <MdList list={item.children} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  );
}

function renderBlock(b: Block, key: number): ReactNode {
  switch (b.kind) {
    case "heading":
      return (
        <h3 key={key} className="pt-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {renderInline(b.text)}
        </h3>
      );
    case "code":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-[13px] leading-6 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
        >
          <code>{b.text}</code>
        </pre>
      );
    case "table":
      return (
        <div key={key} className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
              <tr>
                {b.header.map((c, j) => (
                  <th key={j} className="whitespace-nowrap px-3 py-2 font-semibold">
                    {renderInline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {b.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top leading-6">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "list":
      return <MdList key={key} list={b} />;
    default:
      return (
        <p key={key} className="whitespace-pre-line">
          {renderInline(b.text)}
        </p>
      );
  }
}

export function Md({ text, className }: { text: string; className?: string }) {
  return <div className={cn("space-y-3 leading-7", className)}>{parseBlocks(text).map(renderBlock)}</div>;
}
