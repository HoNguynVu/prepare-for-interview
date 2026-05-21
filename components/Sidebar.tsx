"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { topics, type Locale } from "@/lib/navigation";
import type { LessonMeta } from "@/lib/content";
import { cn } from "@/lib/cn";

interface SidebarProps {
  locale: Locale;
  lessonsByTopic: Record<string, LessonMeta[]>;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ locale, lessonsByTopic, open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const t of topics) {
      init[t.id] = pathname.includes(`/topic/${t.id}`);
    }
    return init;
  });

  return (
    <>
      {/* mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-sm transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800 lg:hidden">
          <span className="font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="h-[calc(100%-4rem)] overflow-y-auto px-3 py-4 lg:h-full">
          <ul className="space-y-1">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const lessons = lessonsByTopic[topic.id] ?? [];
              const isOpen = expanded[topic.id];
              const topicHref = `/${locale}/topic/${topic.id}`;
              const isActive = pathname.startsWith(topicHref);
              return (
                <li key={topic.id}>
                  <div className="flex items-stretch">
                    <Link
                      href={topicHref}
                      onClick={() => {
                        setExpanded((e) => ({ ...e, [topic.id]: true }));
                        onClose();
                      }}
                      className={cn(
                        "flex flex-1 items-center gap-2 rounded-l-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-800 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{topic.title[locale]}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => ({ ...e, [topic.id]: !e[topic.id] }))}
                      className={cn(
                        "rounded-r-lg px-2 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                        isActive && "dark:bg-zinc-800/60"
                      )}
                      aria-label="Toggle"
                    >
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
                      />
                    </button>
                  </div>
                  {isOpen && lessons.length > 0 && (
                    <ul className="ml-6 mt-1 space-y-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
                      {lessons.map((lesson) => {
                        const href = `/${locale}/topic/${topic.id}/${lesson.slug}`;
                        const isLessonActive = pathname === href;
                        return (
                          <li key={lesson.slug}>
                            <Link
                              href={href}
                              onClick={onClose}
                              className={cn(
                                "block rounded-md px-2 py-1.5 text-xs transition",
                                isLessonActive
                                  ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                              )}
                            >
                              {lesson.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
