import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { locales, topics, topicMap, type Locale, type TopicId } from "@/lib/navigation";
import { getLesson, getLessonSlugs, getAdjacentLessons } from "@/lib/content";
import { getMessages, t } from "@/lib/i18n";
import { MDXContent } from "@/components/MDXContent";
import { TableOfContents, type TocItem } from "@/components/TableOfContents";

export function generateStaticParams() {
  const out: { locale: string; topic: string; slug: string }[] = [];
  for (const l of locales) {
    for (const top of topics) {
      for (const slug of getLessonSlugs(l, top.id)) {
        out.push({ locale: l, topic: top.id, slug });
      }
    }
  }
  return out;
}

function extractToc(md: string): TocItem[] {
  const out: TocItem[] = [];
  const seen = new Set<string>();
  const lines = md.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1].length - 1;
    const text = m[2].replace(/[*_`]/g, "").trim();
    let id = text.toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    if (!id) continue;
    let unique = id;
    let i = 1;
    while (seen.has(unique)) unique = `${id}-${i++}`;
    seen.add(unique);
    out.push({ id: unique, text, depth });
  }
  return out;
}

export default function LessonPage({ params }: { params: { locale: string; topic: string; slug: string } }) {
  if (!locales.includes(params.locale as Locale)) notFound();
  if (!(params.topic in topicMap)) notFound();
  const locale = params.locale as Locale;
  const topicId = params.topic as TopicId;
  const topic = topicMap[topicId];
  const m = getMessages(locale);
  const lesson = getLesson(locale, topicId, params.slug);
  if (!lesson) notFound();
  const { prev, next } = getAdjacentLessons(locale, topicId, params.slug);
  const toc = extractToc(lesson.content);

  return (
    <div className="grid gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr,220px] lg:gap-10 lg:px-10">
      <article className="min-w-0">
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          <Link href={`/${locale}`} className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {t(m, "nav.home")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/${locale}/topic/${topicId}`} className="hover:text-zinc-900 dark:hover:text-zinc-200">
            {topic.title[locale]}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-700 dark:text-zinc-300">{lesson.title}</span>
        </nav>

        <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
          {lesson.description && (
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
          )}
          {lesson.tags && lesson.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {lesson.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose-app">
          <MDXContent source={lesson.content} />
        </div>

        <nav className="mt-12 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2 dark:border-zinc-800">
          {prev ? (
            <Link
              href={`/${locale}/topic/${topicId}/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 transition hover:border-brand-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-brand-700 dark:hover:bg-zinc-900"
            >
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <ChevronLeft className="h-3 w-3" /> {t(m, "lesson.previous")}
              </span>
              <span className="font-medium tracking-tight group-hover:text-brand-700 dark:group-hover:text-brand-300">{prev.title}</span>
            </Link>
          ) : <div />}
          {next ? (
            <Link
              href={`/${locale}/topic/${topicId}/${next.slug}`}
              className="group flex flex-col items-end gap-1 rounded-lg border border-zinc-200 p-4 text-right transition hover:border-brand-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-brand-700 dark:hover:bg-zinc-900"
            >
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                {t(m, "lesson.next")} <ChevronRight className="h-3 w-3" />
              </span>
              <span className="font-medium tracking-tight group-hover:text-brand-700 dark:group-hover:text-brand-300">{next.title}</span>
            </Link>
          ) : <div />}
        </nav>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TableOfContents items={toc} label={t(m, "lesson.tableOfContents")} />
        </div>
      </aside>
    </div>
  );
}
