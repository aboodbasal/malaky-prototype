/**
 * Concept executions — the illustrative layer.
 *
 * Every company named here is a real Malaky customer, and every fact about
 * those companies lives in ./customers with the source it came from. This file
 * holds the other half: marketing **Malaky prepared**, written to demonstrate
 * what the product does.
 *
 * ## The line this file must not cross
 *
 * A real customer, real business context, and illustrative Malaky output. Not
 * fictional business information presented as reality, and not our copy
 * presented as theirs. So:
 *
 * - The business moment a piece is written about must be something the
 *   customer has actually said publicly. `SOURCE_EVENT` carries its source.
 * - The copy in the cards is ours. It is labelled as prepared work, and it is
 *   never shown as something the customer published.
 * - No engagement figure on a prepared card describes real performance. See
 *   ENGAGEMENT_NOTE below — the numbers are part of the depicted platform
 *   surface, and the section says so.
 * - Nothing states a revenue, a result, a date, a location, a partnership or
 *   an executive opinion that ./customers cannot source.
 *
 * Work the customers really published is not in this file at all. It lives in
 * ./real-posts as finished screenshots and renders untouched.
 */

import type { Customer, CustomerExecutive, CustomerId } from "./customers";
import type { MediaScene, PieceMedia } from "./media";
import type { RealPostId } from "./real-posts";

export type Platform =
  | "instagram"
  | "linkedin-company"
  | "linkedin-executive"
  | "arabic-social"
  | "newsletter"
  | "reel"
  /**
   * The piece *is* a finished screenshot the customer published. Nothing draws
   * chrome for it — the chrome is in the image. See ./real-posts.
   */
  | "real-screenshot";

/**
 * The platforms this concept draws chrome for. A real screenshot is excluded
 * by construction, so anything that renders a platform bar, an account row or
 * an engagement strip cannot be pointed at one.
 */
export type DrawnPlatform = Exclude<Platform, "real-screenshot">;

export type {
  AspectRatio,
  FocalPoint,
  ImageMedia,
  MediaScene,
  PieceMedia,
  VideoMedia,
} from "./media";

export interface Engagement {
  likes?: number;
  comments?: number;
  reposts?: number;
  views?: string;
}

/**
 * Said once, wherever prepared cards carry engagement chrome.
 *
 * The counts exist so a depicted post looks like a post rather than like a
 * text box. They are not performance, they are not anyone's results, and no
 * surface may present them as either.
 */
export const ENGAGEMENT_NOTE =
  "Prepared by Malaky. Interface figures are part of the illustration, not performance.";

/** The short label a prepared card carries so it is never mistaken for published work. */
export const PREPARED_LABEL = "Prepared by Malaky";

export type PieceStatus = "prepared" | "ready" | "approved" | "scheduled";

export interface MarketingPiece {
  id: string;
  /** Omitted only by real-screenshot pieces, which carry their own branding. */
  customerId?: CustomerId;
  /**
   * Overrides the CUSTOMERS lookup. The brand-analysis layer uses this so a
   * company the visitor typed renders through the same components.
   */
  customer?: Customer;
  platform: Platform;
  /** Chrome label, e.g. "Instagram Post". */
  label: string;
  /** Key from EXECUTIVES. Omit where no named person is attached. */
  executiveId?: string;
  /** Overrides the EXECUTIVES lookup, for companies typed into the demo. */
  executive?: CustomerExecutive;
  status?: PieceStatus;
  /** Malaky's own state, e.g. "Prepared 05:47". */
  timestamp?: string;
  /**
   * Platform-native posting time. Only ever set on a piece that really was
   * published — which in this repository means never, on a drawn card.
   */
  postedAt?: string;
  dir?: "ltr" | "rtl";
  copy: {
    headline?: string;
    subhead?: string;
    body: string;
    cta?: string;
  };
  media?: PieceMedia;
  engagement?: Engagement;
  /** Reel duration, e.g. "0:18". */
  duration?: string;
  /** Set only on `platform: "real-screenshot"` pieces. */
  realPostId?: RealPostId;
}

/**
 * A piece whose chrome this concept draws. Narrower than MarketingPiece by
 * exactly one case, so a surface that reasons per channel can be sure a real
 * screenshot never arrives there.
 */
export interface DrawnPiece extends MarketingPiece {
  platform: DrawnPlatform;
}

/* ------------------------------------------------------------------ *
 * Hero — six pieces across the customer base
 * ------------------------------------------------------------------ */

/**
 * Three of the six are work the customers actually published, entering as
 * `real-screenshot` pieces and rendering as the finished screenshot with no
 * chrome drawn around them. The other three are prepared concept work, and
 * each is labelled as prepared on the card itself.
 */
export const HERO_PIECES: MarketingPiece[] = [
  {
    id: "hero-instagram",
    platform: "real-screenshot",
    realPostId: "inception-branding",
    label: "Instagram Post",
    copy: {
      body:
        "We create end-to-end branding & production solutions that connect, inspire, and drive results.",
    },
  },
  {
    id: "hero-facebook",
    platform: "real-screenshot",
    realPostId: "shrimp-joint-crispy-fish",
    label: "Facebook Post",
    copy: { body: "Crispy. Hot. Loaded. Our crispy fish sandwich is here." },
  },
  {
    /* Composed in Arabic for a restaurant, not translated from an English
       original. The subject is the sandwich Shrimp Joint markets publicly. */
    id: "hero-arabic-social",
    customerId: "shrimp-joint",
    platform: "arabic-social",
    label: "Arabic Social",
    dir: "rtl",
    status: "prepared",
    timestamp: "أُعدّ 06:02",
    copy: {
      headline: "مقرمشة. ساخنة. للتو.",
      body: "ساندويتش السمك المقرمش — يُقلى عند الطلب، ويُقدَّم وهو لا يزال يطقطق.",
      cta: "شوف القائمة",
    },
    media: {
      scene: "still-life",
      alt: "A close still life of a plated dish under warm light",
      aspect: "1:1",
    },
    engagement: { likes: 74, comments: 5 },
  },
  {
    id: "hero-newsletter",
    platform: "real-screenshot",
    realPostId: "ataccama-newsletter",
    label: "Newsletter",
    copy: {
      headline: "Smarter Data. Stronger Decisions.",
      body: "Make data quality, governance, and trust your competitive edge.",
    },
  },
  {
    /* A draft prepared for a named executive, shown before she has seen it —
       which is the point of the card. Not a quotation, not something she has
       said, and the status says so. Subject matter is limited to what ILA
       states publicly about its own mission. */
    id: "hero-linkedin-executive",
    customerId: "ila",
    platform: "linkedin-executive",
    label: "Executive LinkedIn",
    executiveId: "dana",
    status: "prepared",
    timestamp: "Draft prepared 05:51",
    copy: {
      body:
        "Students arrive with the English they were taught. An American university asks for the English they will actually need. Closing that gap is the whole job.",
    },
    engagement: { likes: 58, comments: 9 },
  },
  {
    id: "hero-reel",
    customerId: "alpha-pro",
    platform: "reel",
    label: "Reel / Video",
    status: "prepared",
    duration: "0:18",
    timestamp: "Prepared 05:56",
    copy: {
      headline: "Governed, then intelligent",
      body: "Why data governance comes before enterprise AI.",
    },
    media: {
      scene: "signal-flow",
      alt: "An abstract flow of data across a wide dark frame",
      aspect: "9:16",
    },
    engagement: { views: "1,240" },
  },
];

/* ------------------------------------------------------------------ *
 * Hero — activity timeline ("Malaky is working")
 * ------------------------------------------------------------------ */

export interface ActivityEntry {
  time: string;
  label: string;
  /** The first entry is the trigger — it reads as the moment of noticing. */
  kind: "trigger" | "output";
  icon: "target" | "instagram" | "linkedin" | "mail" | "arabic";
}

export const ACTIVITY_TIMELINE: ActivityEntry[] = [
  { time: "05:42", label: "Campaign opportunity identified", kind: "trigger", icon: "target" },
  { time: "05:47", label: "Instagram prepared", kind: "output", icon: "instagram" },
  { time: "05:51", label: "Executive LinkedIn prepared", kind: "output", icon: "linkedin" },
  { time: "05:56", label: "Newsletter prepared", kind: "output", icon: "mail" },
  { time: "06:02", label: "Arabic campaign prepared", kind: "output", icon: "arabic" },
];

/* ------------------------------------------------------------------ *
 * Section 3 — one event becomes everything
 * ------------------------------------------------------------------ */

/**
 * The source event is real, and it is the only part of this section that is.
 *
 * Ataccama presents data observability as part of Ataccama ONE, and announced
 * Agentic Data Observability publicly on 26 February 2026. `source` records
 * where that came from; the four outputs below are ours.
 */
export const SOURCE_EVENT = {
  customerId: "ataccama" as CustomerId,
  kind: "Product update",
  title: "Data Observability now available.",
  detail:
    "Ataccama ONE monitors data in motion across pipelines alongside the data quality checks it already runs on data at rest, with anomaly detection, existing data quality rules reused across both, and alerting routed to the channels a team already uses.",
  source:
    "Ataccama's data observability product page, and its announcement of Agentic Data Observability in Ataccama ONE (26 February 2026).",
};

/**
 * The same real moment, adapted per channel — and every word of it written by
 * Malaky rather than by Ataccama.
 *
 * Four channels, not six. Each is wide enough to actually read, and every one
 * differs in copy, length, register and shape: a square image with one line, a
 * wide image carrying the operational detail, a draft in an executive's voice,
 * and a right-to-left campaign composed in Arabic.
 */
export const EVENT_FANOUT: DrawnPiece[] = [
  {
    id: "fanout-instagram",
    customerId: "ataccama",
    platform: "instagram",
    label: "Instagram",
    status: "prepared",
    copy: {
      body: "Now watching the pipeline, not just the table.",
      cta: "Data Observability, in Ataccama ONE.",
    },
    media: {
      scene: "data-lattice",
      alt: "An abstract lattice of data records with three anomalies flagged",
      aspect: "1:1",
      overline: "Now available",
    },
    engagement: { likes: 88, comments: 6 },
  },
  {
    id: "fanout-linkedin-company",
    customerId: "ataccama",
    platform: "linkedin-company",
    label: "LinkedIn Company",
    status: "prepared",
    timestamp: "Prepared",
    copy: {
      body:
        "Data Observability is now part of Ataccama ONE. Pipelines are monitored alongside the data quality rules you already run.",
    },
    media: {
      scene: "signal-flow",
      alt: "Streams of data crossing a wide frame, one interrupted and flagged",
      aspect: "16:9",
      focal: { x: 0.62, y: 0.55 },
    },
    engagement: { likes: 41, comments: 6, reposts: 2 },
  },
  {
    /* No named executive: Ataccama has not assigned one, and putting a real
       person's name on our copy without them is the exact thing this pass
       exists to remove. The card shows the draft waiting for a voice. */
    id: "fanout-linkedin-executive",
    customerId: "ataccama",
    platform: "linkedin-executive",
    label: "Executive LinkedIn",
    status: "prepared",
    timestamp: "Awaiting assignment",
    copy: {
      body:
        "Quality checks tell you the data was wrong. Observability tells you when it went wrong, and where. Those two belong in one place.",
    },
    engagement: { likes: 58, comments: 9 },
  },
  {
    id: "fanout-arabic-social",
    customerId: "ataccama",
    platform: "arabic-social",
    label: "Arabic Social",
    status: "prepared",
    dir: "rtl",
    copy: {
      headline: "راقب المسار، لا النتيجة وحدها.",
      body:
        "مراقبة البيانات صارت جزءًا من منصّة Ataccama ONE: تتبُّع لمسارات البيانات، وكشفٌ للانحرافات قبل أن تصل إلى التقارير، وتنبيهات تصل حيث يعمل فريقك.",
      cta: "تعرّف على الخدمة",
    },
    media: {
      scene: "data-lattice",
      alt: "An abstract lattice of data records with three anomalies flagged",
      aspect: "1:1",
    },
    engagement: { likes: 52, comments: 4 },
  },
];

/* ------------------------------------------------------------------ *
 * Section 4 — approval
 * ------------------------------------------------------------------ */

/**
 * Professional-services marketing is where approval earns its keep, so the
 * piece under review is prepared for Baker Tilly Saudi Arabia.
 *
 * IFRS 18 readiness is a service the firm publicly offers, and the three
 * cities are its own. Everything else on the card is ours — and deliberately
 * carries no effective date, no deadline and no regulatory claim, because
 * none of those has been verified here.
 */
export const APPROVAL_PIECE: MarketingPiece = {
  id: "approval-linkedin",
  customerId: "baker-tilly-sa",
  platform: "linkedin-company",
  label: "LinkedIn Company Post",
  status: "ready",
  timestamp: "Prepared 05:47",
  copy: {
    body:
      "IFRS 18 changes how performance is presented, not just what is disclosed. Our audit and assurance teams in Riyadh, Jeddah and Khobar are working through readiness with clients now.",
  },
  media: {
    scene: "office",
    alt: "A working office at dusk, city beyond the window",
    aspect: "16:9",
  },
  engagement: { likes: 41, comments: 6, reposts: 2 },
};

export const APPROVAL_STAGES = ["Ready for review", "Approved", "Scheduled"] as const;

/* ------------------------------------------------------------------ *
 * Section 5 — memory / learning
 * ------------------------------------------------------------------ */

/**
 * A demonstration of how Malaky would learn while operating a customer's
 * marketing — not a record of anything Inception DAP did.
 *
 * The edit is illustrative and the note on the section says so. It is about
 * register rather than about the business, precisely so that nothing here
 * turns into a claim: no product, no launch, no date.
 */
export const MEMORY_EXAMPLE = {
  customerId: "inception-dap" as CustomerId,
  original: "We're thrilled to announce that we now offer end-to-end branding and production!",
  edited: "End-to-end branding and production. Design through delivery.",
  learned: {
    title: "Preference learned",
    body: "Direct. Less promotional language.",
    rules: ["No “thrilled to announce”", "Lead with the offer", "Claim, then evidence"],
  },
  /** Written later, by itself, in the learned style. */
  future: {
    context: "Next draft — written 9 days later, unprompted",
    body: "Design through delivery, handled end to end.",
  },
  note: "Illustrative. Prepared by Malaky to show how a correction becomes a rule.",
};

/* ------------------------------------------------------------------ *
 * Section 6 — Arabic is not a toggle
 * ------------------------------------------------------------------ */

/**
 * One customer, one subject, two campaigns — each composed in its own
 * language rather than translated across.
 *
 * The subject is the sandwich Shrimp Joint markets publicly. Both campaigns
 * are ours: different opening, different rhythm, different call to action, and
 * neither is a rendering of the other.
 */
export const BILINGUAL_CAMPAIGN = {
  customerId: "shrimp-joint" as CustomerId,
  en: {
    label: "English campaign",
    badge: "EN",
    headline: "Fried to order, not to schedule",
    subhead: "The crispy fish sandwich",
    body: "It goes in when you order it, and it reaches you while it is still loud.",
    cta: "See the menu",
    scene: "still-life" as MediaScene,
    alt: "A close still life of a plated dish under warm light",
  },
  /**
   * Composed in Arabic — its own opening, its own rhythm, its own call to
   * action. Read the two side by side and neither is the other's translation.
   */
  ar: {
    label: "الحملة بالعربية",
    badge: "AR",
    headline: "تسمعها قبل أن تذوقها",
    subhead: "ساندويتش السمك المقرمش",
    body: "يُقلى عند الطلب، ويصل إليك وهو ما زال يطقطق. لا شيء يُحضَّر قبل أوانه.",
    cta: "اطلبها الآن",
    scene: "long-table" as MediaScene,
    alt: "A long table laid for service under low warm light",
  },
  note: "Different language. Different rhythm. Same brand.",
};

/* ------------------------------------------------------------------ *
 * Trust and control
 * ------------------------------------------------------------------ */

/**
 * Honesty rule for this section: `state` records what the *concept* can
 * currently show, not what the production product does. "demonstrated" means
 * the behaviour is actually exercised elsewhere on this page. "planned" means
 * it is described but not built anywhere yet, and is labelled as such in the
 * UI so nothing reads as a shipped capability.
 */
export interface TrustPillar {
  id: string;
  title: string;
  body: string;
  state: "demonstrated" | "planned";
}

export const TRUST_PILLARS: TrustPillar[] = [
  {
    id: "human-approval",
    title: "Human approval",
    body: "Nothing publishes until the required approval is given.",
    state: "demonstrated",
  },
  {
    id: "business-knowledge",
    title: "Business knowledge",
    body: "Malaky works from information the company has provided and approved.",
    state: "demonstrated",
  },
  {
    id: "roles-workflows",
    title: "Roles & workflows",
    body: "Different people can prepare, review and approve.",
    state: "planned",
  },
  {
    id: "source-visibility",
    title: "Source visibility",
    body: "When factual information matters, show where the suggestion came from before approval.",
    state: "planned",
  },
];
