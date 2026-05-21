import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import type { Locale } from "./navigation";

const dictionaries = { en, vi } as const;

export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return (dictionaries[locale] ?? dictionaries.vi) as Messages;
}

export function t(messages: Messages, path: string, vars?: Record<string, string | number>): string {
  const parts = path.split(".");
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  let str = typeof cur === "string" ? cur : path;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}
