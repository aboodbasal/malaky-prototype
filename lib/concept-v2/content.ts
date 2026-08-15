/**
 * Content schema + demo content for the /concept-v2 concept.
 *
 * All marketing pieces rendered anywhere on the concept come from here, so a
 * single piece of data can be reused by the hero orbit, the mobile stack, the
 * fan-out section and the brand demo without being re-declared.
 */

import type { BrandId } from "./brands";

export type Platform =
  | "instagram"
  | "linkedin-company"
  | "linkedin-executive"
  | "arabic-social"
  | "newsletter"
  | "reel";

/**
 * Generated media scenes. Each one is drawn with layered CSS gradients in
 * BrandMedia — no image files, so the concept stays visually rich and light.
 */
export type MediaScene =
  | "nura-room"
  | "nura-still"
  | "falak-port"
  | "falak-ship"
  | "meezan-office"
  | "sidra-colonnade"
  | "sidra-table";

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16" | "3:2";

export interface PieceMedia {
  scene: MediaScene;
  /** Descriptive alt text — these are decorative-but-meaningful creatives. */
  alt: string;
  aspect: AspectRatio;
  /** Text burned into the creative, as a real marketing image would have. */
  overline?: string;
  caption?: string;
}

export interface Engagement {
  likes?: number;
  comments?: number;
  reposts?: number;
  views?: string;
}

export type PieceStatus = "prepared" | "ready" | "approved" | "scheduled";

export interface MarketingPiece {
  id: string;
  brandId: BrandId;
  platform: Platform;
  /** Chrome label, e.g. "Instagram Post". */
  label: string;
  /** Executive key from EXECUTIVES, for executive posts. */
  executiveKey?: string;
  status?: PieceStatus;
  timestamp?: string;
  dir?: "ltr" | "rtl";
  copy: {
    /** Newsletter subject / reel title / instagram overline. */
    headline?: string;
    subhead?: string;
    body: string;
    cta?: string;
  };
  media?: PieceMedia;
  engagement?: Engagement;
  /** Reel duration, e.g. "0:18". */
  duration?: string;
}

/* ------------------------------------------------------------------ *
 * Hero — six finished pieces across the demo ecosystem
 * ------------------------------------------------------------------ */

export const HERO_PIECES: MarketingPiece[] = [
  {
    id: "hero-instagram",
    brandId: "nura",
    platform: "instagram",
    label: "Instagram Post",
    status: "prepared",
    timestamp: "Prepared 05:47",
    copy: {
      body: "Timeless comfort, crafted for the room you actually live in.",
      cta: "New collection",
    },
    media: {
      scene: "nura-room",
      alt: "A softly lit living room in cream and taupe with a low linen sofa",
      aspect: "1:1",
      overline: "New collection",
    },
    engagement: { likes: 96, comments: 7 },
  },
  {
    id: "hero-linkedin-executive",
    brandId: "falak",
    platform: "linkedin-executive",
    label: "Executive LinkedIn",
    executiveKey: "ahmed",
    status: "ready",
    timestamp: "4h",
    copy: {
      body:
        "Three years ago, five days was a normal regional delivery quote. From Monday, we quote two. The network our team rebuilt is what made that ordinary.",
    },
    engagement: { likes: 58, comments: 9 },
  },
  {
    id: "hero-arabic-social",
    brandId: "sidra",
    platform: "arabic-social",
    label: "Arabic Social",
    dir: "rtl",
    status: "prepared",
    timestamp: "أُعدّ 06:02",
    copy: {
      headline: "موسم جديد في دار سِدرة",
      body: "موائد مفتوحة كل خميس، وغرفٌ تطل على الفناء وتفتح على هدوء المساء.",
      cta: "احجز طاولتك",
    },
    media: {
      scene: "sidra-colonnade",
      alt: "An arched colonnade in olive and cream with evening light",
      aspect: "1:1",
    },
    engagement: { likes: 74, comments: 5 },
  },
  {
    id: "hero-newsletter",
    brandId: "nura",
    platform: "newsletter",
    label: "Newsletter",
    status: "prepared",
    timestamp: "Sends Thursday, 09:00",
    copy: {
      headline: "This week at Nura Living",
      subhead: "The new collection, and the thinking behind it",
      body:
        "A curated update on our new arrivals and what's coming next — written for people who furnish slowly and keep things for a long time.",
      cta: "Read this week's edition",
    },
    media: {
      scene: "nura-still",
      alt: "A still life of ceramic vessels in warm taupe and cream",
      aspect: "3:2",
    },
  },
  {
    id: "hero-linkedin-company",
    brandId: "falak",
    platform: "linkedin-company",
    label: "LinkedIn Company Post",
    status: "ready",
    timestamp: "2h",
    copy: {
      body:
        "Our new regional delivery service launches Monday. Built for speed. Designed for businesses that plan around arrival times.",
    },
    media: {
      scene: "falak-port",
      alt: "Stacked shipping containers and crane gantries at dusk",
      aspect: "16:9",
    },
    engagement: { likes: 41, comments: 6, reposts: 2 },
  },
  {
    id: "hero-reel",
    brandId: "falak",
    platform: "reel",
    label: "Reel / Video",
    status: "prepared",
    duration: "0:18",
    timestamp: "Prepared 05:56",
    copy: {
      headline: "The next two days",
      body: "How the new regional route actually works.",
    },
    media: {
      scene: "falak-ship",
      alt: "A container ship at berth during blue hour",
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
  { time: "05:51", label: "CEO LinkedIn prepared", kind: "output", icon: "linkedin" },
  { time: "05:56", label: "Newsletter prepared", kind: "output", icon: "mail" },
  { time: "06:02", label: "Arabic campaign prepared", kind: "output", icon: "arabic" },
];

/* ------------------------------------------------------------------ *
 * Section 2 — intelligence states
 * ------------------------------------------------------------------ */

export interface IntelligenceState {
  id: string;
  title: string;
  body: string;
  /** The third state is live — Malaky acted before being asked. */
  active?: boolean;
  meta?: string;
  /** Small proof rows shown inside the card. */
  proof?: { label: string; value: string }[];
}

export const INTELLIGENCE_STATES: IntelligenceState[] = [
  {
    id: "brand-remembered",
    title: "Brand remembered",
    body:
      "Your brand, voice, products and audience — held in memory, not re-explained at the start of every task.",
    proof: [
      { label: "Voice", value: "Direct, unhurried" },
      { label: "Products", value: "34 in catalogue" },
      { label: "Audience", value: "3 segments" },
    ],
  },
  {
    id: "founder-voice",
    title: "Founder voice learned",
    body:
      "Malaky writes like the executive, not merely like the company. Their cadence, their examples, their restraint.",
    proof: [
      { label: "Voice model", value: "Huda Nasser" },
      { label: "Source", value: "24 approved posts" },
      { label: "Signature", value: "Specifics over adjectives" },
    ],
  },
  {
    id: "national-day",
    title: "Saudi National Day in 12 days",
    body:
      "Malaky saw the date coming, matched it to your calendar and prepared the campaign before anyone asked for it.",
    meta: "Campaign prepared",
    active: true,
    proof: [
      { label: "Channels", value: "6 prepared" },
      { label: "Arabic", value: "Written natively" },
      { label: "Awaiting", value: "Your approval" },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Section 3 — one event becomes everything
 * ------------------------------------------------------------------ */

export const SOURCE_EVENT = {
  brandId: "falak" as BrandId,
  kind: "Business event",
  title: "New regional delivery service launches Monday.",
  detail:
    "Two-day delivery across the region, replacing the five-day standard. Confirmed by operations, effective the 14th.",
};

/**
 * The same event, adapted per channel. Deliberately not one piece of copy
 * repeated six times — each channel has its own job, length and register.
 */
export const EVENT_FANOUT: MarketingPiece[] = [
  {
    id: "fanout-instagram",
    brandId: "falak",
    platform: "instagram",
    label: "Instagram",
    copy: {
      body: "Two days. Region-wide. From Monday.",
      cta: "Faster. Smarter. Delivered.",
    },
    media: {
      scene: "falak-port",
      alt: "Stacked shipping containers and crane gantries at sunset",
      aspect: "1:1",
      overline: "From Monday",
    },
    engagement: { likes: 88, comments: 6 },
  },
  {
    id: "fanout-linkedin-company",
    brandId: "falak",
    platform: "linkedin-company",
    label: "LinkedIn Company",
    timestamp: "Prepared",
    copy: {
      body:
        "Our new regional delivery service launches Monday. Two-day standard transit, tracked end to end, with committed arrival windows for contracted volume.",
    },
    media: {
      scene: "falak-port",
      alt: "Stacked shipping containers and crane gantries at sunset",
      aspect: "16:9",
    },
    engagement: { likes: 41, comments: 6, reposts: 2 },
  },
  {
    id: "fanout-linkedin-executive",
    brandId: "falak",
    platform: "linkedin-executive",
    label: "CEO LinkedIn",
    executiveKey: "ahmed",
    timestamp: "Prepared",
    copy: {
      body:
        "We used to quote five days and hope. Rebuilding the network took three years and a lot of unglamorous work. From Monday we quote two, and we mean it.",
    },
    engagement: { likes: 58, comments: 9 },
  },
  {
    id: "fanout-arabic-social",
    brandId: "falak",
    platform: "arabic-social",
    label: "Arabic Social",
    dir: "rtl",
    copy: {
      headline: "يومان. لا خمسة.",
      body: "من الاثنين، شبكة فلك تختصر الطريق بين مدنك. مواعيد تُلتزم، وشحنات تصل حين تحتاجها.",
      cta: "تعرّف على الخدمة",
    },
    media: {
      scene: "falak-ship",
      alt: "A container ship at berth during blue hour",
      aspect: "1:1",
    },
    engagement: { likes: 52, comments: 4 },
  },
  {
    id: "fanout-newsletter",
    brandId: "falak",
    platform: "newsletter",
    label: "Newsletter",
    copy: {
      headline: "A shorter route for your shipments",
      subhead: "What changes for your account on Monday",
      body:
        "From the 14th, your regional lanes move to a two-day standard. Nothing changes in how you book — your existing rates and pickup windows carry over.",
      cta: "See your new lanes",
    },
    media: {
      scene: "falak-ship",
      alt: "A container ship at berth during blue hour",
      aspect: "3:2",
    },
  },
  {
    id: "fanout-reel",
    brandId: "falak",
    platform: "reel",
    label: "Reel / Video",
    duration: "0:18",
    copy: {
      headline: "The next two days",
      body: "Depot to door, in the time it used to take to leave the city.",
    },
    media: {
      scene: "falak-port",
      alt: "Container terminal at dusk, composed vertically",
      aspect: "4:5",
    },
    engagement: { views: "1,240" },
  },
];

/* ------------------------------------------------------------------ *
 * Section 4 — approval
 * ------------------------------------------------------------------ */

export const APPROVAL_PIECE: MarketingPiece = {
  id: "approval-linkedin",
  brandId: "falak",
  platform: "linkedin-company",
  label: "LinkedIn Company Post",
  status: "ready",
  timestamp: "Prepared 05:47",
  copy: {
    body:
      "Our new regional delivery service launches Monday. Built for speed. Designed for businesses that plan around arrival times.",
  },
  media: {
    scene: "falak-port",
    alt: "Stacked shipping containers and crane gantries at dusk",
    aspect: "16:9",
  },
  engagement: { likes: 41, comments: 6, reposts: 2 },
};

export const APPROVAL_STAGES = ["Ready for review", "Approved", "Scheduled"] as const;

/* ------------------------------------------------------------------ *
 * Section 5 — memory / learning
 * ------------------------------------------------------------------ */

export const MEMORY_EXAMPLE = {
  brandId: "falak" as BrandId,
  original: "We're excited to announce our new service launch next week!",
  edited: "Starting Monday, we're raising the bar for regional delivery.",
  learned: {
    title: "Preference learned",
    body: "Direct. Less promotional language.",
    rules: ["No “excited to announce”", "Lead with the date", "Claim, then evidence"],
  },
  /** Written later, by itself, in the learned style. */
  future: {
    context: "Next draft — written 9 days later, unprompted",
    body: "From the 14th, same-day pickup covers the Eastern Province.",
  },
};

/* ------------------------------------------------------------------ *
 * Section 6 — Arabic is not a toggle
 * ------------------------------------------------------------------ */

export const BILINGUAL_CAMPAIGN = {
  brandId: "sidra" as BrandId,
  en: {
    label: "English campaign",
    badge: "EN",
    headline: "A stay that keeps its quiet",
    subhead: "Courtyard rooms, from October",
    body: "One seasonal menu, long tables on Thursdays, and rooms that face away from the street.",
    cta: "Book a stay",
    scene: "sidra-colonnade" as MediaScene,
    alt: "An arched colonnade in olive and cream with evening light",
  },
  /**
   * Composed in Arabic, not translated from the English above — different
   * opening, different rhythm, its own call to action.
   */
  ar: {
    label: "الحملة بالعربية",
    badge: "AR",
    headline: "إقامةٌ تُشبه الهدوء",
    subhead: "غرفٌ حول الفناء، وموائد تبدأ مع الغروب",
    body: "من أكتوبر: ليالٍ أطول، وقائمة موسمية واحدة، وخميسٌ محجوز للطاولات الطويلة.",
    cta: "احجز إقامتك",
    scene: "sidra-table" as MediaScene,
    alt: "A long dining table set in warm cream and burgundy tones",
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

/* ------------------------------------------------------------------ *
 * Section 7 — see Malaky with your brand (simulated)
 * ------------------------------------------------------------------ */

export const INGEST_STEPS = [
  "Logo identified",
  "Colors recognized",
  "Products understood",
  "Audience identified",
] as const;

/**
 * Mock ingestion results, keyed by brand. Replace this map with a real
 * ingestion response and the section renders unchanged.
 */
export const INGEST_RESULTS: Record<BrandId, string[]> = {
  nura: ["hero-instagram", "hero-newsletter", "hero-reel"],
  falak: ["fanout-linkedin-company", "fanout-newsletter", "fanout-reel"],
  meezan: ["meezan-linkedin", "meezan-newsletter", "meezan-reel"],
  sidra: ["hero-arabic-social", "sidra-newsletter", "sidra-reel"],
};

/** Extra pieces so every demo brand has a full ingestion result set. */
export const EXTRA_PIECES: MarketingPiece[] = [
  {
    id: "meezan-linkedin",
    brandId: "meezan",
    platform: "linkedin-company",
    label: "LinkedIn Company",
    timestamp: "Prepared",
    copy: {
      body:
        "Our 2026 outlook for regional mid-market operators is out. Three shifts we think boards should be budgeting for, and one we think is overstated.",
    },
    media: {
      scene: "meezan-office",
      alt: "A quiet advisory office in deep teal and charcoal",
      aspect: "16:9",
    },
    engagement: { likes: 34, comments: 5, reposts: 3 },
  },
  {
    id: "meezan-newsletter",
    brandId: "meezan",
    platform: "newsletter",
    label: "Newsletter",
    copy: {
      headline: "The quarter in three decisions",
      subhead: "What we're advising clients this month",
      body:
        "A short read for operators: where cost pressure is real, where it is seasonal, and the one line item worth protecting.",
      cta: "Read the note",
    },
    media: {
      scene: "meezan-office",
      alt: "A quiet advisory office in deep teal and charcoal",
      aspect: "3:2",
    },
  },
  {
    id: "meezan-reel",
    brandId: "meezan",
    platform: "reel",
    label: "Reel / Video",
    duration: "0:22",
    copy: {
      headline: "One chart, one decision",
      body: "The cost line most boards read backwards.",
    },
    media: {
      scene: "meezan-office",
      alt: "A quiet advisory office in deep teal and charcoal, shot vertically",
      aspect: "9:16",
    },
    engagement: { views: "870" },
  },
  {
    id: "sidra-newsletter",
    brandId: "sidra",
    platform: "newsletter",
    label: "Newsletter",
    copy: {
      headline: "Thursdays at Dar Sidra",
      subhead: "The open table returns this month",
      body:
        "Long tables in the courtyard, one seasonal menu, and rooms kept quiet for anyone staying the night.",
      cta: "Reserve a seat",
    },
    media: {
      scene: "sidra-table",
      alt: "A long dining table set in warm cream and burgundy tones",
      aspect: "3:2",
    },
  },
  {
    id: "sidra-reel",
    brandId: "sidra",
    platform: "reel",
    label: "Reel / Video",
    duration: "0:15",
    copy: {
      headline: "Before the guests arrive",
      body: "The hour the courtyard belongs to the house.",
    },
    media: {
      scene: "sidra-colonnade",
      alt: "An arched colonnade in olive and cream with evening light",
      aspect: "9:16",
    },
    engagement: { views: "1,610" },
  },
];

/** Every piece, addressable by id. */
export const ALL_PIECES: MarketingPiece[] = [
  ...HERO_PIECES,
  ...EVENT_FANOUT,
  ...EXTRA_PIECES,
  APPROVAL_PIECE,
];

export function getPiece(id: string): MarketingPiece | undefined {
  return ALL_PIECES.find((p) => p.id === id);
}
