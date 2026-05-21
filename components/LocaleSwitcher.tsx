"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import type { Locale } from "@/lib/navigation";
import { cn } from "@/lib/cn";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? "/";
  const other: Locale = current === "vi" ? "en" : "vi";
  const newPath = pathname.replace(/^\/(en|vi)/, `/${other}`) || `/${other}`;

  return (
    <Link
      href={newPath}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      )}
      aria-label="Switch language"
    >
      <Languages className="h-4 w-4" />
      <span className="uppercase">{other}</span>
    </Link>
  );
}
