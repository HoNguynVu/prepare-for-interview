import type { EncapsulationDiagramData } from "@/lib/chapter";

/** Each distinct header label gets its own colour; application data is always green. */
const HEADER_COLORS = [
  "border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950/60 dark:text-sky-200",
  "border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-200",
  "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-200",
];
const DATA_COLOR =
  "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200";

export function EncapsulationDiagram({ diagram }: { diagram: EncapsulationDiagramData }) {
  const colorOf = new Map<string, string>();
  const colorFor = (label: string, role: string) => {
    if (role === "data") return DATA_COLOR;
    // FCS is a trailer of the same frame as the Ethernet header: share its colour.
    const key = label === "FCS" ? "Eth hdr" : label;
    if (!colorOf.has(key)) colorOf.set(key, HEADER_COLORS[colorOf.size % HEADER_COLORS.length]);
    return colorOf.get(key)!;
  };

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="min-w-[34rem] space-y-2">
          {diagram.rows.map((row) => (
            <div key={row.layer} className="flex items-stretch gap-3">
              <div className="w-28 shrink-0 py-1.5 text-right">
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{row.layer}</div>
                {row.pdu && <div className="text-[11px] text-zinc-500">{row.pdu}</div>}
              </div>
              <div className="flex flex-1 items-stretch gap-1">
                {row.blocks.map((b, i) => (
                  <div
                    key={`${b.label}-${i}`}
                    className={`flex items-center rounded-md border px-3 py-1.5 text-xs font-medium ${colorFor(b.label, b.role)} ${
                      b.role === "data" ? "flex-1 justify-center" : ""
                    }`}
                  >
                    {b.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        {diagram.legend?.header && (
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded border ${HEADER_COLORS[0]}`} />
            {diagram.legend.header}
          </span>
        )}
        {diagram.legend?.data && (
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded border ${DATA_COLOR}`} />
            {diagram.legend.data}
          </span>
        )}
        {diagram.description && <span className="sr-only">{diagram.description}</span>}
      </figcaption>
    </figure>
  );
}
