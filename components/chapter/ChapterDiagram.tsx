import type { ChapterDiagram as ChapterDiagramData, ChapterImage, Labeler } from "@/lib/chapter";
import { EncapsulationDiagram } from "./EncapsulationDiagram";
import { FlowchartDiagram } from "./FlowchartDiagram";
import { NatTableDiagram } from "./NatTableDiagram";

/** Picks the renderer for a chapter.diagrams entry by its `type`. */
export function ChapterDiagram({ diagram, image, L }: { diagram: ChapterDiagramData; image?: ChapterImage; L: Labeler }) {
  switch (diagram.type) {
    case "illustration":
    case "sequence":
    case "chart":
      return (
        <figure className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <h3 className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900">
            {diagram.title}
          </h3>
          <div className="bg-white p-2 sm:p-4">
            {/* Embedded PNGs must bypass Next's image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={diagram.image_url}
              alt={image?.alt ?? diagram.alt ?? diagram.title}
              width={diagram.width}
              height={diagram.height}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full"
            />
          </div>
          <figcaption className="space-y-3 border-t border-zinc-200 px-4 py-3 text-sm leading-6 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            {(image?.caption ?? diagram.caption ?? diagram.description) && (
              <p>{image?.caption ?? diagram.caption ?? diagram.description}</p>
            )}
            {!!diagram.reading_steps?.length && (
              <ol className="list-decimal space-y-1 pl-5">
                {diagram.reading_steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            )}
          </figcaption>
        </figure>
      );
    case "flowchart":
      return <FlowchartDiagram diagram={diagram} />;
    case "nat_table":
      return <NatTableDiagram diagram={diagram} L={L} />;
    default:
      return "rows" in diagram ? <EncapsulationDiagram diagram={diagram} /> : null;
  }
}
