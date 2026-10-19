import type { ChapterDiagram as ChapterDiagramData, Labeler } from "@/lib/chapter";
import { EncapsulationDiagram } from "./EncapsulationDiagram";
import { FlowchartDiagram } from "./FlowchartDiagram";
import { NatTableDiagram } from "./NatTableDiagram";

/** Picks the renderer for a chapter.diagrams entry by its `type`. */
export function ChapterDiagram({ diagram, L }: { diagram: ChapterDiagramData; L: Labeler }) {
  switch (diagram.type) {
    case "flowchart":
      return <FlowchartDiagram diagram={diagram} />;
    case "nat_table":
      return <NatTableDiagram diagram={diagram} L={L} />;
    default:
      return "rows" in diagram ? <EncapsulationDiagram diagram={diagram} /> : null;
  }
}
