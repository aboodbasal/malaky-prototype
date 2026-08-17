import { getCampaignCreative, ALPHA_PRO_BRAND, type CampaignCreativeId } from "@/lib/concept-v2/campaign-creative";
import { getCustomer } from "@/lib/concept-v2/customers";
import styles from "./CampaignCreative.module.css";

/**
 * A campaign creative composed in the customer's own design language.
 *
 * Everything structural here — the two-part headline, the audience line, the
 * four circled deliverables, the market band and the sign-off — is the layout
 * of the customer's own published campaign. The colours are sampled from that
 * file rather than chosen. The logo is the supplied artwork, placed.
 *
 * It scales with its frame rather than at fixed sizes: the card is ~280px wide
 * in the fan-out and much larger elsewhere, so type is set in cqw units
 * against the creative's own container. One composition, any size.
 */
export function CampaignCreative({ id }: { id: CampaignCreativeId }) {
  const creative = getCampaignCreative(id);
  const customer = getCustomer(creative.customerId);
  const rtl = creative.dir === "rtl";

  return (
    <div
      className={styles.creative}
      dir={creative.dir}
      role="img"
      aria-label={creative.alt}
      style={
        {
          "--ground": ALPHA_PRO_BRAND.ground,
          "--accent": ALPHA_PRO_BRAND.accent,
        } as React.CSSProperties
      }
    >
      {customer.logo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={styles.logo} src={customer.logo.src} alt="" aria-hidden="true" />
      )}

      <p className={`${styles.headline} ${rtl ? styles.headlineAr : ""}`}>
        {creative.headline}
        <span className={styles.accent}>{creative.headlineAccent}</span>
      </p>

      <span className={styles.rule} aria-hidden="true" />

      <p className={`${styles.kicker} ${rtl ? styles.ar : ""}`}>{creative.kicker}</p>
      <p className={`${styles.sub} ${rtl ? styles.ar : ""}`}>{creative.sub}</p>

      <ul className={styles.items}>
        {creative.items.map((item) => (
          <li key={item.title} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={`${styles.itemTitle} ${rtl ? styles.ar : ""}`}>{item.title}</span>
            <span className={`${styles.itemDetail} ${rtl ? styles.ar : ""}`}>{item.detail}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <p className={`${styles.markets} ${rtl ? styles.ar : ""}`}>
          {creative.footerLead} <span className={styles.accent}>{creative.footerMarkets}</span>
        </p>
        <p className={`${styles.signoff} ${rtl ? styles.ar : ""}`}>
          {creative.signoff} <span className={styles.accent}>{creative.signoffAccent}</span>
        </p>
      </div>
    </div>
  );
}
