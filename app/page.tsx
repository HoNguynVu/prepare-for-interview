import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/navigation";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
