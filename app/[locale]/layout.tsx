import { notFound } from "next/navigation";
import { locales, topics, type Locale } from "@/lib/navigation";
import { getLessons } from "@/lib/content";
import { getMessages, t } from "@/lib/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import type { LessonMeta } from "@/lib/content";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as Locale)) notFound();
  const locale = params.locale as Locale;
  const m = getMessages(locale);

  const lessonsByTopic: Record<string, LessonMeta[]> = {};
  for (const topic of topics) {
    lessonsByTopic[topic.id] = getLessons(locale, topic.id);
  }

  return (
    <ThemeProvider>
      <AppShell
        locale={locale}
        siteName={t(m, "site.name")}
        toggleThemeLabel={t(m, "nav.toggleTheme")}
        searchPlaceholder={t(m, "search.placeholder")}
        lessonsByTopic={lessonsByTopic}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
