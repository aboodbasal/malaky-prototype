import type { Customer, CustomerExecutive } from "@/lib/concept-v2/customers";
import styles from "./BrandMark.module.css";

/**
 * A customer's own logo, or an honest gap where it is not yet supplied.
 *
 * There is no third case. Nothing here draws a mark, letters a company name
 * into one, recolours artwork or crops a logo out of a screenshot — the whole
 * reason the fictional brand ecosystem was retired is that an invented mark
 * makes a real customer look made up. When `customer.logo` is null the
 * placeholder below renders instead: a neutral tile that reads as a reserved
 * slot rather than as anyone's identity.
 *
 * Supplying the artwork is a one-line change in lib/concept-v2/customers.ts.
 * See public/brand/customers/README.md for what is still outstanding.
 */
export function CustomerLogo({
  customer,
  size = 32,
}: {
  customer: Customer;
  size?: number;
}) {
  if (customer.logo) {
    return (
      <span className={styles.mark} style={{ width: size, height: size }}>
        {/* Placed at its own ratio inside the square, never stretched to it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customer.logo.src}
          alt={customer.logo.alt}
          width={customer.logo.width}
          height={customer.logo.height}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </span>
    );
  }

  return (
    <span
      className={`${styles.mark} ${styles.pending}`}
      style={{ width: size, height: size }}
      /* Named, so the absence is legible to a screen reader too. */
      role="img"
      aria-label={`${customer.name} — logo not yet supplied`}
      title={`${customer.name} — official logo pending`}
    >
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
        <rect
          x="3.5"
          y="3.5"
          width="25"
          height="25"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
      </svg>
    </span>
  );
}

/**
 * An executive's avatar.
 *
 * `portrait` is null for everyone in this concept, and a generated face would
 * be a likeness we invented for a real person. So the placeholder is a
 * monogram on a neutral surface — a convention every reader understands as
 * "no photograph", and not a claim about how anybody looks.
 */
export function ExecutiveAvatar({
  executive,
  size = 40,
}: {
  executive: CustomerExecutive;
  size?: number;
}) {
  if (executive.portrait) {
    return (
      <span className={styles.portrait} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={executive.portrait.src}
          alt={executive.portrait.alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </span>
    );
  }

  const initials = executive.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <span
      className={`${styles.portrait} ${styles.monogram}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      role="img"
      aria-label={executive.name}
    >
      {initials}
    </span>
  );
}
