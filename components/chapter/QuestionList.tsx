"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ChapterQuestion } from "@/lib/chapter";
import { makeLabeler, type Labeler } from "@/lib/chapter";
import { cn } from "@/lib/cn";
import { Md, MdInline } from "./Md";

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
};
const NEUTRAL_BADGE = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

interface QuestionListProps {
  questions: ChapterQuestion[];
  labels: Record<string, string>;
  /** Full question bank: adds filters and flashcard mode. */
  bank?: boolean;
}

export function QuestionList({ questions, labels, bank = false }: QuestionListProps) {
  const L = makeLabeler(labels);
  const [difficulty, setDifficulty] = useState("all");
  const [source, setSource] = useState("all");
  const [type, setType] = useState("all");
  const [flashcard, setFlashcard] = useState(false);

  const options = useMemo(
    () => ({
      difficulty: unique(questions.map((q) => q.difficulty)),
      source: unique(questions.map((q) => q.source)),
      type: unique(questions.map((q) => q.type)),
    }),
    [questions]
  );

  const visible = questions.filter(
    (q) =>
      (difficulty === "all" || q.difficulty === difficulty) &&
      (source === "all" || q.source === source) &&
      (type === "all" || q.type === type)
  );

  return (
    <div>
      {bank && (
        <div className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <FilterRow label={L("filter.difficulty")} value={difficulty} onChange={setDifficulty} values={options.difficulty} prefix="difficulty" L={L} />
          <FilterRow label={L("filter.source")} value={source} onChange={setSource} values={options.source} prefix="source" L={L} />
          <FilterRow label={L("filter.type")} value={type} onChange={setType} values={options.type} prefix="type" L={L} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={flashcard}
                onChange={(e) => setFlashcard(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 accent-brand-600"
              />
              {L("flashcardMode")}
            </label>
            <span className="text-xs text-zinc-500">{L("showing", { count: visible.length, total: questions.length })}</span>
          </div>
          {flashcard && <p className="text-xs text-zinc-500">{L("flashcardHint")}</p>}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {L("noQuestions")}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((q) => (
            <QuestionItem key={`${q.id}-${flashcard}`} q={q} L={L} flashcard={flashcard} />
          ))}
        </ul>
      )}
    </div>
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function FilterRow({
  label,
  value,
  onChange,
  values,
  prefix,
  L,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  values: string[];
  prefix: string;
  L: Labeler;
}) {
  if (values.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      {["all", ...values].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition",
            value === v
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-500"
          )}
        >
          {v === "all" ? L("filter.all") : L(`${prefix}.${v}`)}
        </button>
      ))}
    </div>
  );
}

function QuestionItem({ q, L, flashcard }: { q: ChapterQuestion; L: Labeler; flashcard: boolean }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const showDetail = !flashcard || detail;

  return (
    <li className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <ChevronDown
          className={cn("mt-1 h-4 w-4 shrink-0 text-zinc-400 transition-transform", !open && "-rotate-90")}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", DIFFICULTY_STYLE[q.difficulty] ?? NEUTRAL_BADGE)}>
              {L(`difficulty.${q.difficulty}`)}
            </span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", NEUTRAL_BADGE)}>
              {L(`type.${q.type}`)}
            </span>
            {q.source === "extra" && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                {L("source.extra")}
              </span>
            )}
          </div>
          <div className="font-medium leading-snug">
            <MdInline text={q.question} />
          </div>
        </div>
      </button>

      {open && (
        <div className="space-y-4 border-t border-zinc-100 px-4 pb-4 pt-4 text-sm dark:border-zinc-900 sm:pl-11">
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/30">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              {L("shortAnswer")}
            </div>
            <MdInline text={q.answer_short} />
          </div>

          {showDetail ? (
            <>
              <Md text={q.answer_md} />
              {q.follow_ups && q.follow_ups.length > 0 && (
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{L("followUps")}</div>
                  <ul className="list-disc space-y-1 pl-5 text-zinc-600 dark:text-zinc-400">
                    {q.follow_ups.map((f, i) => (
                      <li key={i}>
                        <MdInline text={f} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDetail(true)}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              {L("showDetail")}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
