import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prepare For Interview",
    template: "%s — Prepare For Interview",
  },
  description: "Bilingual interview preparation hub: OOP, Network, OS, DSA, Auth and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
