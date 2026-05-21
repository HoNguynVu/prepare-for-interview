"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export function TableOfContents({ items, label }: { items: TocItem[]; label: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <ul className="space-y-1.5 border-l border-zinc-200 dark:border-zinc-800">
        {items.map((it) => (
          <li key={it.id} style={{ paddingLeft: `${(it.depth - 1) * 12}px` }}>
            <a
              href={`#${it.id}`}
              onClick={() => {
                const el = document.getElementById(it.id);
                if (el?.tagName === "DETAILS") (el as HTMLDetailsElement).open = true;
              }}
              className={cn(
                "-ml-px block border-l border-transparent py-0.5 pl-3 text-xs transition",
                active === it.id
                  ? "border-zinc-500 font-medium text-zinc-800 dark:border-zinc-400 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {it.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
