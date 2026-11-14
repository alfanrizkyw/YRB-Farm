import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/site/ProductPage";
import { getDict, site } from "@/lib/i18n";
import { getPublicContent } from "@/lib/store";

export const revalidate = 30;

export function generateStaticParams() {
  return getDict("id").products.items.map((item) => ({ slug: item.slug }));
}

function findProduct(slug: string) {
  return getDict("id").products.items.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return {};
  const path = `/produk/${product.slug}`;
  return {
    title: `${product.name} — ${site.name}`,
    description: product.intro,
    alternates: {
      canonical: path,
      languages: { "id-ID": path, en: `/en${path}` },
    },
    openGraph: {
      type: "article",
      siteName: site.name,
      title: `${product.name} — ${site.name}`,
      description: product.intro,
      locale: "id_ID",
      url: path,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();
  const content = await getPublicContent();
  return <ProductPage lang="id" product={product} settings={content.settings} />;
}
