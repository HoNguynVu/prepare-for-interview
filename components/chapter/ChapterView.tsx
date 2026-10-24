import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, BookOpen, Clock, ExternalLink, HelpCircle, Lightbulb, Microscope, Server, Target } from "lucide-react";
import {
  CHAPTER_ANCHORS,
  hasQuickRef,
  makeLabeler,
  chapterDiagramLinks,
  sectionDiagrams,
  type Chapter,
  type ChapterLink,
  type ChapterSection,
  type Labeler,
} from "@/lib/chapter";
import { cn } from "@/lib/cn";
import { Md, MdInline } from "./Md";
import { ChapterDiagram } from "./ChapterDiagram";
import { WorkedExamples } from "./WorkedExamples";
import { QuestionList } from "./QuestionList";
import { Quiz } from "./Quiz";
import { DiagramLinks } from "./DiagramLinks";

interface ChapterViewProps {
  chapter: Chapter;
  labels: Record<string, string>;
  chapterLinks?: Record<string, ChapterLink>;
}

export function ChapterView({ chapter, labels, chapterLinks = {} }: ChapterViewProps) {
  const L = makeLabeler(labels);
  const questionsById = new Map(chapter.questions.map((q) => [q.id, q]));
  const sections = [...chapter.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const diagramLinks = chapterDiagramLinks(chapter);

  return (
    <div className="space-y-14">
      <Overview chapter={chapter} chapterLinks={chapterLinks} L={L} />

      {sections.map((s) => (
        <SectionBlock key={s.id} section={s} chapter={chapter} labels={labels} L={L}>
          {(s.question_ids ?? []).length > 0 && (
            <RelatedQuestions
              questions={(s.question_ids ?? []).flatMap((id) => questionsById.get(id) ?? [])}
              labels={labels}
              diagramLinks={diagramLinks}
              L={L}
            />
          )}
        </SectionBlock>
      ))}

      {hasQuickRef(chapter) && <QuickReference chapter={chapter} L={L} />}

      {chapter.questions.length > 0 && (
        <Block id={CHAPTER_ANCHORS.questionBank} title={L("questionBank")} subtitle={L("questionBankHint", { count: chapter.questions.length })}>
          <QuestionList questions={chapter.questions} labels={labels} diagramLinks={diagramLinks} bank />
        </Block>
      )}

      {chapter.exercises && chapter.exercises.length > 0 && (
        <Block id={CHAPTER_ANCHORS.exercises} title={L("exercises")}>
          <ol className="space-y-3">
            {chapter.exercises.map((ex, i) => (
              <li key={ex.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                <p className="font-medium">
                  <span className="mr-2 text-zinc-400">{i + 1}.</span>
                  <MdInline text={ex.prompt} />
                </p>
                <details className="group mt-3">
                  <summary className="cursor-pointer select-none text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {L("showSolution")}
                  </summary>
                  <Md text={ex.answer_md} className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900" />
                  <div className="mt-3"><DiagramLinks refs={ex.diagram_refs} links={diagramLinks} L={L} /></div>
                </details>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {chapter.quiz && chapter.quiz.length > 0 && (
        <Block id={CHAPTER_ANCHORS.quiz} title={L("quiz")}>
          <Quiz quiz={chapter.quiz} labels={labels} />
        </Block>
      )}

      {chapter.key_takeaways && chapter.key_takeaways.length > 0 && (
        <Block id={CHAPTER_ANCHORS.takeaways} title={L("takeaways")}>
          <ul className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
            {chapter.key_takeaways.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-7">
                  <MdInline text={t} />
                </span>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {chapter.references && chapter.references.length > 0 && (
        <Block id={CHAPTER_ANCHORS.references} title={L("references")}>
          <ul className="space-y-2">
            {chapter.references.map((r) => (
              <li key={r.url} id={r.id ? `reference-${r.id}` : undefined} className="scroll-mt-24">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-lg border border-zinc-200 p-3 transition hover:border-brand-300 dark:border-zinc-800 dark:hover:border-brand-700"
                >
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-zinc-400 group-hover:text-brand-500" />
                  <span className="min-w-0">
                    <span className="block font-medium group-hover:text-brand-700 dark:group-hover:text-brand-300">{r.title}</span>
                    {r.note && <span className="block text-sm text-zinc-500">{r.note}</span>}
                  </span>
                  {r.type && (
                    <span className="ml-auto shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                      {r.type}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {chapter.next_chapter && (
        <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          <span className="font-semibold">{L("nextChapter")}:</span>{" "}
          {chapterLinks[chapter.next_chapter.id] ? (
            <Link href={chapterLinks[chapter.next_chapter.id].href} className="text-brand-600 hover:underline dark:text-brand-400">
              {chapter.next_chapter.title}
            </Link>
          ) : chapter.next_chapter.title}
        </p>
      )}
    </div>
  );
}

// ---- building blocks --------------------------------------------------------

function Block({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Overview({ chapter, chapterLinks, L }: { chapter: Chapter; chapterLinks: Record<string, ChapterLink>; L: Labeler }) {
  const prerequisites = (chapter.prerequisites ?? []).flatMap((id) => chapterLinks[id] ? [chapterLinks[id]] : []);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        {chapter.estimated_study_minutes && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
            <Clock className="h-3.5 w-3.5" />
            {L("studyMinutes", { count: chapter.estimated_study_minutes })}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-900">
          <HelpCircle className="h-3.5 w-3.5" />
          {L("questionsCount", { count: chapter.questions.length })}
        </span>
      </div>
      {prerequisites.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-zinc-500">{L("prerequisites")}:</span>
          {prerequisites.map((lesson) => (
            <Link key={lesson.href} href={lesson.href} className="rounded-md border border-zinc-200 px-2 py-1 text-brand-600 hover:underline dark:border-zinc-700 dark:text-brand-400">
              {lesson.title}
            </Link>
          ))}
        </div>
      )}
      {chapter.learning_objectives && chapter.learning_objectives.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900 dark:bg-brand-950/30">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            <Target className="h-4 w-4" />
            {L("objectives")}
          </h2>
          <ul className="list-disc space-y-1 pl-5 leading-7">
            {chapter.learning_objectives.map((o, i) => (
              <li key={i}>
                <MdInline text={o} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((p) => (
        <span key={p} className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900">
          {p}
        </span>
      ))}
    </div>
  );
}

function SectionBlock({
  section: s,
  chapter,
  labels,
  L,
  children,
}: {
  section: ChapterSection;
  chapter: Chapter;
  labels: Record<string, string>;
  L: Labeler;
  children?: ReactNode;
}) {
  const diagrams = sectionDiagrams(s, chapter);
  const references = (s.reference_ids ?? []).flatMap((id) => chapter.references?.find((reference) => reference.id === id) ?? []);
  const deepDive = s.type === "deep_dive";
  const typeLabel = s.type ? labels[`sectionType.${s.type}`] : undefined;

  return (
    <section
      id={s.id}
      className={cn(
        "scroll-mt-24",
        deepDive &&
          "rounded-2xl border border-violet-200 bg-violet-50/40 p-5 sm:p-6 dark:border-violet-900/70 dark:bg-violet-950/20"
      )}
    >
      {typeLabel && (
        <span
          className={cn(
            "mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
            deepDive
              ? "bg-violet-600 text-white"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
          )}
        >
          {deepDive && <Microscope className="h-3 w-3" />}
          {typeLabel}
        </span>
      )}
      <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
        {s.layer && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-base font-bold text-white dark:bg-white dark:text-zinc-900">
            {s.layer.osi_number}
          </span>
        )}
        <span>{s.title}</span>
      </h2>

      <div className="mt-5 space-y-5">
        {s.layer && <LayerFacts layer={s.layer} L={L} />}
        {s.content_md && <Md text={s.content_md} />}

        {s.analogy && (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">{L("analogy")}: </span>
              <MdInline text={s.analogy} />
            </div>
          </div>
        )}

        {s.key_points && s.key_points.length > 0 && (
          <div>
            <SubHeading>{L("keyPoints")}</SubHeading>
            <ul className="list-disc space-y-2 pl-5 leading-7">
              {s.key_points.map((k, i) => (
                <li key={i}>
                  <MdInline text={k} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {s.table && <DataTable columns={s.table.columns} rows={s.table.rows} firstColMono />}
        {s.comparison_table && <ComparisonTable table={s.comparison_table} />}

        {diagrams.map(({ id, diagram, image }) => (
          <div key={id} id={`${s.id}-${id}`} className="scroll-mt-24">
            <ChapterDiagram diagram={diagram} image={image} L={L} />
          </div>
        ))}
        {!!s.code_examples?.length && (
          <div className="space-y-4">
            <SubHeading>{L("codeExamples")}</SubHeading>
            {s.code_examples.map((example, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-sm font-semibold">{example.title}</h4>
                <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] leading-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <code className={`language-${example.language}`}>{example.code}</code>
                </pre>
                {example.note && <Md text={example.note} className="text-sm text-zinc-500" />}
              </div>
            ))}
          </div>
        )}
        {!!s.commands?.length && (
          <div>
            <SubHeading>{L("debugCommands")}</SubHeading>
            <DataTable
              columns={[L("platform"), L("command"), L("purpose")]}
              rows={s.commands.map((command) => [command.platform, `\`${command.command}\``, command.purpose])}
            />
          </div>
        )}
        {s.walkthrough && <Walkthrough w={s.walkthrough} L={L} />}
        {s.worked_examples && s.worked_examples.length > 0 && (
          <WorkedExamples examples={s.worked_examples} labels={labels} />
        )}

        {s.examples && s.examples.length > 0 && (
          <div>
            <SubHeading>{L("examples")}</SubHeading>
            <ul className="space-y-2">
              {s.examples.map((e, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-zinc-200 p-3 text-sm leading-6 dark:border-zinc-800">
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                  <span>
                    <MdInline text={e} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {s.common_errors && s.common_errors.length > 0 && (
          <div>
            <SubHeading>{L("commonErrors")}</SubHeading>
            <ul className="space-y-1.5">
              {s.common_errors.map((e, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-6">
                  <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>
                    <MdInline text={e} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {s.error_to_layer_map && s.error_to_layer_map.length > 0 && (
          <DataTable
            columns={[L("symptom"), L("layer"), L("meaning")]}
            rows={s.error_to_layer_map.map((r) => [r.symptom, r.layer, r.meaning])}
            firstColMono
          />
        )}

        {s.backend_relevance && (
          <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200">
            <Server className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <span className="font-semibold">{L("backendRelevance")}: </span>
              <MdInline text={s.backend_relevance} />
            </div>
          </div>
        )}

        {references.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-zinc-500">{L("references")}:</span>
            {references.map((reference) => (
              <a key={reference.id} href={`#reference-${reference.id}`} className="text-brand-600 hover:underline dark:text-brand-400">
                {reference.title}
              </a>
            ))}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{children}</h3>;
}

function LayerFacts({ layer, L }: { layer: NonNullable<ChapterSection["layer"]>; L: Labeler }) {
  const facts: [string, string | undefined][] = [
    [L("tcpipLayer"), layer.tcpip_layer],
    [L("pdu"), layer.pdu],
    [L("addressing"), layer.addressing],
  ];
  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="grid gap-3 sm:grid-cols-3">
        {facts.map(([k, v]) =>
          v ? (
            <div key={k}>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{k}</div>
              <div className="mt-0.5 text-sm font-medium">{v}</div>
            </div>
          ) : null
        )}
      </div>
      {layer.protocols && layer.protocols.length > 0 && (
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{L("protocols")}</div>
          <Chips items={layer.protocols} />
        </div>
      )}
      {layer.devices && layer.devices.length > 0 && (
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{L("devices")}</div>
          <Chips items={layer.devices} />
        </div>
      )}
    </div>
  );
}

function StepList({ steps }: { steps: { layer: string; action_md: string }[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((st, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <span className="mt-0.5 h-fit shrink-0 rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {st.layer}
          </span>
          <span className="text-sm leading-6">
            <MdInline text={st.action_md} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function Walkthrough({ w, L }: { w: NonNullable<ChapterSection["walkthrough"]>; L: Labeler }) {
  return (
    <div className="space-y-6">
      {w.send_steps && w.send_steps.length > 0 && (
        <div>
          <SubHeading>{L("sendSteps")}</SubHeading>
          <StepList steps={w.send_steps} />
        </div>
      )}
      {w.in_transit_md && (
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm dark:border-violet-900 dark:bg-violet-950/30">
          <SubHeading>{L("inTransit")}</SubHeading>
          <Md text={w.in_transit_md} />
        </div>
      )}
      {w.receive_steps && w.receive_steps.length > 0 && (
        <div>
          <SubHeading>{L("receiveSteps")}</SubHeading>
          <StepList steps={w.receive_steps} />
        </div>
      )}
      {w.what_changes && w.what_changes.length > 0 && (
        <div>
          <SubHeading>{L("whatChanges")}</SubHeading>
          <DataTable columns={[L("field"), L("behavior")]} rows={w.what_changes.map((r) => [r.field, r.behavior])} firstColStrong />
        </div>
      )}
    </div>
  );
}

function RelatedQuestions({
  questions,
  labels,
  diagramLinks,
  L,
}: {
  questions: Chapter["questions"];
  labels: Record<string, string>;
  diagramLinks: Record<string, ChapterLink>;
  L: Labeler;
}) {
  if (questions.length === 0) return null;
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <HelpCircle className="h-4 w-4 text-brand-500" />
        {L("relatedQuestions")}
      </h3>
      <QuestionList questions={questions} labels={labels} diagramLinks={diagramLinks} />
    </div>
  );
}

function DataTable({
  columns,
  rows,
  firstColMono,
  firstColStrong,
}: {
  columns: string[];
  rows: string[][];
  firstColMono?: boolean;
  firstColStrong?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={
                    "px-3 py-2 align-top " +
                    (j === 0 && firstColMono ? "font-mono text-xs font-medium " : "") +
                    (j === 0 && firstColStrong ? "font-medium " : "")
                  }
                >
                  <MdInline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Options side by side: the first column names the criterion, the header row the options. */
function ComparisonTable({ table }: { table: NonNullable<ChapterSection["comparison_table"]> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-200 dark:border-brand-900">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-brand-50 text-xs uppercase tracking-wider text-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
          <tr>
            {table.columns.map((c, j) => (
              <th key={c} className={cn("px-3 py-2.5 font-semibold", j > 0 && "border-l border-brand-100 dark:border-brand-900")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-3 py-2 align-top leading-6",
                    j === 0
                      ? "bg-zinc-50 font-medium text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300"
                      : "border-l border-zinc-100 dark:border-zinc-900"
                  )}
                >
                  <MdInline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickReference({ chapter, L }: { chapter: Chapter; L: Labeler }) {
  const st = chapter.summary_table;
  return (
    <Block id={CHAPTER_ANCHORS.quickRef} title={L("quickReference")}>
      <div className="space-y-8">
        {st && (
          <div>
            <DataTable columns={st.columns} rows={st.rows} firstColStrong />
            {st.footnote && <p className="mt-2 text-xs text-zinc-500">{st.footnote}</p>}
          </div>
        )}

        {chapter.mnemonics && chapter.mnemonics.length > 0 && (
          <div>
            <SubHeading>{L("mnemonics")}</SubHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {chapter.mnemonics.map((m) => (
                <div key={m.text} className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="text-xs text-amber-800 dark:text-amber-300">{m.purpose}</div>
                  <div className="mt-1 text-lg font-bold tracking-tight text-amber-950 dark:text-amber-100">{m.text}</div>
                  {m.mapping && <div className="mt-1 text-sm text-amber-900/80 dark:text-amber-200/80">{m.mapping}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {chapter.header_sizes && chapter.header_sizes.length > 0 && (
          <div>
            <SubHeading>{L("headerSizes")}</SubHeading>
            <DataTable columns={[L("header"), L("size")]} rows={chapter.header_sizes.map((h) => [h.header, h.size])} firstColStrong />
          </div>
        )}
      </div>
    </Block>
  );
}
