import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowIcon,
  CheckIcon,
  LeafIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  ScaleIcon,
  ShieldIcon,
  SproutIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";
import Faq from "@/components/site/Faq";
import ReviewForm from "@/components/site/ReviewForm";
import ReviewsCarousel from "@/components/site/ReviewsCarousel";
import type { Lang } from "@/lib/i18n";
import { getDict, site } from "@/lib/i18n";
import type { PublicContent } from "@/lib/types";
import { averageRating, formatDayMonth } from "@/lib/utils";

const pointIcons = [ScaleIcon, SproutIcon, LeafIcon];
const deliveryIcons = [TruckIcon, ShieldIcon];

const delay = (value: number) => ({ "--d": value }) as CSSProperties;

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} style={{ opacity: n <= value ? 1 : 0.22 }} />
      ))}
    </span>
  );
}

export default function Home({ lang, content }: { lang: Lang; content: PublicContent }) {
  const t = getDict(lang);
  const { settings, promos, reviews } = content;
  const avg = averageRating(reviews.map((review) => review.rating));
  const avgNumber = reviews.length ? Number(avg.replace(",", ".")) : 0;

  return (
    <>
      <a className="skip" href="#main">
        {lang === "id" ? "Lewati ke konten" : "Skip to content"}
      </a>

      <main id="main">
        <section className="hero" id="beranda" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-lamb" data-reveal="fade" aria-hidden="true">
                <span className="hero-lamb-sway">
                  <Image
                    className="hero-lamb-face"
                    src="/images/lamb-face.png"
                    alt=""
                    width={760}
                    height={668}
                    sizes="(max-width: 760px) 98px, 136px"
                  />
                  <Image
                    className="hero-lamb-face hero-lamb-blink"
                    src="/images/lamb-face-blink.png"
                    alt=""
                    width={760}
                    height={668}
                    sizes="(max-width: 760px) 98px, 136px"
                  />
                </span>
              </span>
              <span className="tag tag--light" data-reveal>
                {t.hero.eyebrow}
              </span>
              <h1 className="hero-title" id="hero-title">
                <span data-reveal="fade">{t.hero.titleA}</span>
                <span data-reveal="fade" style={delay(1)}>
                  {t.hero.titleB}
                </span>
              </h1>
              <p className="hero-lead" data-reveal style={delay(2)}>
                {t.hero.lead}
              </p>
              <div className="hero-actions" data-reveal style={delay(3)}>
                <a className="btn btn--cream" href="#produk">
                  {t.hero.cta}
                  <ArrowIcon />
                </a>
                <a
                  className="hero-link"
                  href={site.mapsFarm}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.hero.locationCta}
                  <ArrowIcon />
                </a>
              </div>
            </div>

            <figure className="hero-photo" data-reveal="fade" style={delay(1)}>
              <div className="hero-mark" data-parallax="0.02">
                <Image
                  className="hero-mark-logo"
                  src="/images/logo-berkah.png"
                  alt=""
                  width={760}
                  height={493}
                  priority
                  quality={95}
                  sizes="(max-width: 980px) 340px, 440px"
                />
              </div>
              <figcaption>{t.hero.caption}</figcaption>
            </figure>
          </div>

          <ul className="hero-stats">
            {t.hero.stats.map((stat, i) => (
              <li key={stat.label} data-reveal style={delay(i)}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...t.marquee, ...t.marquee].map((item, i) => (
              <span key={`${item}-${i}`}>{item}</span>
            ))}
          </div>
        </div>

        {promos.length ? (
          <section className="section" id="promo">
            <div className="container">
              <header className="sec-head sec-head--center">
                <span className="tag" data-reveal>
                  {t.promo.eyebrow}
                </span>
                <h2 className="display" data-reveal style={delay(1)}>
                  {t.promo.title}
                </h2>
              </header>

              <div className="promo-grid">
                {promos.slice(0, 3).map((promo, i) => (
                  <article className="promo-card" key={promo.id} data-reveal style={delay(i)}>
                    {promo.badge ? <span className="promo-badge">{promo.badge}</span> : null}
                    <h3>{promo.title}</h3>
                    <p>{promo.description}</p>
                    {promo.validUntil ? (
                      <span className="promo-until">
                        {t.promo.until} {formatDayMonth(promo.validUntil, lang)}
                      </span>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section" id="produk">
          <div className="container">
            <header className="sec-head sec-head--center">
              <span className="tag" data-reveal>
                {t.products.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.products.title}
              </h2>
              <p className="sec-desc" data-reveal style={delay(2)}>
                {t.products.desc}
              </p>
            </header>

            <div className="product-grid">
              {t.products.items.map((item, i) => (
                <Link
                  className="product"
                  key={item.slug}
                  href={`${lang === "en" ? "/en" : ""}/produk/${item.slug}`}
                  data-reveal
                  style={delay(i % 3)}
                >
                  <div className="product-head">
                    <h3>{item.name}</h3>
                    <span>{item.meta}</span>
                  </div>
                  <div className="product-media">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 620px) 86vw, (max-width: 1000px) 44vw, 30vw"
                      quality={82}
                    />
                  </div>
                  <p className="product-body">{item.body}</p>
                  <span className="product-more">
                    {t.products.open}
                    <ArrowIcon />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--tint" id="tentang">
          <div className="container about-grid">
            <figure className="about-media" data-reveal="fade">
              <Image
                src="/images/farm-barn.jpg"
                alt={t.about.imageAlt}
                width={760}
                height={820}
                sizes="(max-width: 520px) 90vw, 430px"
                quality={82}
              />
              <figcaption>{t.hero.caption}</figcaption>
            </figure>

            <div className="about-copy">
              <span className="tag" data-reveal>
                {t.about.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.about.title}
              </h2>
              <p className="about-lead" data-reveal style={delay(2)}>
                {t.about.lead}
              </p>

              <ul className="about-points">
                {t.about.points.map((point, i) => {
                  const Icon = pointIcons[i];
                  return (
                    <li key={point.title} data-reveal style={delay(i)}>
                      <span className="about-point-icon">
                        <Icon />
                      </span>
                      <div>
                        <strong>{point.title}</strong>
                        <p>{point.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="about-quality" data-reveal="fade">
                <strong>{t.about.qualityTitle}</strong>
                <p>{t.about.qualityText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="visi">
          <div className="container">
            <header className="sec-head sec-head--center">
              <span className="tag" data-reveal>
                {t.vision.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.vision.title}
              </h2>
            </header>

            <div className="vision-grid">
              <article className="vision-card" data-reveal>
                <span className="tag">{t.vision.visionTitle}</span>
                <p>{t.vision.vision}</p>
              </article>

              <article className="vision-card" data-reveal style={delay(1)}>
                <span className="tag">{t.vision.missionTitle}</span>
                <ol>
                  {t.vision.mission.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </article>
            </div>

            <p className="motto" data-reveal="fade">
              {t.vision.motto}
            </p>
          </div>
        </section>

        <section className="section" id="pasokan">
          <div className="container">
            <div className="supply-band">
              <div className="supply-copy">
                <span className="tag tag--light" data-reveal>
                  {t.supply.eyebrow}
                </span>
                <h2 className="display" data-reveal style={delay(1)}>
                  {t.supply.title}
                </h2>
                <p data-reveal style={delay(2)}>
                  {t.supply.desc}
                </p>
                <span className="supply-foot" data-reveal>
                  {t.supply.foot}
                </span>
              </div>

              <ul className="supply-tags">
                {t.supply.items.map((item, i) => (
                  <li key={item} data-reveal style={delay(i % 4)}>
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section section--tint" id="layanan">
          <div className="container">
            <header className="sec-head sec-head--center">
              <span className="tag" data-reveal>
                {t.delivery.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.delivery.title}
              </h2>
            </header>

            <div className="delivery-grid">
              {t.delivery.items.map((item, i) => {
                const Icon = deliveryIcons[i];
                return (
                  <article className="delivery-card" key={item.title} data-reveal style={delay(i)}>
                    <span className="delivery-icon">
                      <Icon />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </article>
                );
              })}
            </div>

            <div className="reasons">
              <header className="reasons-head" data-reveal>
                <span className="tag">{t.reasons.eyebrow}</span>
                <h2 className="display">{t.reasons.title}</h2>
                <p>{t.reasons.desc}</p>
              </header>

              <ul className="reasons-list">
                {t.reasons.items.map((item, i) => (
                  <li key={item} data-reveal style={delay(i)}>
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="ulasan">
          <div className="container">
            <header className="sec-head sec-head--center">
              <span className="tag" data-reveal>
                {t.reviews.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.reviews.title}
              </h2>
              <p className="sec-desc" data-reveal style={delay(2)}>
                {t.reviews.desc}
              </p>

              {reviews.length ? (
                <div className="review-score" data-reveal style={delay(3)}>
                  <strong>{avg}</strong>
                  <div>
                    <Stars value={Math.round(avgNumber)} />
                    <span>
                      {reviews.length} {t.reviews.count}
                    </span>
                  </div>
                </div>
              ) : null}
            </header>

            {reviews.length ? (
              <ReviewsCarousel
                reviews={reviews}
                lang={lang}
                labels={{ prev: t.reviews.prev, next: t.reviews.next }}
                empty={t.reviews.empty}
              />
            ) : (
              <div className="review-empty" data-reveal="fade">
                <span className="review-empty-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <strong>{t.reviews.empty}</strong>
                <p>{t.reviews.emptyNote}</p>
                <a className="btn btn--ghost" href="#kontak">
                  {t.reviews.linkCta}
                  <ArrowIcon />
                </a>
              </div>
            )}

            {reviews.length ? (
              <div className="review-cta" data-reveal="fade">
                <a className="btn btn--ghost" href="#kontak">
                  {t.reviews.linkCta}
                  <ArrowIcon />
                </a>
              </div>
            ) : null}
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container faq-wrap">
            <header className="sec-head sec-head--center">
              <span className="tag" data-reveal>
                {t.faq.eyebrow}
              </span>
              <h2 className="display" data-reveal style={delay(1)}>
                {t.faq.title}
              </h2>
              <p className="sec-desc" data-reveal style={delay(2)}>
                {t.faq.desc}
              </p>
            </header>

            <Faq items={t.faq.items} />
          </div>
        </section>

        <section className="section" id="kontak">
          <div className="container">
            <div className="contact-band">
              <div className="contact-grid">
                <div className="contact-info">
                  <span className="tag tag--light" data-reveal>
                    {t.contact.eyebrow}
                  </span>
                  <h2 className="display" data-reveal style={delay(1)}>
                    {t.contact.title}
                  </h2>
                  <p className="contact-desc" data-reveal style={delay(2)}>
                    {t.contact.desc}
                  </p>

                  <ul className="contact-list">
                    <li data-reveal>
                      <span className="contact-icon">
                        <PinIcon />
                      </span>
                      <div>
                        <span>{t.contact.farm}</span>
                        <strong>{settings.farmAddress}</strong>
                        <a
                          href={site.mapsFarm}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.contact.openMap}
                          <ArrowIcon />
                        </a>
                      </div>
                    </li>
                    <li data-reveal>
                      <span className="contact-icon">
                        <PinIcon />
                      </span>
                      <div>
                        <span>{t.contact.office}</span>
                        <strong>{settings.officeAddress}</strong>
                        <a
                          href={site.mapsOffice}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.contact.openMap}
                          <ArrowIcon />
                        </a>
                      </div>
                    </li>
                    <li data-reveal>
                      <span className="contact-icon">
                        <PhoneIcon />
                      </span>
                      <div>
                        <span>{t.contact.phone}</span>
                        <a href={`tel:+${settings.waNumber}`}>{settings.phoneDisplay}</a>
                      </div>
                    </li>
                    <li data-reveal>
                      <span className="contact-icon">
                        <MailIcon />
                      </span>
                      <div>
                        <span>{t.contact.email}</span>
                        <a href={`mailto:${settings.email}`}>{settings.email}</a>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="contact-form-wrap" data-reveal="fade">
                  <span className="contact-lamb" aria-hidden="true">
                    <span className="contact-lamb-sway">
                      <Image
                        className="contact-lamb-face"
                        src="/images/lamb-face.png"
                        alt=""
                        width={760}
                        height={668}
                        sizes="(max-width: 980px) 132px, 150px"
                      />
                      <Image
                        className="contact-lamb-face contact-lamb-blink"
                        src="/images/lamb-face-blink.png"
                        alt=""
                        width={760}
                        height={668}
                        sizes="(max-width: 980px) 132px, 150px"
                      />
                    </span>
                  </span>
                  <div className="contact-form">
                    <ReviewForm t={t.reviews} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
