"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import type { Lang, Dict } from "@/lib/i18n";

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

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [open, close]);

  const links = [
    { href: "#tentang", label: nav.about },
    { href: "#layanan", label: nav.services },
    { href: "#galeri", label: nav.gallery },
    { href: "#promo", label: nav.promo },
    { href: "#ulasan", label: nav.reviews },
    { href: "#kontak", label: nav.contact },
  ];

  return (
    <>
      <header className="head">
        {announcement ? (
          <p className="announce" role="status">
            {announcement}
          </p>
        ) : null}
        <div className="container head-inner">
          <Link className="brand" href={home} aria-label="Yahya Rizki Bersama Farm">
            <Image src="/images/logo.png" alt="" width={42} height={42} priority />
            <span className="brand-text">
              <span className="brand-top">Yahya Rizki</span>
              <span className="brand-bottom">Bersama Farm</span>
            </span>
          </Link>

          <nav className="nav" aria-label={lang === "id" ? "Navigasi utama" : "Main navigation"}>
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="head-actions">
            <Link className="lang" href={langHref} aria-label={nav.langSwitch} hrefLang={lang === "id" ? "en" : "id"}>
              {lang === "id" ? "EN" : "ID"}
            </Link>
            <a className="btn head-cta" href={waHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              {nav.cta}
            </a>
            <button
              className="menu-btn"
              type="button"
              aria-label={menuLabel}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className="drawer" id="mobile-menu" data-open={open} aria-hidden={!open}>
        <div className="drawer-top">
          <Link className="brand" href={home} onClick={close} tabIndex={open ? 0 : -1}>
            <Image src="/images/logo.png" alt="" width={38} height={38} />
            <span className="brand-text">
              <span className="brand-top">Yahya Rizki</span>
              <span className="brand-bottom">Bersama Farm</span>
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
            ✕
          </button>
        </div>

        <nav aria-label={lang === "id" ? "Navigasi seluler" : "Mobile navigation"}>
          {[{ href: home, label: nav.home }, ...links].map((l) => (
            <a key={l.href} href={l.href} onClick={close} tabIndex={open ? 0 : -1}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="drawer-foot">
          <a
            className="btn"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            tabIndex={open ? 0 : -1}
          >
            <WhatsAppIcon />
            {nav.cta}
          </a>
          <Link className="btn btn--ghost" href={langHref} onClick={close} tabIndex={open ? 0 : -1}>
            {nav.langSwitch}
          </Link>
        </div>
      </div>
    </>
  );
}
