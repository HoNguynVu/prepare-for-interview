import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { locales, topics, topicMap, levelLabels, type Locale, type TopicId, type Level } from "@/lib/navigation";
import { getLessons } from "@/lib/content";
import { getMessages, t } from "@/lib/i18n";

export function generateStaticParams() {
  const out: { locale: string; topic: string }[] = [];
  for (const l of locales) for (const t of topics) out.push({ locale: l, topic: t.id });
  return out;
}

export default function TopicPage({ params }: { params: { locale: string; topic: string } }) {
  if (!locales.includes(params.locale as Locale)) notFound();
  if (!(params.topic in topicMap)) notFound();
  const locale = params.locale as Locale;
  const topicId = params.topic as TopicId;
  const topic = topicMap[topicId];
  const Icon = topic.icon;
  const m = getMessages(locale);
  const lessons = getLessons(locale, topicId);

  const groups: Record<Level, typeof lessons> = { beginner: [], intermediate: [], advanced: [] };
  for (const l of lessons) groups[l.level].push(l);

  const groupOrder: Level[] = ["beginner", "intermediate", "advanced"];
  const groupLabelKey: Record<Level, string> = {
    beginner: "topic.groupBeginner",
    intermediate: "topic.groupIntermediate",
    advanced: "topic.groupAdvanced",
  };

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href={`/${locale}`} className="hover:text-zinc-900 dark:hover:text-zinc-200">
          {t(m, "nav.home")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-zinc-700 dark:text-zinc-300">{topic.title[locale]}</span>
      </nav>

      <header className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${topic.color} p-6 text-white dark:border-zinc-800`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <Icon className="h-8 w-8" />
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{topic.title[locale]}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">{topic.description[locale]}</p>
        <p className="mt-3 text-xs text-white/75">
          {lessons.length} {locale === "vi" ? "bài học" : "lessons"}
        </p>
      </header>

      <section className="mt-8">
        {lessons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {t(m, "topic.noLessons")}
          </p>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((g) => {
              const items = groups[g];
              if (items.length === 0) return null;
              return (
                <div key={g}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {t(m, groupLabelKey[g])}
                  </h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {items.map((l) => (
                      <li key={l.slug}>
                        <Link
                          href={`/${locale}/topic/${topicId}/${l.slug}`}
                          className="group block rounded-lg border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-brand-700"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-medium tracking-tight">{l.title}</h3>
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                              {levelLabels[l.level][locale]}
                            </span>
                          </div>
                          {l.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{l.description}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
