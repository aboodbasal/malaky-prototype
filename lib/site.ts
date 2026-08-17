/**
 * Where the site lives, what it is called, and the one card it shares with.
 *
 * ## The hostname is not decided
 *
 * Nothing here hard-codes a deployment hostname. `NEXT_PUBLIC_SITE_URL` is the
 * seam: production engineering supplies the final domain and every absolute
 * URL in the metadata follows it. Unset — which is the case in local
 * development and in the current concept deployment — it falls back to
 * localhost, which is a valid URL, so `metadataBase` resolves and no page ever
 * emits a broken or invented absolute address.
 *
 * Deliberately absent: an explicit `alternates.canonical`, robots directives
 * and a sitemap. Declaring a canonical URL is a production SEO decision, and
 * it cannot be made honestly before the hostname exists. That belongs to the
 * launch pass.
 */

import type { Metadata } from "next";

export const SITE_NAME = "Malaky";

/**
 * Trimmed because an environment variable that arrives with a trailing
 * newline is the classic way `new URL()` throws during a production build.
 */
const CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = CONFIGURED && CONFIGURED.length > 0 ? CONFIGURED : "http://localhost:3000";

/** One card for the whole site. See scripts/social-card.mjs. */
export const OG_IMAGE = {
  url: "/og/malaky-social.png",
  width: 1200,
  height: 630,
  alt: "Malaky — your marketing was working before you were.",
};

/* ------------------------------------------------------------------ *
 * The canonical homepage wording
 *
 * One title and one description, used by the HTML head, Open Graph and the
 * X card alike. Said once here so the three can never drift apart.
 * ------------------------------------------------------------------ */

export const HOME_TITLE = "Malaky — Your marketing was working before you were";

export const HOME_DESCRIPTION =
  "Malaky learns your business, watches what’s coming, and prepares your marketing across every channel before you ask.";

/**
 * A page's title and description, applied to the head, Open Graph and the X
 * card at once.
 *
 * Next merges metadata shallowly: a page that sets `openGraph` replaces its
 * parent's entirely. This helper is why that is safe — every page that
 * overrides it gets the full object back, image included, rather than
 * silently dropping the card.
 */
export function pageMetadata({
  title,
  description,
}: {
  title: string;
  description: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
