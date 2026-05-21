import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Locale, Topic } from "@/lib/navigation";

export function TopicCard({
  topic,
  locale,
  lessonsCount,
  lessonsLabel,
}: {
  topic: Topic;
  locale: Locale;
  lessonsCount: number;
  lessonsLabel: string;
}) {
  const Icon = topic.icon;
  return (
    <Link
      href={`/${locale}/topic/${topic.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-brand-700"
    >
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${topic.color} opacity-10 blur-2xl transition group-hover:opacity-20`} />
      <div className="flex items-center gap-3">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${topic.color} text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold tracking-tight">{topic.title[locale]}</h3>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{topic.description[locale]}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>{lessonsLabel}</span>
        <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-300" />
      </div>
    </Link>
  );
}
