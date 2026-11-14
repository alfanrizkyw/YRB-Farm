import type { MetadataRoute } from "next";
import { getDict } from "@/lib/i18n";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://yrb-farm.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const products = getDict("id").products.items;

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/en`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...products.flatMap((product) => [
      {
        url: `${base}/produk/${product.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${base}/en/produk/${product.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      },
    ]),
  ];
}
