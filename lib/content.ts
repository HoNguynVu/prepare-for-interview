import "server-only";
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale, TopicId, Level } from "./navigation";
import { chapterSearchText, normalizeLevel, type Chapter } from "./chapter";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface LessonMeta {
  slug: string;
  title: string;
  description?: string;
  order: number;
  level: Level;
  tags?: string[];
}

export interface Lesson extends LessonMeta {
  /** MDX source. Empty for structured chapters. */
  content: string;
  /** Set when the lesson is a structured chapter (.json) instead of MDX. */
  chapter?: Chapter;
  /** Set when the requested locale has no translation and this one is shown instead. */
  fallbackLocale?: Locale;
}

const FALLBACK_LOCALE: Locale = "vi";

interface LessonFile {
  file: string;
  locale: Locale;
}

/**
 * Lesson files of a topic, keyed by slug. Structured chapters (.json) are written once
 * (in the fallback locale) and are shared with locales that have no translation yet.
 */
const getLessonFiles = cache((locale: Locale, topic: TopicId): Map<string, LessonFile> => {
  const out = new Map<string, LessonFile>();
  const scan = (loc: Locale, onlyJson: boolean) => {
    const dir = path.join(CONTENT_ROOT, loc, topic);
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      const ext = path.extname(f);
      if (![".mdx", ".md", ".json"].includes(ext)) continue;
      if (onlyJson && ext !== ".json") continue;
      const slug = f.slice(0, -ext.length);
      if (!out.has(slug)) out.set(slug, { file: path.join(dir, f), locale: loc });
    }
  };
  scan(locale, false);
  if (locale !== FALLBACK_LOCALE) scan(FALLBACK_LOCALE, true);
  return out;
});

export const getLessonSlugs = cache((locale: Locale, topic: TopicId): string[] => {
  return [...getLessonFiles(locale, topic).keys()];
});

export const getLesson = cache((locale: Locale, topic: TopicId, slug: string): Lesson | null => {
  const entry = getLessonFiles(locale, topic).get(slug);
  if (!entry) return null;
  const raw = fs.readFileSync(entry.file, "utf-8");
  const fallbackLocale = entry.locale !== locale ? entry.locale : undefined;

  if (entry.file.endsWith(".json")) {
    const chapter = (JSON.parse(raw) as { chapter?: Chapter }).chapter;
    if (!chapter || !Array.isArray(chapter.sections) || !Array.isArray(chapter.questions)) {
      throw new Error(`${entry.file}: expected a "chapter" object with "sections" and "questions" arrays`);
    }
    return {
      slug,
      title: chapter.title,
      description: chapter.subtitle ?? "",
      order: chapter.order ?? 999,
      level: normalizeLevel(chapter.level),
      tags: [],
      content: "",
      chapter,
      fallbackLocale,
    };
  }

  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: data.order ?? 999,
    level: (data.level ?? "beginner") as Level,
    tags: data.tags ?? [],
    content,
    fallbackLocale,
  };
});

export const getLessons = cache((locale: Locale, topic: TopicId): LessonMeta[] => {
  const slugs = getLessonSlugs(locale, topic);
  const lessons = slugs
    .map((slug) => getLesson(locale, topic, slug))
    .filter((l): l is Lesson => l !== null)
    .map(({ content: _content, chapter: _chapter, fallbackLocale: _fb, ...meta }) => meta);
  return lessons.sort((a, b) => a.order - b.order);
});

export function getAdjacentLessons(
  locale: Locale,
  topic: TopicId,
  slug: string
): { prev: LessonMeta | null; next: LessonMeta | null } {
  const lessons = getLessons(locale, topic);
  const idx = lessons.findIndex((l) => l.slug === slug);
  return {
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx >= 0 && idx < lessons.length - 1 ? lessons[idx + 1] : null,
  };
}

export interface SearchEntry {
  id: string;
  locale: Locale;
  topic: TopicId;
  slug: string;
  title: string;
  description: string;
  body: string;
}

export function getAllSearchEntries(): SearchEntry[] {
  const out: SearchEntry[] = [];
  const locales: Locale[] = ["en", "vi"];
  const topicIds: TopicId[] = ["oop", "network", "os", "dsa", "auth", "other"];
  for (const locale of locales) {
    for (const topic of topicIds) {
      const slugs = getLessonSlugs(locale, topic);
      for (const slug of slugs) {
        const lesson = getLesson(locale, topic, slug);
        if (!lesson) continue;
        out.push({
          id: `${locale}/${topic}/${slug}`,
          locale,
          topic,
          slug,
          title: lesson.title,
          description: lesson.description ?? "",
          body: lesson.chapter ? chapterSearchText(lesson.chapter).slice(0, 12000) : lesson.content.slice(0, 4000),
        });
      }
    }
  }
  return out;
}
