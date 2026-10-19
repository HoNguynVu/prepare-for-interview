import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, Laptop, Router, Server } from "lucide-react";
import type { Labeler, NatTableDiagramData } from "@/lib/chapter";

/** Private hosts → NAT router (public IP + translation table) → remote server. */
export function NatTableDiagram({ diagram, L }: { diagram: NatTableDiagramData; L: Labeler }) {
  const { inside, router, server } = diagram;
  return (
    <figure className="my-6">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr),auto,minmax(0,1.4fr),auto,minmax(0,0.8fr)]">
          <Panel icon={<Laptop className="h-4 w-4" />} title={L("nat.inside")} tone="sky">
            <ul className="space-y-2">
              {inside.map((h) => (
                <li key={h.ip_port} className="rounded-md border border-sky-200 bg-white px-3 py-2 dark:border-sky-900 dark:bg-zinc-950">
                  <div className="text-xs text-zinc-500">{h.device}</div>
                  <div className="font-mono text-sm font-medium">{h.ip_port}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Flow />

          <Panel icon={<Router className="h-4 w-4" />} title={L("nat.router")} tone="violet">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500">{L("nat.publicIp")}</span>
              <span className="rounded-md bg-violet-600 px-2 py-0.5 font-mono font-semibold text-white">{router.public_ip}</span>
            </div>
            <div className="overflow-x-auto rounded-md border border-violet-200 bg-white dark:border-violet-900 dark:bg-zinc-950">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-violet-50 font-sans uppercase tracking-wider text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                  <tr>
                    <th className="px-2.5 py-1.5 font-semibold">{L("nat.insideCol")}</th>
                    <th />
                    <th className="px-2.5 py-1.5 font-semibold">{L("nat.outsideCol")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-100 dark:divide-violet-950">
                  {router.nat_table.map((r) => (
                    <tr key={r.inside}>
                      <td className="whitespace-nowrap px-2.5 py-1.5">{r.inside}</td>
                      <td className="text-zinc-400">→</td>
                      <td className="whitespace-nowrap px-2.5 py-1.5 font-semibold text-violet-700 dark:text-violet-300">{r.outside}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Flow />

          <Panel icon={<Server className="h-4 w-4" />} title={L("nat.server")} tone="emerald">
            <div className="font-mono text-sm font-medium">{server}</div>
          </Panel>
        </div>
      </div>
      {(diagram.caption || diagram.description) && (
        <figcaption className="mt-2 text-xs text-zinc-500">{diagram.caption ?? diagram.description}</figcaption>
      )}
    </figure>
  );
}

const TONES = {
  sky: "border-sky-200 bg-sky-50/70 text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
  violet: "border-violet-200 bg-violet-50/70 text-violet-800 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300",
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
};

function Panel({ icon, title, tone, children }: { icon: ReactNode; title: string; tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <div className={`rounded-lg border p-3 ${TONES[tone]}`}>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <div className="text-zinc-800 dark:text-zinc-200">{children}</div>
    </div>
  );
}

function Flow() {
  return (
    <div className="flex justify-center text-zinc-400 dark:text-zinc-600">
      <ArrowDown className="h-5 w-5 lg:hidden" />
      <ArrowRight className="hidden h-5 w-5 lg:block" />
    </div>
  );
}
