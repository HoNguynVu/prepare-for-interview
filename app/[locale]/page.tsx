import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { locales, topics, type Locale } from "@/lib/navigation";
import { getLessons } from "@/lib/content";
import { getMessages, t } from "@/lib/i18n";
import { TopicCard } from "@/components/TopicCard";

export default function HomePage({ params }: { params: { locale: string } }) {
  if (!locales.includes(params.locale as Locale)) notFound();
  const locale = params.locale as Locale;
  const m = getMessages(locale);

  const counts: Record<string, number> = {};
  let total = 0;
  for (const topic of topics) {
    const n = getLessons(locale, topic.id).length;
    counts[topic.id] = n;
    total += n;
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-brand-50 via-white to-purple-50 px-6 py-10 sm:px-10 sm:py-14 dark:border-zinc-800 dark:from-brand-950/50 dark:via-zinc-950 dark:to-purple-950/40">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm dark:border-brand-800/60 dark:bg-zinc-900 dark:text-brand-300">
            <Sparkles className="h-3 w-3" /> {t(m, "site.tagline")}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{t(m, "home.heroTitle")}</h1>
          <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">{t(m, "home.heroSubtitle")}</p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`/${locale}/topic/${topics[0].id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {t(m, "home.browseTopics")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-zinc-500">
              {topics.length} {locale === "vi" ? "chủ đề" : "topics"} · {total} {locale === "vi" ? "bài học" : "lessons"}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">
          {locale === "vi" ? "Khám phá chủ đề" : "Explore topics"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              locale={locale}
              lessonsCount={counts[topic.id]}
              lessonsLabel={t(m, "home.lessonsCount", { count: counts[topic.id] })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
