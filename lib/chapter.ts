import { levelLabels, type Level } from "./navigation";
import type { Messages } from "./i18n";

/**
 * Schema of a structured "chapter" file (content/<locale>/<topic>/<slug>.json).
 * Every chapter of a course uses this same shape, so adding a chapter = adding a file.
 */

export interface ChapterQuestion {
  id: string;
  /** "lesson" = from the lesson itself, "extra" = additional likely question */
  source: string;
  type: string;
  difficulty: string;
  tags?: string[];
  question: string;
  answer_short: string;
  answer_md: string;
  follow_ups?: string[];
}

export interface ChapterLayerInfo {
  osi_number: number;
  osi_name: string;
  vi_name?: string;
  tcpip_layer?: string;
  pdu?: string;
  addressing?: string;
  protocols?: string[];
  devices?: string[];
}

export interface WalkthroughStep {
  layer: string;
  action_md: string;
}

export interface ChapterWalkthrough {
  send_steps?: WalkthroughStep[];
  in_transit_md?: string;
  receive_steps?: WalkthroughStep[];
  what_changes?: { field: string; behavior: string }[];
}

export interface ChapterSection {
  id: string;
  order?: number;
  title: string;
  type?: string;
  content_md?: string;
  key_points?: string[];
  analogy?: string;
  layer?: ChapterLayerInfo;
  examples?: string[];
  common_errors?: string[];
  backend_relevance?: string;
  diagram_ref?: string;
  walkthrough?: ChapterWalkthrough;
  error_to_layer_map?: { symptom: string; layer: string; meaning: string }[];
  question_ids?: string[];
}

export interface ChapterDiagram {
  description?: string;
  rows: {
    layer: string;
    pdu?: string;
    blocks: { label: string; role: string }[];
  }[];
  legend?: Record<string, string>;
}

export interface Chapter {
  id: string;
  order: number;
  slug?: string;
  title: string;
  subtitle?: string;
  level?: string;
  estimated_study_minutes?: number;
  learning_objectives?: string[];
  sections: ChapterSection[];
  summary_table?: { columns: string[]; rows: string[][]; footnote?: string };
  mnemonics?: { purpose: string; text: string; mapping?: string }[];
  header_sizes?: { header: string; size: string }[];
  diagrams?: Record<string, ChapterDiagram>;
  questions: ChapterQuestion[];
  exercises?: { id: string; prompt: string; answer_md: string }[];
  quiz?: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correct_option_id: string;
    explanation?: string;
  }[];
  key_takeaways?: string[];
  references?: { title: string; url: string; type?: string; note?: string }[];
  next_chapter?: { id: string; title: string };
}

/** "beginner-intermediate" -> "beginner" so it fits the site's Level groups. */
export function normalizeLevel(raw?: string): Level {
  const first = (raw ?? "").split("-")[0];
  return first in levelLabels ? (first as Level) : "beginner";
}

/** Plain text of a chapter, used for the search index. */
export function chapterSearchText(c: Chapter): string {
  const parts: string[] = [c.subtitle ?? "", ...(c.learning_objectives ?? [])];
  for (const s of c.sections) {
    parts.push(s.title, s.content_md ?? "", ...(s.key_points ?? []));
  }
  for (const q of c.questions) parts.push(q.question, q.answer_short);
  return parts.join("\n").replace(/[*`]/g, "");
}

// ---- UI labels --------------------------------------------------------------

export type Labeler = (key: string, vars?: Record<string, string | number>) => string;

/** Flatten messages.chapter into {"difficulty.easy": "..."} so client components can take it as a prop. */
export function chapterLabels(m: Messages): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (obj: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") out[prefix + k] = v;
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, `${prefix}${k}.`);
    }
  };
  walk(m.chapter as unknown as Record<string, unknown>, "");
  return out;
}

export function makeLabeler(labels: Record<string, string>): Labeler {
  return (key, vars) => {
    let s = labels[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}

// ---- Table of contents ------------------------------------------------------

export const CHAPTER_ANCHORS = {
  quickRef: "quick-reference",
  questionBank: "question-bank",
  exercises: "exercises",
  quiz: "quiz",
  takeaways: "takeaways",
  references: "references",
} as const;

export function hasQuickRef(c: Chapter): boolean {
  return !!(c.summary_table || c.mnemonics?.length || c.header_sizes?.length);
}

export function chapterToc(c: Chapter, L: Labeler): { id: string; text: string; depth: number }[] {
  const toc = [...c.sections]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => ({ id: s.id, text: s.title, depth: 1 }));
  if (hasQuickRef(c)) toc.push({ id: CHAPTER_ANCHORS.quickRef, text: L("quickReference"), depth: 1 });
  if (c.questions.length) toc.push({ id: CHAPTER_ANCHORS.questionBank, text: L("questionBank"), depth: 1 });
  if (c.exercises?.length) toc.push({ id: CHAPTER_ANCHORS.exercises, text: L("exercises"), depth: 1 });
  if (c.quiz?.length) toc.push({ id: CHAPTER_ANCHORS.quiz, text: L("quiz"), depth: 1 });
  if (c.key_takeaways?.length) toc.push({ id: CHAPTER_ANCHORS.takeaways, text: L("takeaways"), depth: 1 });
  if (c.references?.length) toc.push({ id: CHAPTER_ANCHORS.references, text: L("references"), depth: 1 });
  return toc;
}
