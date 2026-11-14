import "../globals.css";
import type { ReactNode } from "react";
import SiteShell, { buildMetadata } from "@/components/site/SiteShell";

export const metadata = buildMetadata("en");
export const revalidate = 30;

export default function EnLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
