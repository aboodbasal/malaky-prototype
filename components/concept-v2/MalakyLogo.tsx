import { Wordmark } from "./BrandMark";
import styles from "./MalakyLogo.module.css";

/**
 * The Malaky identity, in one place.
 *
 * Every Malaky logo placement on the site renders through this component, so
 * sizing and behaviour stay consistent and the artwork is referenced exactly
 * once.
 *
 * `LOGO_ASSET` is that single reference. It is null until the official
 * calligraphic artwork is committed to public/brand/ (see the README there).
 * While it is null the temporary lettering placeholder renders, so nothing
 * regresses; setting the path switches every placement at once.
 *
 * The artwork is never recoloured, redrawn, cropped or stretched — it is
 * sized by height with `width: auto` and `object-fit: contain`.
 */
const LOGO_ASSET: string | null = null; // "/brand/malaky-logo-gold.png"

/** Rendered height per placement, in px. Width always follows the artwork. */
const SIZES = {
  nav: 34,
  footer: 48,
} as const;

export type LogoSize = keyof typeof SIZES;

export function MalakyLogo({
  size = "nav",
  /** True when the brand name is already exposed accessibly next to this. */
  decorative = false,
  className,
}: {
  size?: LogoSize;
  decorative?: boolean;
  className?: string;
}) {
  const height = SIZES[size];
  const classes = [styles.logo, styles[size], className].filter(Boolean).join(" ");

  if (!LOGO_ASSET) {
    // Placeholder until the official artwork lands. Not the real identity.
    return <Wordmark size={size === "footer" ? 30 : 26} className={className} />;
  }

  return (
    /* A plain <img> rather than next/image: the intrinsic dimensions of the
       artwork are fixed by the supplied file, and height-with-auto-width is
       exactly what must not be overridden. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_ASSET}
      alt={decorative ? "" : "Malaky"}
      aria-hidden={decorative || undefined}
      height={height}
      className={classes}
      draggable={false}
    />
  );
}

export { LOGO_ASSET };
