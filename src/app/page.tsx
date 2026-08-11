import { redirect } from "next/navigation";

// Unreachable in practice: next.config.ts rewrites "/" straight to the static
// /index.html before routing gets here. This exists so the App Router still has a
// root route (and so the build never depends on the rewrite alone).
export default function Home() {
  redirect("/index.html");
}
