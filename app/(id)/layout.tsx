import "../globals.css";
import type { ReactNode } from "react";
import SiteShell, { buildMetadata } from "@/components/site/SiteShell";

export const metadata = buildMetadata("id");
export const revalidate = 30;

export default function IdLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="id">{children}</SiteShell>;
}
