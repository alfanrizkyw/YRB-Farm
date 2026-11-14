import Image from "next/image";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { waLink } from "@/lib/utils";

export default function Footer({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const t = getDict(lang);
  const home = lang === "en" ? "/en" : "/";
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Image src="/images/logo.png" alt="" width={58} height={58} />
            <div>
              <h2>Yahya Rizki Bersama Farm</h2>
              <p className="foot-tagline">{t.footer.tagline}</p>
            </div>
          </div>

          <div>
            <h3>{t.footer.pages}</h3>
            <div className="foot-links">
              <a href={`${home}#tentang`}>{t.nav.about}</a>
              <a href={`${home}#layanan`}>{t.nav.services}</a>
              <a href={`${home}#galeri`}>{t.nav.gallery}</a>
              <a href={`${home}#promo`}>{t.nav.promo}</a>
              <a href={`${home}#ulasan`}>{t.nav.reviews}</a>
              <a href={`${home}#kontak`}>{t.nav.contact}</a>
            </div>
          </div>

          <div>
            <h3>{t.footer.visit}</h3>
            <p className="foot-address">
              <span>{t.contact.farm}</span>
              {settings.farmAddress}
            </p>
            <p className="foot-address">
              <span>{t.contact.office}</span>
              {settings.officeAddress}
            </p>
            <div className="foot-links">
              <a href={waLink(settings.waNumber, t.contact.message)} target="_blank" rel="noopener noreferrer">
                {settings.phoneDisplay}
              </a>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>
            © {year} Yahya Rizki Bersama Farm. {t.footer.rights}
          </span>
          <a href="/admin">{t.footer.admin}</a>
        </div>
      </div>
    </footer>
  );
}
