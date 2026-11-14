import Image from "next/image";
import { CheckIcon, StarIcon, WhatsAppIcon } from "@/components/icons";
import HeroStage from "@/components/site/HeroStage";
import ReviewForm from "@/components/site/ReviewForm";
import type { CSSProperties } from "react";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import type { PublicContent } from "@/lib/types";
import { averageRating, formatDate, formatDayMonth, waLink } from "@/lib/utils";

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
  const wa = (msg?: string) => waLink(settings.waNumber, msg);
  const serviceThumbs = [
    "/images/flock-close.jpg",
    "/images/domba-kurban.jpg",
    "/images/barn-corridor.jpg",
    "/images/ram-portrait.jpg",
  ];
  const avg = averageRating(reviews.map((r) => r.rating));
  const year = new Date().getFullYear();

  return (
    <>
      <a className="skip" href="#main">
        {lang === "id" ? "Lewati ke konten" : "Skip to content"}
      </a>

      <main id="main">
        <section className="hero" id="beranda">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow" data-reveal>
                {t.hero.eyebrow}
              </p>
              <h1 data-reveal style={{ "--d": 1 } as CSSProperties}>
                {t.hero.titleA}
                <br />
                <em>{t.hero.titleB}</em>
              </h1>
              <p className="hero-desc" data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.hero.desc}
              </p>
              <div className="hero-ctas" data-reveal style={{ "--d": 3 } as CSSProperties}>
                <a className="btn" href={wa(t.contact.message)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {t.hero.cta}
                </a>
                <a className="btn btn--ghost" href="#layanan">
                  {t.hero.secondary}
                </a>
              </div>

              <dl className="stats" data-reveal style={{ "--d": 4 } as CSSProperties}>
                {t.hero.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.value}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div data-reveal="fade" className="hero-stage-wrap">
              <HeroStage liveLabel={t.hero.live} fallbackLabel={t.hero.fallback} caption={t.hero.caption} />
            </div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...t.marquee, ...t.marquee].map((word, i) => (
              <span key={`${word}-${i}`}>{word}</span>
            ))}
          </div>
        </div>

        {/* 01 about */}
        <section className="section" id="tentang">
          <div className="container about-grid">
            <div>
              <p className="eyebrow" data-reveal>
                {t.about.eyebrow}
              </p>
              <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                {t.about.title}
              </h2>
              <p className="about-lead" data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.about.lead}
              </p>
              <p className="about-body" data-reveal style={{ "--d": 3 } as CSSProperties}>
                {t.about.body}
              </p>
              <p className="about-note" data-reveal style={{ "--d": 4 } as CSSProperties}>
                {t.about.regionNote}
              </p>
            </div>

            <figure className="about-fig" data-reveal="fade" style={{ "--d": 2 } as CSSProperties}>
              <div className="frame">
                <Image
                  src="/images/barn-wide.jpg"
                  alt={t.about.photoNote}
                  fill
                  sizes="(max-width: 900px) 92vw, 44vw"
                  quality={82}
                />
              </div>
              <figcaption>
                <span>{t.about.photoNote}</span>
                <span>2014—{year}</span>
              </figcaption>
            </figure>
          </div>

          <div className="container pillars">
            {t.about.pillars.map((pillar, i) => (
              <article className="pillar" key={pillar.title} data-reveal style={{ "--d": i } as CSSProperties}>
                <h3>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {pillar.title}
                </h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 02 vision */}
        <section className="section vision" id="visi">
          <div className="container">
            <div className="vision-grid">
              <div>
                <p className="eyebrow eyebrow--paper" data-reveal>
                  {t.vision.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.vision.title}
                </h2>
                <span className="vision-label">{t.vision.visionLabel}</span>
                <p className="vision-quote" data-reveal>
                  {t.vision.vision}
                </p>
              </div>

              <div>
                <span className="vision-label" style={{ marginTop: 0 }}>
                  {t.vision.missionLabel}
                </span>
                <ol className="missions">
                  {t.vision.missions.map((mission, i) => (
                    <li key={mission} data-reveal style={{ "--d": i } as CSSProperties}>
                      <span>{mission}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="motto" data-reveal>
              <p>“{t.vision.motto}”</p>
              <span>{t.vision.mottoLabel}</span>
            </div>
          </div>
        </section>

        {/* 03 services */}
        <section className="section" id="layanan">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.services.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.services.title}
                </h2>
              </div>
              <p data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.markets.note}
              </p>
            </div>

            <div className="svc-list">
              {t.services.items.map((item, i) => (
                <article className="svc" key={item.title} data-reveal style={{ "--d": i } as CSSProperties}>
                  <span className="svc-no">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <span className="svc-meta">{item.meta}</span>
                  <Image
                    className="svc-thumb"
                    src={serviceThumbs[i]}
                    alt=""
                    width={148}
                    height={96}
                    sizes="148px"
                  />
                </article>
              ))}
            </div>

            <div className="svc-values">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.services.valueEyebrow}
                </p>
                <h3 data-reveal style={{ marginTop: "0.9rem" } as CSSProperties}>
                  {t.services.valueTitle}
                </h3>
              </div>
              <ul className="value-list" data-reveal>
                {t.services.values.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 04 qurban */}
        <section className="section qurban" id="aqiqah">
          <div className="container qurban-grid">
            <figure className="qurban-fig" data-reveal="fade">
              <div className="frame">
                <Image
                  src="/images/domba-kurban.jpg"
                  alt={t.qurban.caption}
                  fill
                  sizes="(max-width: 860px) 92vw, 42vw"
                  quality={82}
                />
              </div>
              <figcaption>{t.qurban.caption}</figcaption>
            </figure>

            <div>
              <p className="eyebrow" data-reveal>
                {t.qurban.eyebrow}
              </p>
              <h2 className="display" data-reveal style={{ "--d": 1 } as CSSProperties}>
                {t.qurban.title}
              </h2>
              <p className="qurban-body" data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.qurban.body}
              </p>

              <ul className="checks">
                {t.qurban.checks.map((check, i) => (
                  <li key={check} data-reveal style={{ "--d": i } as CSSProperties}>
                    <CheckIcon />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>

              <div className="qurban-ctas" data-reveal>
                <a className="btn" href={wa(t.qurban.aqiqahMessage)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {t.qurban.aqiqahCta}
                </a>
                <a className="btn btn--ghost" href={wa(t.qurban.qurbanMessage)} target="_blank" rel="noopener noreferrer">
                  {t.qurban.qurbanCta}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 05 process */}
        <section className="section" id="alur">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.process.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.process.title}
                </h2>
              </div>
              <p data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.about.body}
              </p>
            </div>

            <div className="process-grid">
              {t.process.steps.map((step, i) => (
                <article className="step" key={step.title} data-reveal style={{ "--d": i } as CSSProperties}>
                  <span className="step-no">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 06 reasons */}
        <section className="section section--tight" id="alasan">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.reasons.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.reasons.title}
                </h2>
              </div>
              <p data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.about.regionNote}
              </p>
            </div>

            <div className="reasons-grid">
              {t.reasons.items.map((reason, i) => (
                <div className="reason" key={reason} data-reveal style={{ "--d": i } as CSSProperties}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 07 markets */}
        <section className="section markets" id="pasar">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow eyebrow--paper" data-reveal>
                  {t.markets.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.markets.title}
                </h2>
              </div>
            </div>

            <ul className="market-list">
              {t.markets.items.map((item, i) => (
                <li key={item} data-reveal style={{ "--d": i } as CSSProperties}>
                  {item}
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>

            <p className="market-note" data-reveal>
              {t.markets.note}
            </p>
          </div>
        </section>

        {/* promo */}
        <section className="section" id="promo">
          <div className="container">
            <div className="promo-head">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.promos.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.promos.title}
                </h2>
                <p style={{ marginTop: "0.8rem", color: "var(--ink-2)", maxWidth: "46ch" }} data-reveal>
                  {t.promos.desc}
                </p>
              </div>
              <a className="link-arrow" href={wa(t.promos.message)} target="_blank" rel="noopener noreferrer">
                {t.promos.cta}
              </a>
            </div>

            {promos.length ? (
              <div className="promo-grid">
                {promos.map((promo, i) => (
                  <article className="promo-card" key={promo.id} data-reveal style={{ "--d": i } as CSSProperties}>
                    <div>
                      <span className="promo-badge">{promo.badge || "Promo"}</span>
                      <h3>{promo.title}</h3>
                      {promo.description ? <p>{promo.description}</p> : null}
                    </div>
                    <div className="promo-foot">
                      <span>
                        {promo.validUntil ? `${t.promos.validUntil} ${formatDayMonth(promo.validUntil, lang)}` : ""}
                      </span>
                      <a href={wa(`${promo.title} — ${t.promos.message}`)} target="_blank" rel="noopener noreferrer">
                        {t.promos.cta}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="promo-empty" data-reveal>
                <p>{t.promos.empty}</p>
                <a className="btn" href={wa(t.promos.message)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {t.promos.cta}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* gallery */}
        <section className="section section--tight" id="galeri">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.gallery.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                  {t.gallery.title}
                </h2>
              </div>
              <p data-reveal style={{ "--d": 2 } as CSSProperties}>
                {t.gallery.desc}
              </p>
            </div>

            <div className="gallery-strip">
              {t.gallery.photos.map((photo, i) => {
                const next = t.gallery.photos[(i + 1) % t.gallery.photos.length];
                return (
                  <figure className="arch" key={photo.src} data-reveal="fade" style={{ "--d": i } as CSSProperties}>
                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 560px) 74vw, 30vw" quality={82} />
                    <Image src={next.src} alt="" fill sizes="(max-width: 560px) 74vw, 30vw" quality={78} aria-hidden="true" />
                    <figcaption>{photo.caption}</figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>

        {/* reviews */}
        <section className="section" id="ulasan">
          <div className="container reviews-grid">
            <div>
              <p className="eyebrow" data-reveal>
                {t.reviews.eyebrow}
              </p>
              <h2 className="display" data-reveal style={{ "--d": 1, marginTop: "1.2rem" } as CSSProperties}>
                {t.reviews.title}
              </h2>
              <p style={{ marginTop: "0.8rem", color: "var(--ink-2)", maxWidth: "48ch" }} data-reveal>
                {t.reviews.desc}
              </p>

              <div className="score" data-reveal>
                <strong>{avg}</strong>
                <div>
                  {reviews.length ? <Stars value={Math.round(Number(avg.replace(",", ".")))} /> : null}
                  <small>
                    {reviews.length} {t.reviews.count}
                  </small>
                </div>
              </div>

              <div className="review-list">
                {reviews.length ? (
                  reviews.slice(0, 8).map((review) => (
                    <article className="review" key={review.id} data-reveal>
                      <div className="review-head">
                        <span className="review-name">{review.name}</span>
                        <span className="review-meta">
                          {review.city} · {formatDate(review.createdAt, lang)}
                        </span>
                      </div>
                      <Stars value={review.rating} />
                      <p>{review.message}</p>
                    </article>
                  ))
                ) : (
                  <p className="review-empty">{t.reviews.empty}</p>
                )}
              </div>
            </div>

            <div data-reveal="fade" style={{ "--d": 1 } as CSSProperties}>
              <ReviewForm t={t.reviews} />
            </div>
          </div>
        </section>

        {/* contact */}
        <section className="section contact" id="kontak">
          <div className="container">
            <div className="contact-top">
              <div>
                <p className="eyebrow" data-reveal>
                  {t.contact.eyebrow}
                </p>
                <h2 className="display" data-reveal style={{ "--d": 1 } as CSSProperties}>
                  {t.contact.title}
                </h2>
                <p style={{ marginTop: "0.9rem", color: "var(--ink-2)", maxWidth: "48ch" }} data-reveal>
                  {t.contact.desc}
                </p>
              </div>
              <a className="btn btn--brass" href={wa(t.contact.message)} target="_blank" rel="noopener noreferrer" data-reveal>
                <WhatsAppIcon />
                {t.contact.cta}
              </a>
            </div>

            <div className="contact-cols">
              <div className="contact-col" data-reveal>
                <h3>{t.contact.wa}</h3>
                <a className="big" href={wa(t.contact.message)} target="_blank" rel="noopener noreferrer">
                  {settings.phoneDisplay}
                </a>
                <br />
                <a className="big" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </div>

              <div className="contact-col" data-reveal style={{ "--d": 1 } as CSSProperties}>
                <h3>{t.contact.farm}</h3>
                <p>{settings.farmAddress}</p>
                <a className="map-link" href="https://www.google.com/maps/search/?api=1&query=Margosari%20Limbangan%20Kendal" target="_blank" rel="noopener noreferrer">
                  {t.contact.openMap}
                </a>
              </div>

              <div className="contact-col" data-reveal style={{ "--d": 2 } as CSSProperties}>
                <h3>{t.contact.office}</h3>
                <p>{settings.officeAddress}</p>
                <a className="map-link" href="https://www.google.com/maps/search/?api=1&query=Jl.%20Klentengsari%20Banyumanik%20Semarang" target="_blank" rel="noopener noreferrer">
                  {t.contact.openMap}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
