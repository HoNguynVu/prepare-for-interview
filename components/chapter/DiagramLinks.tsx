import type { ChapterLink, Labeler } from "@/lib/chapter";

export function DiagramLinks({ refs = [], links, L }: { refs?: string[]; links: Record<string, ChapterLink>; L: Labeler }) {
  const diagrams = [...new Set(refs)].flatMap((id) => links[id] ? [links[id]] : []);
  if (!diagrams.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-zinc-500">{L("relatedDiagrams")}:</span>
      {diagrams.map((diagram) => (
        <a key={diagram.href} href={diagram.href} className="rounded-md border border-zinc-200 px-2 py-1 text-brand-600 hover:underline dark:border-zinc-700 dark:text-brand-400">
          {diagram.title}
        </a>
      ))}
    </div>
  );
}
