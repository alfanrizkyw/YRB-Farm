import Image from "next/image";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import type { Lang } from "@/lib/i18n";
import { getDict, site } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";

export default function Footer({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const t = getDict(lang);
  const home = lang === "en" ? "/en" : "/";
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Image
              src="/images/logo-berkah.png"
              alt={site.name}
              width={760}
              height={493}
              sizes="196px"
            />
            <p className="foot-tagline">{t.footer.tagline}</p>
            <p className="foot-motto">{t.vision.motto}</p>
          </div>

          <div className="foot-col">
            <h3>{t.footer.pages}</h3>
            <div className="foot-links">
              <a href={`${home}#produk`}>{t.nav.products}</a>
              <a href={`${home}#tentang`}>{t.nav.about}</a>
              <a href={`${home}#pasokan`}>{t.nav.supply}</a>
              <a href={`${home}#ulasan`}>{t.nav.reviews}</a>
              <a href={`${home}#faq`}>{t.nav.faq}</a>
              <a href={`${home}#kontak`}>{t.nav.contact}</a>
            </div>
          </div>

          <div className="foot-col">
            <h3>{t.footer.visit}</h3>
            <p className="foot-address">
              <span>
                <PinIcon /> {t.contact.farm}
              </span>
              {settings.farmAddress}
            </p>
            <a className="foot-map" href={site.mapsFarm} target="_blank" rel="noopener noreferrer">
              {t.contact.openMap}
            </a>
            <p className="foot-address">
              <span>
                <PinIcon /> {t.contact.office}
              </span>
              {settings.officeAddress}
            </p>
            <a className="foot-map" href={site.mapsOffice} target="_blank" rel="noopener noreferrer">
              {t.contact.openMap}
            </a>
          </div>

          <div className="foot-col">
            <h3>{t.contact.phone}</h3>
            <div className="foot-contact">
              <a href={`tel:${site.waNumber}`}>
                <PhoneIcon />
                {settings.phoneDisplay}
              </a>
              <a href={`mailto:${settings.email}`}>
                <MailIcon />
                {settings.email}
              </a>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>
            © {year} {site.name}. {t.footer.rights}
          </span>
          <div>
            <a href="#main">{t.common.backToTop}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
