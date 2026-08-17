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

export interface CampaignCreative {
  customerId: CustomerId;
  dir: "ltr" | "rtl";
  /** Two-part headline; the second half takes the brand accent. */
  headline: string;
  headlineAccent: string;
  kicker: string;
  sub: string;
  items: CreativeItem[];
  /** The footer band: who it is for, and the sign-off. */
  footerLead: string;
  footerMarkets: string;
  signoff: string;
  signoffAccent: string;
  /** What the whole creative says, for anyone who cannot see it. */
  alt: string;
}

export type CampaignCreativeId = "alpha-pro-assessment-en" | "alpha-pro-assessment-ar";

export const CAMPAIGN_CREATIVES: Record<CampaignCreativeId, CampaignCreative> = {
  /* The square adaptation. Same campaign, composed for a feed rather than for
     a LinkedIn image slot — four deliverables kept, the hero art dropped
     because we do not hold it. */
  "alpha-pro-assessment-en": {
    customerId: "alpha-pro",
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
};

export function getCampaignCreative(id: CampaignCreativeId): CampaignCreative {
  return CAMPAIGN_CREATIVES[id];
}
