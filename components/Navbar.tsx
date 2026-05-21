"use client";

import Link from "next/link";
// SearchBar is a client component using hooks; Navbar must be client.
import { Menu } from "lucide-react";
import type { Locale } from "@/lib/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SearchBar } from "./SearchBar";

interface NavbarProps {
  locale: Locale;
  siteName: string;
  toggleThemeLabel: string;
  searchPlaceholder: string;
  onMenuClick: () => void;
}

export function Navbar({
  locale,
  siteName,
  toggleThemeLabel,
  searchPlaceholder,
  onMenuClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white shadow-sm">
            <span className="text-xs font-bold tracking-tight">HNV</span>
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">{siteName}</span>
        </Link>
        <div className="ml-auto flex flex-1 max-w-md">
          <SearchBar placeholder={searchPlaceholder} locale={locale} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle label={toggleThemeLabel} />
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </header>
  );
}
