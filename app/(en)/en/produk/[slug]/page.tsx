import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPage from "@/components/site/ProductPage";
import { getDict, site } from "@/lib/i18n";
import { getPublicContent } from "@/lib/store";

export const revalidate = 30;

export function generateStaticParams() {
  return getDict("en").products.items.map((item) => ({ slug: item.slug }));
}

function findProduct(slug: string) {
  return getDict("en").products.items.find((item) => item.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return {};
  const path = `/en/produk/${product.slug}`;
  return {
    title: `${product.name} — ${site.name}`,
    description: product.intro,
    alternates: {
      canonical: path,
      languages: { "id-ID": `/produk/${product.slug}`, en: path },
    },
    openGraph: {
      type: "article",
      siteName: site.name,
      title: `${product.name} — ${site.name}`,
      description: product.intro,
      locale: "en_US",
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
  return <ProductPage lang="en" product={product} settings={content.settings} />;
}
