import { NextResponse } from "next/server";
import { getAllSearchEntries } from "@/lib/content";
import type { Locale } from "@/lib/navigation";

export const dynamic = "force-static";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") as Locale | null;
  const all = getAllSearchEntries();
  const filtered = locale ? all.filter((e) => e.locale === locale) : all;
  return NextResponse.json(filtered);
}
