"use client";

import { useState, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { Locale } from "@/lib/navigation";
import type { LessonMeta } from "@/lib/content";

interface AppShellProps {
  locale: Locale;
  siteName: string;
  toggleThemeLabel: string;
  searchPlaceholder: string;
  lessonsByTopic: Record<string, LessonMeta[]>;
  children: ReactNode;
}

export function AppShell({
  locale,
  siteName,
  toggleThemeLabel,
  searchPlaceholder,
  lessonsByTopic,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Navbar
        locale={locale}
        siteName={siteName}
        toggleThemeLabel={toggleThemeLabel}
        searchPlaceholder={searchPlaceholder}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="flex">
        <Sidebar
          locale={locale}
          lessonsByTopic={lessonsByTopic}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
