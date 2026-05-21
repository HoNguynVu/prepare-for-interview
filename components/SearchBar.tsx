"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import type { Locale, TopicId } from "@/lib/navigation";
import { topicMap } from "@/lib/navigation";
import { cn } from "@/lib/cn";

interface Doc {
  id: string;
  locale: Locale;
  topic: TopicId;
  slug: string;
  title: string;
  description: string;
  body: string;
}

interface Result {
  id: string;
  topic: TopicId;
  slug: string;
  title: string;
  snippet: string;
}

export function SearchBar({ locale, placeholder }: { locale: Locale; placeholder: string }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const ensureDocs = useCallback(async () => {
    if (docs || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?locale=${locale}`);
      const data = (await res.json()) as Doc[];
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }, [docs, loading, locale]);

  const results = useMemo<Result[]>(() => {
    if (!q.trim() || !docs) return [];
    const needle = q.toLowerCase();
    const matches: Result[] = [];
    for (const d of docs) {
      if (d.locale !== locale) continue;
      const hay = `${d.title}\n${d.description}\n${d.body}`.toLowerCase();
      const idx = hay.indexOf(needle);
      if (idx === -1) continue;
      const start = Math.max(0, idx - 40);
      const snippet = (d.body || d.description || d.title).slice(0, 200);
      matches.push({ id: d.id, topic: d.topic, slug: d.slug, title: d.title, snippet });
      if (matches.length >= 12) break;
    }
    return matches;
  }, [q, docs, locale]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setOpen(true);
            ensureDocs();
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-12 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-brand-500 dark:focus:ring-brand-950"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Ctrl K
        </kbd>
      </div>
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[60vh] overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 thin-scrollbar">
          {loading && (
            <div className="flex items-center gap-2 p-3 text-xs text-zinc-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              loading index...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-3 text-xs text-zinc-500">No results.</div>
          )}
          {results.map((r) => {
            const topic = topicMap[r.topic];
            const Icon = topic.icon;
            return (
              <Link
                key={r.id}
                href={`/${locale}/topic/${r.topic}/${r.slug}`}
                className={cn(
                  "block border-b border-zinc-100 px-3 py-2 transition last:border-b-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
                )}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{topic.title[locale]}</span>
                </div>
                <div className="mt-0.5 text-sm font-medium">{r.title}</div>
                <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{r.snippet}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
