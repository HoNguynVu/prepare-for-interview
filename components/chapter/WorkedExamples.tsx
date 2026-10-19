"use client";

import { useState } from "react";
import { ChevronRight, Eye, EyeOff, PenLine } from "lucide-react";
import { makeLabeler, type Labeler, type WorkedExample } from "@/lib/chapter";
import { MdInline } from "./Md";

/** Worked examples whose steps are revealed one at a time, so the reader can try first. */
export function WorkedExamples({ examples, labels }: { examples: WorkedExample[]; labels: Record<string, string> }) {
  const L = makeLabeler(labels);
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{L("workedExamples")}</h3>
      <p className="mb-3 flex items-center gap-1.5 text-sm text-zinc-500">
        <PenLine className="h-3.5 w-3.5" />
        {L("workedExamplesHint")}
      </p>
      <div className="space-y-3">
        {examples.map((ex, i) => (
          <ExampleCard key={`${i}-${ex.title}`} example={ex} L={L} />
        ))}
      </div>
    </div>
  );
}

function ExampleCard({ example, L }: { example: WorkedExample; L: Labeler }) {
  const total = example.steps_md.length;
  const [shown, setShown] = useState(0);
  const done = shown >= total;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium leading-6">
          <MdInline text={example.title} />
        </p>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {L("stepsProgress", { shown, total })}
        </span>
      </div>

      {shown > 0 && (
        <ol className="mt-3 space-y-2">
          {example.steps_md.slice(0, shown).map((step, i) => (
            <li key={i} className="flex gap-3 text-sm leading-6">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <MdInline text={step} />
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {!done && (
          <button
            type="button"
            onClick={() => setShown((n) => Math.min(n + 1, total))}
            className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 font-medium text-white transition hover:bg-brand-700"
          >
            {L(shown === 0 ? "showFirstStep" : "showNextStep")}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
        {!done && (
          <button
            type="button"
            onClick={() => setShown(total)}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <Eye className="h-3.5 w-3.5" />
            {L("showAllSteps")}
          </button>
        )}
        {shown > 0 && (
          <button
            type="button"
            onClick={() => setShown(0)}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <EyeOff className="h-3.5 w-3.5" />
            {L("hideSteps")}
          </button>
        )}
      </div>
    </div>
  );
}
