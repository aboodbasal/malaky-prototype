import { getCustomer } from "@/lib/concept-v2/customers";
import { BILINGUAL_CAMPAIGN } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { CustomerLogo } from "../CustomerLogo";
import { SectionHead, Stop } from "../ui";
import { ArrowRight } from "../icons";
import styles from "./arabic.module.css";

type Side = typeof BILINGUAL_CAMPAIGN.en | typeof BILINGUAL_CAMPAIGN.ar;

function CampaignPanel({
  side,
  dir,
  lang,
  tint,
}: {
  side: Side;
  dir: "ltr" | "rtl";
  lang: string;
  tint: string;
}) {
  const customer = getCustomer(BILINGUAL_CAMPAIGN.customerId);
  const rtl = dir === "rtl";
  return (
    <figure className={styles.panel} dir={dir} lang={lang} style={{ "--tint": tint } as React.CSSProperties}>
      <figcaption className={styles.panelHead}>
        <span className={rtl ? styles.labelAr : styles.label}>{side.label}</span>
        <span className={styles.badge}>{side.badge}</span>
      </figcaption>

      <div className={styles.body}>
        <div className={styles.copy}>
          {/* Larger than a social avatar on purpose: this is a campaign
              panel, and a detailed lockup is illegible at 24px. */}
          <CustomerLogo customer={customer} size={40} />
          <h3 className={rtl ? styles.headlineAr : styles.headline}>{side.headline}</h3>
          <p className={rtl ? styles.subAr : styles.sub}>{side.subhead}</p>
          <p className={rtl ? styles.textAr : styles.text}>{side.body}</p>
          <span className={rtl ? styles.ctaAr : styles.cta}>
            {side.cta}
            <ArrowRight size={13} style={rtl ? { transform: "rotate(180deg)" } : undefined} />
          </span>
        </div>

        <div className={styles.media}>
          <BrandMedia scene={side.scene} alt={side.alt} aspect="4:5" />
        </div>
      </div>
    </figure>
  );
}

/**
 * Two campaigns for the same brand and the same moment, each composed in its
 * own language. The Arabic panel is not a translation of the English one.
 */
export function Arabic() {
  return (
    <section className={styles.section} id="arabic" aria-labelledby="arabic-title">
      <div className="shell">
        <SectionHead
          id="arabic-title"
          title={
            <>
              Arabic isn&rsquo;t a language toggle
              <Stop />
            </>
          }
          lead="It's a native experience. Malaky writes Arabic as its own campaign — its own opening, its own rhythm, its own call to action — rather than running the English through a translator."
        />

        <div className={styles.pair}>
          {/* Neutral tints. They separate the two panels; they are not anyone's
              brand colours, because we hold none. */}
          <CampaignPanel side={BILINGUAL_CAMPAIGN.en} dir="ltr" lang="en" tint="38, 48, 58" />
          <CampaignPanel side={BILINGUAL_CAMPAIGN.ar} dir="rtl" lang="ar" tint="46, 39, 33" />
        </div>

        <p className={styles.note}>
          {BILINGUAL_CAMPAIGN.note} Both campaigns prepared by Malaky.
        </p>
      </div>
    </section>
  );
}
