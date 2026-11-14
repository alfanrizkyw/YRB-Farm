import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/site/Header";
import MotionRoot from "@/components/site/MotionRoot";
import WaFx from "@/components/site/WaFx";
import Footer from "@/components/site/Footer";
import { baloo, jakarta } from "@/lib/fonts";
import type { Lang } from "@/lib/i18n";
import { getDict, site } from "@/lib/i18n";
import { getPublicContent } from "@/lib/store";
import { waLink } from "@/lib/utils";

export const revalidate = 30;

export function buildMetadata(lang: Lang): Metadata {
  const t = getDict(lang);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://yrb-farm.vercel.app";
  const path = lang === "en" ? "/en" : "/";
  return {
    metadataBase: new URL(base),
    title: t.meta.title,
    description: t.meta.description,
    applicationName: site.name,
    alternates: {
      canonical: path,
      languages: { "id-ID": "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      locale: lang === "id" ? "id_ID" : "en_US",
      url: path,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
      images: ["/og.jpg"],
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
      apple: "/icon.png",
    },
  };
}

export default async function SiteShell({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  const content = await getPublicContent();
  const t = getDict(lang);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yrb-farm.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    image: `${baseUrl}/images/logo-berkah.png`,
    description: t.meta.description,
    telephone: content.settings.phoneDisplay,
    email: content.settings.email,
    url: baseUrl,
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: content.settings.farmAddress,
        addressRegion: "Jawa Tengah",
        addressCountry: "ID",
      },
      {
        "@type": "PostalAddress",
        streetAddress: content.settings.officeAddress,
        addressRegion: "Jawa Tengah",
        addressCountry: "ID",
      },
    ],
    foundingDate: "2014",
    areaServed: ["Semarang", "Tegal", "Yogyakarta", "Cirebon", "Bogor"],
  };

  return (
    <html lang={lang} className={`${baloo.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <Header
          lang={lang}
          nav={t.nav}
          waHref={waLink(content.settings.waNumber, t.contact.message)}
          langHref={lang === "id" ? "/en" : "/"}
          announcement={content.settings.announcement}
          menuLabel={t.common.menu}
        />
        <div className="site-sheet">
          {children}
          <Footer lang={lang} settings={content.settings} />
        </div>
        <WaFx label={t.common.waOpening} />
        <MotionRoot />
      </body>
    </html>
  );
}
