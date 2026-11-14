"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "@/components/icons";
import type { Dict, Lang } from "@/lib/i18n";
import { site } from "@/lib/i18n";

type Props = {
  lang: Lang;
  nav: Dict["nav"];
  waHref: string;
  langHref: string;
  announcement?: string;
  menuLabel: string;
};

export default function Header({ lang, nav, waHref, langHref, announcement, menuLabel }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const home = lang === "en" ? "/en" : "/";
  const pathname = usePathname();
  const productSlug = pathname?.match(/^\/(?:en\/)?produk\/([^/]+)\/?$/)?.[1];
  const switchHref = productSlug
    ? lang === "en"
      ? `/produk/${productSlug}`
      : `/en/produk/${productSlug}`
    : langHref;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [open, close]);

  const links = [
    { href: `${home}#produk`, label: nav.products },
    { href: `${home}#tentang`, label: nav.about },
    { href: `${home}#pasokan`, label: nav.supply },
    { href: `${home}#ulasan`, label: nav.reviews },
    { href: `${home}#faq`, label: nav.faq },
    { href: `${home}#kontak`, label: nav.contact },
    { href: site.mapsFarm, label: nav.location, external: true },
  ];

  return (
    <>
      {announcement ? (
        <div className="announce">
          <span className="announce-dot" aria-hidden="true" />
          <span>{announcement}</span>
        </div>
      ) : null}

      <header className="head">
        <div className="head-shell">
          <Link className="brand" href={home} aria-label={site.name}>
            <span className="brand-text">
              <span className="brand-line">Berkah Rizki</span>
              <span className="brand-line">
                Bersama <em>Farm</em>
              </span>
            </span>
          </Link>

          <nav className="nav" aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}>
            {links.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ),
            )}
          </nav>

          <div className="head-actions">
            <Link
              className="lang"
              href={switchHref}
              aria-label={nav.langSwitch}
              hrefLang={lang === "id" ? "en" : "id"}
            >
              <span data-on={lang === "id"}>ID</span>
              <i aria-hidden="true">/</i>
              <span data-on={lang === "en"}>EN</span>
            </Link>

            <a
              className="btn btn--sm head-cta"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={nav.cta}
            >
              <WhatsAppIcon />
              <span className="head-cta-label">{nav.cta}</span>
            </a>

            <button
              className="menu-btn"
              type="button"
              aria-label={menuLabel}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="drawer" id="mobile-menu" data-open={open} aria-hidden={!open}>
        <button className="drawer-backdrop" type="button" tabIndex={-1} aria-hidden="true" onClick={close} />
        <div className="drawer-panel">
          <div className="drawer-top">
            <Link className="brand" href={home} onClick={close} tabIndex={open ? 0 : -1}>
              <span className="brand-text">
                <span className="brand-line">Berkah Rizki</span>
                <span className="brand-line">
                  Bersama <em>Farm</em>
                </span>
              </span>
            </Link>
            <button
              ref={closeRef}
              className="drawer-close"
              type="button"
              aria-label={menuLabel}
              onClick={close}
              tabIndex={open ? 0 : -1}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="drawer-nav" aria-label={lang === "id" ? "Navigasi seluler" : "Mobile navigation"}>
            {[{ href: home, label: nav.home, external: false }, ...links].map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="drawer-foot">
            <Link
              className="drawer-lang"
              href={switchHref}
              onClick={close}
              hrefLang={lang === "id" ? "en" : "id"}
              tabIndex={open ? 0 : -1}
            >
              {nav.langSwitch}
            </Link>
            <span className="drawer-loc">{site.farmAddress}</span>
          </div>
        </div>
      </div>
    </>
  );
}
