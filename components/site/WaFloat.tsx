import { WhatsAppIcon } from "@/components/icons";
import type { Lang } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { waLink } from "@/lib/utils";

export default function WaFloat({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const t = getDict(lang);
  return (
    <a
      className="wa-float"
      href={waLink(settings.waNumber, t.contact.message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.contact.cta}
    >
      <WhatsAppIcon />
      <span>{t.contact.cta}</span>
    </a>
  );
}
