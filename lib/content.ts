import "server-only";
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale, TopicId, Level } from "./navigation";

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
  content: string;
}

export const getLessonSlugs = cache((locale: Locale, topic: TopicId): string[] => {
  const dir = path.join(CONTENT_ROOT, locale, topic);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
});

export const getLesson = cache((locale: Locale, topic: TopicId, slug: string): Lesson | null => {
  const dir = path.join(CONTENT_ROOT, locale, topic);
  const candidates = [path.join(dir, `${slug}.mdx`), path.join(dir, `${slug}.md`)];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    order: data.order ?? 999,
    level: (data.level ?? "beginner") as Level,
    tags: data.tags ?? [],
    content,
  };
});

export const getLessons = cache((locale: Locale, topic: TopicId): LessonMeta[] => {
  const slugs = getLessonSlugs(locale, topic);
  const lessons = slugs
    .map((slug) => getLesson(locale, topic, slug))
    .filter((l): l is Lesson => l !== null)
    .map(({ content: _content, ...meta }) => meta);
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
          body: lesson.content.slice(0, 4000),
        });
      }
    }
  }
  return out;
}
