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
  diagram_refs?: string[];
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

export interface ChapterTable {
  columns: string[];
  rows: string[][];
}

export interface WorkedExample {
  title: string;
  steps_md: string[];
}

export interface ChapterImage {
  id?: string;
  diagram_ref: string;
  alt?: string;
  caption?: string;
}

export interface ChapterLink {
  href: string;
  title: string;
}

export interface ChapterSection {
  id: string;
  order?: number;
  title: string;
  /** theory | layer | walkthrough | practice | worked_examples | deep_dive | summary */
  type?: string;
  content_md?: string;
  key_points?: string[];
  analogy?: string;
  layer?: ChapterLayerInfo;
  examples?: string[];
  common_errors?: string[];
  backend_relevance?: string;
  diagram_ref?: string;
  diagram_refs?: string[];
  images?: ChapterImage[];
  code_examples?: { language: string; title: string; code: string; note?: string }[];
  commands?: { platform: string; command: string; purpose: string }[];
  reference_ids?: string[];
  walkthrough?: ChapterWalkthrough;
  error_to_layer_map?: { symptom: string; layer: string; meaning: string }[];
  table?: ChapterTable;
  comparison_table?: ChapterTable;
  worked_examples?: WorkedExample[];
  question_ids?: string[];
}

/** Layered header/data blocks (OSI encapsulation). Has no `type` in the data. */
export interface EncapsulationDiagramData {
  type?: "encapsulation";
  description?: string;
  rows: {
    layer: string;
    pdu?: string;
    blocks: { label: string; role: string }[];
  }[];
  legend?: Record<string, string>;
}

export interface FlowchartDiagramData {
  type: "flowchart";
  description?: string;
  nodes: { id: string; label: string; shape?: "decision" | string }[];
  edges: { from: string; to: string; label?: string }[];
}

export interface NatTableDiagramData {
  type: "nat_table";
  description?: string;
  inside: { device: string; ip_port: string }[];
  router: { public_ip: string; nat_table: { inside: string; outside: string }[] };
  server: string;
  caption?: string;
}

/** Embedded artwork supplied by a chapter; render as an image, never injected HTML. */
export interface ImageDiagramData {
  type: "illustration" | "sequence" | "chart";
  title: string;
  description?: string;
  caption?: string;
  image_url: string;
  svg_image_url?: string;
  mime_type?: string;
  width: number;
  height: number;
  alt?: string;
  reading_steps?: string[];
  participants?: string[];
  messages?: { from: string; to: string; label: string; lost?: boolean }[];
  chart_data?: { x_unit: string; y_unit: string; values: number[]; illustrative_only: boolean };
}

export type ChapterDiagram = EncapsulationDiagramData | FlowchartDiagramData | NatTableDiagramData | ImageDiagramData;

export interface Chapter {
  id: string;
  order: number;
  slug?: string;
  title: string;
  subtitle?: string;
  level?: string;
  estimated_study_minutes?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  sections: ChapterSection[];
  summary_table?: { columns: string[]; rows: string[][]; footnote?: string };
  mnemonics?: { purpose: string; text: string; mapping?: string }[];
  header_sizes?: { header: string; size: string }[];
  diagrams?: Record<string, ChapterDiagram>;
  questions: ChapterQuestion[];
  exercises?: { id: string; prompt: string; answer_md: string; diagram_refs?: string[] }[];
  quiz?: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correct_option_id: string;
    explanation?: string;
  }[];
  key_takeaways?: string[];
  references?: { id?: string; title: string; url: string; type?: string; note?: string }[];
  next_chapter?: { id: string; title: string };
}

/** New chapters may name several diagrams; the original single ref remains a fallback. */
export function sectionDiagrams(section: ChapterSection, chapter: Chapter) {
  const refs = [...(section.diagram_refs ?? []), ...(section.images ?? []).map((image) => image.diagram_ref)];
  if (!refs.length && section.diagram_ref) refs.push(section.diagram_ref);
  return [...new Set(refs)].flatMap((id) => {
    const diagram = chapter.diagrams?.[id];
    return diagram ? [{ id, diagram, image: section.images?.find((image) => image.diagram_ref === id) }] : [];
  });
}

/** Link questions to the first illustration of a diagram without duplicating its image. */
export function chapterDiagramLinks(chapter: Chapter): Record<string, ChapterLink> {
  const links: Record<string, ChapterLink> = {};
  for (const section of [...chapter.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))) {
    for (const { id, diagram } of sectionDiagrams(section, chapter)) {
      links[id] ??= { href: `#${section.id}-${id}`, title: "title" in diagram ? diagram.title : section.title };
    }
  }
  return links;
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
    for (const ex of s.worked_examples ?? []) parts.push(ex.title, ...ex.steps_md);
    for (const ex of s.code_examples ?? []) parts.push(ex.title, ex.code, ex.note ?? "");
    for (const command of s.commands ?? []) parts.push(command.platform, command.command, command.purpose);
    for (const table of [s.table, s.comparison_table]) {
      if (table) parts.push(...table.columns, ...table.rows.flat());
    }
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
