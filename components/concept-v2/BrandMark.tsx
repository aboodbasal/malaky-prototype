import type { Brand } from "@/lib/concept-v2/brands";
import styles from "./BrandMark.module.css";

/**
 * Customer brand logos. Each demo brand gets a distinct geometric mark drawn
 * from its own palette, so posts read as different companies rather than as
 * six variations of one template.
 */

export function BrandMark({ brand, size = 32 }: { brand: Brand; size?: number }) {
  const { palette, mark } = brand;
  return (
    <span
      className={styles.mark}
      style={{
        width: size,
        height: size,
        background: mark === "wing" ? palette.primary : palette.paper,
      }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size} height={size}>
        {mark === "arch" && (
          <g stroke={palette.ink} strokeWidth="1.9" fill="none" strokeLinecap="round">
            <path d="M8 24V15a8 8 0 0 1 16 0v9" />
            <path d="M13 24v-9a3 3 0 0 1 6 0v9" />
          </g>
        )}
        {mark === "wing" && (
          <g fill={palette.secondary}>
            <path d="M4 15.5c6-1 11-4 14.5-8.5.5 4-1 7.5-3.5 10.5-2.5 2-7 2-11-2Z" />
            <path d="M9 24.5c6-.5 11-3 15-7.5-.2 4-2 7-5 9-3.5 1.6-7.5 1.1-10-1.5Z" opacity="0.75" />
          </g>
        )}
        {mark === "scales" && (
          <g stroke={palette.primary} strokeWidth="1.9" fill="none" strokeLinecap="round">
            <path d="M16 7v18M8.5 11h15M25 25H7" />
            <path d="M8.5 11 5 18h7l-3.5-7ZM23.5 11 20 18h7l-3.5-7Z" />
          </g>
        )}
        {mark === "canopy" && (
          <g fill="none" stroke={palette.primary} strokeWidth="1.9" strokeLinecap="round">
            <path d="M16 26V14" />
            <path d="M16 15c-6 0-9-3.5-9-7 0 0 3.5 2 5.5 1C14 8 15 6 16 6s2 2 3.5 3c2 1 5.5-1 5.5-1 0 3.5-3 7-9 7Z" />
          </g>
        )}
      </svg>
    </span>
  );
}

/**
 * Executive avatar. An abstract rim-lit portrait rather than a stock photo —
 * it reads correctly at 40px in a LinkedIn header without pretending to be a
 * real person.
 */
export function Portrait({
  brand,
  initials,
  size = 40,
  src,
  alt,
}: {
  brand: Brand;
  initials: string;
  size?: number;
  /** Real portrait. When absent the generated silhouette stands in. */
  src?: string;
  alt?: string;
}) {
  const id = `pt-${brand.id}`;

  if (src) {
    return (
      <span className={styles.portrait} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </span>
    );
  }

  return (
    <span className={styles.portrait} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor={brand.palette.accent} />
            <stop offset="100%" stopColor={brand.palette.ink} />
          </linearGradient>
        </defs>
        <rect width="48" height="48" fill={`url(#${id}-bg)`} />
        <circle cx="24" cy="19" r="9.4" fill={brand.palette.ink} opacity="0.92" />
        <path
          d="M6 48c1.6-9.6 9-15 18-15s16.4 5.4 18 15Z"
          fill={brand.palette.ink}
          opacity="0.92"
        />
        {/* rim light */}
        <path
          d="M30.5 12.6a9.4 9.4 0 0 1 1.4 10.9l-2.3-1.3a6.8 6.8 0 0 0-.9-8Z"
          fill={brand.palette.paper}
          opacity="0.5"
        />
        <path d="M33 35.6c3.9 2.6 6.4 6.9 7.4 12.4h-3.1c-.9-4.7-2.6-8.4-5.4-10.7Z" fill={brand.palette.paper} opacity="0.35" />
        <title>{initials}</title>
      </svg>
    </span>
  );
}
