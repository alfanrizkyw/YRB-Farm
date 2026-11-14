import type { ReactNode } from "react";
import type { Metadata } from "next";
import "../globals.css";
import "./admin/admin.css";
import { fraunces, instrument } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Admin — YRB Farm",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="admin-body">{children}</body>
    </html>
  );
}
