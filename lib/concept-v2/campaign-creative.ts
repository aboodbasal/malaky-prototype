/**
 * Composed campaign creative — built from a customer's real campaign.
 *
 * The scenes in ./media are neutral by construction, because they stand in
 * where we know nothing about how a customer's marketing looks. This file is
 * the opposite case: Alpha Pro MENA published its Free AI Assessment campaign,
 * that creative is in this repository, and it tells us exactly what their
 * campaign design language is.
 *
 * So the creative below is composed rather than invented. Every element of it
 * is read off the customer's own published artwork:
 *
 * - the headline and the accented second word ("Free AI / Assessment"),
 * - the audience line, "For enterprise leaders",
 * - the supporting line, "A strategic evaluation to accelerate your AI journey",
 * - the four deliverables and their descriptions,
 * - the markets they say they serve, and their sign-off,
 * - the ground colour and the accent, sampled from the file itself
 *   (#1e1e1e and #f83860) rather than chosen by us.
 *
 * What is ours is the adaptation: a square Instagram composition and an Arabic
 * one, neither of which the customer published. Those are Malaky's work, the
 * section says so, and the campaign they are adapting is real.
 *
 * Nothing here recolours, redraws or reletters the logo. The mark is the
 * supplied file, placed.
 */

import type { CustomerId } from "./customers";

/**
 * Read from public/brand/real-posts/alpha-pro-mena/ by sampling the artwork —
 * the most common saturated value in the creative, and the ground behind it.
 * A brand colour taken from the brand's own published work is not an invented
 * palette; picking one that looked about right would have been.
 */
export const ALPHA_PRO_BRAND = {
  ground: "#1e1e1e",
  accent: "#f83860",
  source:
    "Sampled from Alpha Pro MENA's own published Free AI Assessment creative, held at public/brand/real-posts/alpha-pro-mena/.",
} as const;

export interface CreativeItem {
  title: string;
  detail: string;
}

/**
 * Two campaign shapes, because two customers compose differently.
 *
 * "deliverables" is Alpha Pro's: a headline over a strip of what you get.
 * "product" is Shrimp Joint's: the product named large on a dark ground, one
 * line about it, and an order prompt — which is what their own creative does.
 */
export type CreativeLayout = "deliverables" | "product";

export interface CampaignCreative {
  customerId: CustomerId;
  layout: CreativeLayout;
  dir: "ltr" | "rtl";
  /** Two-part headline; the second half takes the brand accent. */
  headline: string;
  headlineAccent: string;
  kicker: string;
  sub: string;
  /** Deliverables layout only. */
  items?: CreativeItem[];
  /** Product layout only: the order prompt, and the product's own name. */
  cta?: string;
  productName?: string;
  /** The footer band: who it is for, and the sign-off. Deliverables only. */
  footerLead?: string;
  footerMarkets?: string;
  signoff?: string;
  signoffAccent?: string;
  /** What the whole creative says, for anyone who cannot see it. */
  alt: string;
}

export type CampaignCreativeId =
  | "alpha-pro-assessment-en"
  | "alpha-pro-assessment-ar"
  | "shrimp-joint-crispy-en"
  | "shrimp-joint-crispy-ar";

/**
 * Read from public/brand/real-posts/shrimp-joint/ the same way Alpha Pro's
 * values were: the most common saturated orange in their own published
 * creative, and the near-black it sits on.
 *
 * What is deliberately *not* reproduced is the photograph. Their creative is
 * carried by a food shot we do not hold, and inventing one would be inventing
 * their product. So the composition is typographic — their ground, their
 * orange, their product named large — and the panel says it is Malaky's.
 */
export const SHRIMP_JOINT_BRAND = {
  ground: "#0a0605",
  accent: "#f87028",
  source:
    "Sampled from Shrimp Joint's own published “Crispy. Hot. Loaded.” creative, held at public/brand/real-posts/shrimp-joint/.",
} as const;

export const CAMPAIGN_CREATIVES: Record<CampaignCreativeId, CampaignCreative> = {
  /* The square adaptation. Same campaign, composed for a feed rather than for
     a LinkedIn image slot — four deliverables kept, the hero art dropped
     because we do not hold it. */
  "alpha-pro-assessment-en": {
    customerId: "alpha-pro",
    layout: "deliverables",
    dir: "ltr",
    headline: "Free AI",
    headlineAccent: "Assessment",
    kicker: "For enterprise leaders",
    sub: "A strategic evaluation to accelerate your AI journey.",
    items: [
      { title: "AI roadmap", detail: "Clear next steps aligned to your goals." },
      { title: "Data readiness review", detail: "Assess your data quality and readiness." },
      { title: "Use-case identification", detail: "Identify high-impact opportunities." },
      { title: "AI opportunity report", detail: "A tailored report with recommendations." },
    ],
    footerLead: "Serving enterprise leaders across",
    footerMarkets: "Jordan · Saudi Arabia · Oman",
    signoff: "Let's build what's next,",
    signoffAccent: "together.",
    alt:
      "An Alpha Pro MENA campaign creative headlined “Free AI Assessment”, for enterprise " +
      "leaders, listing an AI roadmap, a data readiness review, use-case identification and " +
      "an AI opportunity report, over the markets it serves.",
  },

  /* The Arabic adaptation. Composed right to left rather than mirrored: the
     headline leads on the question the audience actually has. */
  "alpha-pro-assessment-ar": {
    customerId: "alpha-pro",
    layout: "deliverables",
    dir: "rtl",
    headline: "تقييم الذكاء الاصطناعي",
    headlineAccent: "مجانًا",
    kicker: "لقادة المؤسسات",
    sub: "تقييم استراتيجي يختصر الطريق إلى الذكاء الاصطناعي.",
    items: [
      { title: "خارطة الطريق", detail: "خطوات واضحة تتوافق مع أهدافك." },
      { title: "مراجعة جاهزية البيانات", detail: "تقييم لجودة بياناتك وجاهزيتها." },
      { title: "تحديد حالات الاستخدام", detail: "الفرص الأعلى أثرًا أولًا." },
      { title: "تقرير الفرص", detail: "تقرير مخصص مع التوصيات." },
    ],
    footerLead: "نخدم قادة المؤسسات في",
    footerMarkets: "الأردن · السعودية · عُمان",
    signoff: "لنبنِ ما هو قادم،",
    signoffAccent: "معًا.",
    alt:
      "An Alpha Pro MENA campaign creative composed in Arabic for the same Free AI " +
      "Assessment campaign, listing the roadmap, data readiness review, use-case " +
      "identification and opportunity report.",
  },

  /* Their own campaign subject — the crispy fish sandwich — set the way their
     creative sets it: the product large, one line under it, an order prompt.
     Malaky's composition, their product and their brand values. */
  "shrimp-joint-crispy-en": {
    customerId: "shrimp-joint",
    layout: "product",
    dir: "ltr",
    headline: "Crispy",
    headlineAccent: "Fish",
    kicker: "Fried to order",
    sub: "Crisp on the outside, hot all the way through, and it reaches you ready for the first bite.",
    cta: "Order now",
    productName: "The crispy fish sandwich",
    alt:
      "A Shrimp Joint campaign creative on a near-black ground, headlined “Crispy Fish”, " +
      "for the crispy fish sandwich, with an order prompt.",
  },

  /* Composed in Arabic rather than translated: it opens on the promise, not on
     the product name, and closes on the order. */
  "shrimp-joint-crispy-ar": {
    customerId: "shrimp-joint",
    layout: "product",
    dir: "rtl",
    headline: "مقرمش",
    headlineAccent: "لأول لُقْمَة",
    kicker: "يُحضَّر عند الطلب",
    sub: "سمك مقرمش ولذيذ، يتم تحضيره عند الطلب ويوصلك جاهز لأول لُقْمَة.",
    cta: "اطلبه الآن",
    productName: "ساندويتش السمك المقرمش",
    alt:
      "The same Shrimp Joint campaign composed in Arabic, headlined “crispy, to the first " +
      "bite”, for the crispy fish sandwich, with an order prompt.",
  },
};

export function getCampaignCreative(id: CampaignCreativeId): CampaignCreative {
  return CAMPAIGN_CREATIVES[id];
}
