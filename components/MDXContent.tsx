import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { getSingletonHighlighter } from "shiki";

function rehypeCollapsibleSections() {
  return (tree: any) => {
    const children: any[] = tree.children ?? [];
    const result: any[] = [];
    let i = 0;

    while (i < children.length) {
      const node = children[i];

      if (node.type !== "element" || node.tagName !== "h2") {
        result.push(node);
        i++;
        continue;
      }

      const headingId: string | undefined = node.properties?.id;
      const content: any[] = [];
      let j = i + 1;
      while (j < children.length) {
        const next = children[j];
        if (next.type === "element" && next.tagName === "h2") break;
        content.push(next);
        j++;
      }

      const chevron = {
        type: "element",
        tagName: "svg",
        properties: {
          xmlns: "http://www.w3.org/2000/svg",
          width: "18",
          height: "18",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          className: ["section-chevron"],
          "aria-hidden": "true",
        },
        children: [{ type: "element", tagName: "path", properties: { d: "M6 9l6 6 6-6" }, children: [] }],
      };

      result.push({
        type: "element",
        tagName: "details",
        properties: { ...(headingId ? { id: headingId } : {}), className: ["section-details"] },
        children: [
          {
            type: "element",
            tagName: "summary",
            properties: { className: ["section-summary"] },
            children: [
              { ...node, properties: { ...node.properties, id: undefined } },
              chevron,
            ],
          },
          ...content,
        ],
      });

      i = j;
    }

    tree.children = result;
  };
}

const prettyCodeOptions = {
  theme: "github-dark",
  keepBackground: false,
  getHighlighter: getSingletonHighlighter,
};

const mdxComponents = {
  pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => (
    <pre {...props} style={{ ...props.style, backgroundColor: "rgb(24 24 27)" }}>
      {children}
    </pre>
  ),
  Callout: ({ type = "note", children }: { type?: "note" | "warning" | "tip"; children: React.ReactNode }) => {
    const styles: Record<string, string> = {
      note: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
      warning: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
      tip: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    };
    return (
      <div className={`my-4 rounded-md border-l-4 p-4 ${styles[type] ?? styles.note}`}>
        <div className="text-xs font-semibold uppercase tracking-wider opacity-70">{type}</div>
        <div className="mt-1 [&>p:last-child]:mb-0">{children}</div>
      </div>
    );
  },
};

export function MDXContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [rehypePrettyCode, prettyCodeOptions],
            rehypeCollapsibleSections,
          ],
        },
      }}
    />
  );
}
