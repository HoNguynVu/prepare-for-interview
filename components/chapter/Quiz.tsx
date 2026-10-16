"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import type { Chapter } from "@/lib/chapter";
import { makeLabeler } from "@/lib/chapter";
import { cn } from "@/lib/cn";
import { MdInline } from "./Md";

export function Quiz({ quiz, labels }: { quiz: NonNullable<Chapter["quiz"]>; labels: Record<string, string> }) {
  const L = makeLabeler(labels);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answered = Object.keys(answers).length;
  const score = quiz.filter((q) => answers[q.id] === q.correct_option_id).length;

  return (
    <div className="space-y-4">
      {quiz.map((q, idx) => {
        const picked = answers[q.id];
        return (
          <fieldset key={q.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <legend className="sr-only">{q.prompt}</legend>
            <p className="font-medium leading-snug">
              <span className="mr-2 text-zinc-400">{idx + 1}.</span>
              <MdInline text={q.prompt} />
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((o) => {
                const isPicked = picked === o.id;
                const isCorrect = o.id === q.correct_option_id;
                const revealed = picked !== undefined;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={revealed}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition",
                      !revealed && "border-zinc-200 hover:border-brand-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-brand-500 dark:hover:bg-zinc-900",
                      revealed && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
                      revealed && isPicked && !isCorrect && "border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
                      revealed && !isCorrect && !isPicked && "border-zinc-200 opacity-60 dark:border-zinc-800"
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold uppercase">
                      {o.id}
                    </span>
                    <span className="flex-1">
                      <MdInline text={o.text} />
                    </span>
                    {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && q.explanation && (
              <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <span className="font-semibold">{L("explanation")}: </span>
                <MdInline text={q.explanation} />
              </p>
            )}
          </fieldset>
        );
      })}

      <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <span className="font-medium" aria-live="polite">
          {answered < quiz.length
            ? L("quizProgress", { answered, total: quiz.length })
            : L("quizScore", { score, total: quiz.length })}
        </span>
        {answered > 0 && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <RotateCcw className="h-3 w-3" />
            {L("retry")}
          </button>
        )}
      </div>
    </div>
  );
}
