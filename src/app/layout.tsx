import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "David Lopez — UX/UI & Immersive Reality Designer",
  description:
    "David Lopez, UX/UI & Immersive Reality Designer. Case studies in product design, from research to shipped experiences.",
};

// The portfolio itself is the static site in /public (index.html, resume.html).
// next.config.ts rewrites "/" to it, so this layout is only a shell that keeps the
// build valid — nothing user-facing renders through React any more.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
