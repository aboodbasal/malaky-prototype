import {
  ALPHA_PRO_BRAND,
  SHRIMP_JOINT_BRAND,
  getCampaignCreative,
  type CampaignCreativeId,
} from "@/lib/concept-v2/campaign-creative";
import { getCustomer } from "@/lib/concept-v2/customers";
import styles from "./CampaignCreative.module.css";

/**
 * A campaign creative composed on the customer's own image.
 *
 * The photograph or render is theirs, reframed and otherwise untouched. The
 * logo is the supplied artwork, placed. The colours are sampled from their
 * published work rather than chosen. What is ours is the arrangement and, on
 * an Arabic card, the Arabic — and the sections these sit in say so.
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
      className={`${styles.creative} ${styles[creative.layout]}`}
      dir={creative.dir}
      role="img"
      aria-label={creative.alt}
      style={{ "--ground": brand.ground, "--accent": brand.accent } as React.CSSProperties}
    >
      {/* Their own image, cropped from their published creative and reframed —
          the hero the composition is built around. The scrim over it is what
          resolves it into the ground; it changes nothing about the image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.photo}
        src={creative.photo.src}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: creative.photo.focal }}
      />
      <span className={styles.scrim} aria-hidden="true" />

      {customer.logo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={styles.logo} src={customer.logo.src} alt="" aria-hidden="true" />
      )}

      <p className={`${styles.kicker} ${ar}`}>{creative.kicker}</p>

      <p className={`${styles.headline} ${rtl ? styles.headlineAr : ""}`}>
        {creative.headline}
        <span className={styles.accent}>{creative.headlineAccent}</span>
      </p>

      <span className={styles.rule} aria-hidden="true" />

      {creative.cta ? (
        <div className={styles.orderRow}>
          <span className={`${styles.cta} ${ar}`}>{creative.cta}</span>
          <span className={`${styles.productName} ${ar}`}>{creative.productName}</span>
        </div>
      ) : (
        creative.productName && (
          <p className={`${styles.productName} ${styles.standalone} ${ar}`}>
            {creative.productName}
          </p>
        )
      )}

      {/* The markets the customer names on their own creative, in their words. */}
      {creative.markets && (
        <p className={`${styles.markets} ${ar}`}>{creative.markets}</p>
      )}
    </div>
  );
}
