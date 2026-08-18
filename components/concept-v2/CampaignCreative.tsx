import {
  ALPHA_PRO_BRAND,
  SHRIMP_JOINT_BRAND,
  getCampaignCreative,
  type CampaignCreativeId,
} from "@/lib/concept-v2/campaign-creative";
import { getCustomer } from "@/lib/concept-v2/customers";
import styles from "./CampaignCreative.module.css";

/**
 * A campaign creative composed in the customer's own design language.
 *
 * The structure of each layout is read off that customer's published work, and
 * so are the colours — sampled from their file rather than chosen. The logo is
 * the supplied artwork, placed. What is ours is the arrangement, and the
 * sections these sit in say so.
 *
 * It scales with its frame rather than at fixed sizes: the same composition
 * serves a ~270px card in the fan-out and a much larger campaign panel, so
 * type is set in container-query units against the creative's own box.
 */
export function CampaignCreative({ id }: { id: CampaignCreativeId }) {
  const creative = getCampaignCreative(id);
  const customer = getCustomer(creative.customerId);
  const rtl = creative.dir === "rtl";
  const brand = creative.customerId === "shrimp-joint" ? SHRIMP_JOINT_BRAND : ALPHA_PRO_BRAND;
  const ar = rtl ? styles.ar : "";

  return (
    <div
      className={`${styles.creative} ${styles[creative.layout] ?? ""}`}
      dir={creative.dir}
      role="img"
      aria-label={creative.alt}
      style={{ "--ground": brand.ground, "--accent": brand.accent } as React.CSSProperties}
    >
      {/* Their own product photography, cropped out of their published post and
          reframed — the hero the composition is built around. The scrim over it
          is what makes type legible on a photograph; it changes nothing about
          the photograph itself. */}
      {creative.photo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            src={creative.photo.src}
            alt=""
            aria-hidden="true"
            style={{ objectPosition: creative.photo.focal }}
          />
          <span className={styles.scrim} aria-hidden="true" />
        </>
      )}

      {customer.logo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={styles.logo} src={customer.logo.src} alt="" aria-hidden="true" />
      )}

      <p className={`${styles.headline} ${rtl ? styles.headlineAr : ""}`}>
        {creative.headline}
        <span className={styles.accent}>{creative.headlineAccent}</span>
      </p>

      <span className={styles.rule} aria-hidden="true" />

      <p className={`${styles.kicker} ${ar}`}>{creative.kicker}</p>
      <p className={`${styles.sub} ${ar}`}>{creative.sub}</p>

      {creative.items && (
        <ul className={styles.items}>
          {creative.items.map((item) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={`${styles.itemTitle} ${ar}`}>{item.title}</span>
              <span className={`${styles.itemDetail} ${ar}`}>{item.detail}</span>
            </li>
          ))}
        </ul>
      )}

      {creative.cta && (
        <div className={styles.orderRow}>
          <span className={`${styles.cta} ${ar}`}>{creative.cta}</span>
          <span className={`${styles.productName} ${ar}`}>{creative.productName}</span>
        </div>
      )}

      {creative.footerLead && (
        <div className={styles.footer}>
          <p className={`${styles.markets} ${ar}`}>
            {creative.footerLead} <span className={styles.accent}>{creative.footerMarkets}</span>
          </p>
          <p className={`${styles.signoff} ${ar}`}>
            {creative.signoff} <span className={styles.accent}>{creative.signoffAccent}</span>
          </p>
        </div>
      )}
    </div>
  );
}
