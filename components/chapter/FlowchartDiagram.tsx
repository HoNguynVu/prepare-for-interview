import type { ReactNode } from "react";
import { ArrowDown, CornerDownRight } from "lucide-react";
import type { FlowchartDiagramData } from "@/lib/chapter";
import { cn } from "@/lib/cn";

/**
 * Renders a flowchart (nodes + edges) as a top-down tree: every branch of a
 * decision becomes a column, sized by how many end points it leads to.
 * A node reached a second time is shown as a reference instead of being drawn again.
 */
export function FlowchartDiagram({ diagram }: { diagram: FlowchartDiagramData }) {
  const nodes = new Map(diagram.nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, { to: string; label?: string }[]>();
  for (const e of diagram.edges) {
    if (!nodes.has(e.from) || !nodes.has(e.to)) continue;
    outgoing.set(e.from, [...(outgoing.get(e.from) ?? []), { to: e.to, label: e.label }]);
  }
  const targets = new Set(diagram.edges.map((e) => e.to));
  const roots = diagram.nodes.filter((n) => !targets.has(n.id));
  if (roots.length === 0 && diagram.nodes.length) roots.push(diagram.nodes[0]);

  // First visit owns the node; later visits render a reference.
  const owner = new Map<string, string>();
  const claim = (id: string, path: string): boolean => {
    if (owner.has(id)) return owner.get(id) === path;
    owner.set(id, path);
    for (const [i, c] of (outgoing.get(id) ?? []).entries()) claim(c.to, `${path}/${i}`);
    return true;
  };
  roots.forEach((r, i) => claim(r.id, `${i}`));

  const children = (id: string, path: string) =>
    (outgoing.get(id) ?? []).map((c, i) => ({ ...c, path: `${path}/${i}`, owned: owner.get(c.to) === `${path}/${i}` }));

  const leaves = (id: string, path: string): number => {
    const cs = children(id, path).filter((c) => c.owned);
    return cs.length === 0 ? 1 : cs.reduce((sum, c) => sum + leaves(c.to, c.path), 0);
  };

  const renderNode = (id: string, path: string, isRoot: boolean): ReactNode => {
    const node = nodes.get(id)!;
    const cs = children(id, path);
    const decision = node.shape === "decision";
    const terminal = isRoot || cs.length === 0;
    const box = (
      <div
        className={cn(
          "relative z-10 max-w-[16rem] border px-3 py-2 text-center text-sm font-medium leading-5 shadow-sm",
          decision
            ? "rounded-lg border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100"
            : terminal
              ? "rounded-full border-zinc-800 bg-zinc-900 px-4 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
              : "rounded-lg border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
        )}
      >
        {decision && <span className="mr-1 text-amber-500">◆</span>}
        {node.label}
      </div>
    );

    if (cs.length === 0) return <div className="flex flex-col items-center">{box}</div>;

    if (cs.length === 1) {
      const c = cs[0];
      return (
        <div className="flex flex-col items-center">
          {box}
          <Connector label={c.label} />
          {c.owned ? renderNode(c.to, c.path, false) : <NodeRef label={nodes.get(c.to)!.label} />}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        {box}
        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
        <div
          className="grid w-full"
          style={{ gridTemplateColumns: cs.map((c) => `${c.owned ? leaves(c.to, c.path) : 1}fr`).join(" ") }}
        >
          {cs.map((c, i) => (
            <div key={c.path} className="relative flex flex-col items-center px-2">
              <span
                className={cn(
                  "absolute top-0 h-px bg-zinc-300 dark:bg-zinc-700",
                  i === 0 ? "left-1/2 right-0" : i === cs.length - 1 ? "left-0 right-1/2" : "inset-x-0"
                )}
              />
              <Connector label={c.label} />
              {c.owned ? renderNode(c.to, c.path, false) : <NodeRef label={nodes.get(c.to)!.label} />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalLeaves = roots.reduce((sum, r, i) => sum + leaves(r.id, `${i}`), 0);

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto space-y-8" style={{ minWidth: `${Math.max(totalLeaves * 11, 18)}rem` }}>
          {roots.map((r, i) => (
            <div key={r.id}>{renderNode(r.id, `${i}`, true)}</div>
          ))}
        </div>
      </div>
      {diagram.description && <figcaption className="mt-2 text-xs text-zinc-500">{diagram.description}</figcaption>}
    </figure>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
      {label && (
        <span className="my-0.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {label}
        </span>
      )}
      <ArrowDown className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
    </div>
  );
}

function NodeRef({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-700">
      <CornerDownRight className="h-3 w-3" />
      {label}
    </span>
  );
}
