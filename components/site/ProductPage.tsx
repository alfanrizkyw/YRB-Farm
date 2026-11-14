import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import type { Dict, Lang } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { waLink } from "@/lib/utils";

type Product = Dict["products"]["items"][number];

const delay = (value: number) => ({ "--d": value }) as CSSProperties;

export default function ProductPage({
  lang,
  product,
  settings,
}: {
  lang: Lang;
  product: Product;
  settings: SiteSettings;
}) {
  const t = getDict(lang);
  const p = t.productPage;
  const home = lang === "en" ? "/en" : "/";
  const order = waLink(settings.waNumber, `${p.order}: ${product.name}`);
  const related = t.products.items.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <main id="main" className="pd">
      <section className="pd-hero" aria-labelledby="pd-title">
        <div className="container">
          <nav className="pd-crumbs" aria-label="Breadcrumb">
            <Link href={home}>{p.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`${home}#produk`}>{t.nav.products}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="pd-grid">
            <div className="pd-copy">
              <span className="tag" data-reveal>
                {product.meta}
              </span>
              <h1 className="pd-title" id="pd-title" data-reveal="fade" style={delay(1)}>
                {product.name}
              </h1>
              <p className="pd-lead" data-reveal style={delay(2)}>
                {product.body}
              </p>
              <div className="pd-actions" data-reveal style={delay(3)}>
                <a
                  className="btn"
                  href={order}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon />
                  {p.order}
                </a>
                <Link className="btn btn--ghost" href={`${home}#produk`}>
                  {p.back}
                  <ArrowIcon />
                </Link>
              </div>
            </div>

            <figure className="pd-media" data-reveal="fade" style={delay(1)}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 44vw"
                quality={82}
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="section pd-detail">
        <div className="container pd-detail-grid">
          <div className="pd-main">
            <header className="pd-block-head" data-reveal>
              <span className="tag">{t.products.eyebrow}</span>
              <h2 className="display">{p.detail}</h2>
            </header>

            <p className="pd-intro" data-reveal style={delay(1)}>
              {product.intro}
            </p>

            <div className="pd-facts" data-reveal>
              <h3>{p.facts}</h3>
              <ul>
                {product.facts.map((fact) => (
                  <li key={fact}>
                    <CheckIcon />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pd-ideal" data-reveal style={delay(1)}>
              <h3>{p.ideal}</h3>
              <ul className="pd-chips">
                {product.ideal.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="pd-steps" data-reveal="fade">
            <h2>{p.stepsTitle}</h2>
            <ol>
              {p.steps.map((step, i) => (
                <li key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <a
              className="pd-steps-cta"
              href={order}
              target="_blank"
              rel="noopener noreferrer"
            >
              {p.order}
              <ArrowIcon />
            </a>
          </aside>
        </div>
      </section>

      <section className="section section--tint pd-related" aria-labelledby="pd-related-title">
        <div className="container">
          <header className="sec-head sec-head--center">
            <span className="tag" data-reveal>
              {t.products.eyebrow}
            </span>
            <h2 className="display" id="pd-related-title" data-reveal style={delay(1)}>
              {p.related}
            </h2>
          </header>

          <div className="pd-related-grid">
            {related.map((item, i) => (
              <Link
                className="pd-rel"
                key={item.slug}
                href={`${home}/produk/${item.slug}`}
                data-reveal
                style={delay(i)}
              >
                <div className="pd-rel-media">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 620px) 86vw, 30vw"
                    quality={80}
                  />
                </div>
                <div className="pd-rel-copy">
                  <span>{item.meta}</span>
                  <h3>{item.name}</h3>
                  <p>{item.body}</p>
                  <em>
                    {t.products.open}
                    <ArrowIcon />
                  </em>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
