/**
 * Brand analysis — the replaceable layer behind "See Malaky with your brand".
 *
 * `analyzeBrand(domain)` is the seam. Today it is a pure, synchronous mock:
 * nothing is fetched, no request leaves the page, and no website is read. It
 * returns a `BrandAnalysis`, and every presentation component in the section
 * consumes only that shape — no component reads BRANDS directly or hardcodes
 * a company.
 *
 * Because nothing is read, the result carries a `mode`, and that mode governs
 * what the UI is allowed to say:
 *
 *   "authored"     — one of the four demo companies. Every value was written
 *                    by hand for a fictional business, so the section may
 *                    present it as something Malaky worked out.
 *   "illustrative" — any other domain, including a visitor's own. Nothing was
 *                    read, so nothing may be presented as discovered. No
 *                    country, market, product, customer segment, executive
 *                    identity or business event is asserted; every value is
 *                    labelled as an example, and the opportunity is an
 *                    illustration rather than a detection.
 *
 * The distinction is enforced here rather than in the components: the labels
 * travel with the data, so a presentation layer cannot accidentally state an
 * example as a fact.
 *
 * To connect real ingestion later, replace the body of `analyzeBrand` with a
 * call that returns the same shape (see `analyzeBrandAsync`) and return
 * mode: "authored" for anything genuinely read from a source.
 *
 * The result is deliberately plain data — serialisable, so a future
 * /preview/<slug> route could rehydrate a saved analysis. Sharing is not
 * built here.
 */

import { BRANDS, type Brand, type BrandId, type Executive } from "./brands";
import type { MarketingPiece } from "./content";
import {
  resolveChannelMedia,
  type BrandMediaSet,
  type MediaScene,
} from "./media";

/* ------------------------------------------------------------------ *
 * Shape
 * ------------------------------------------------------------------ */

/**
 * Whether the values in a result were authored for a demo company or are
 * standing in for a real analysis that has not happened.
 */
export type AnalysisMode = "authored" | "illustrative";

export interface Opportunity {
  /**
   * Carried with the data so the two cases can never be confused:
   * "Opportunity detected" for an authored scenario, "Illustrative
   * opportunity" when nothing was read.
   */
  label: string;
  title: string;
  detail: string;
}

/** One row of the intelligence table, already labelled for its mode. */
export interface AnalysisFact {
  label: string;
  value: string;
}

/** Channels this section can present. Drives the selector, in this order. */
export type AnalysisChannel =
  | "linkedin-company"
  | "instagram"
  | "linkedin-executive"
  | "newsletter";

export interface AnalysisOutput {
  channel: AnalysisChannel;
  /** Short label for the channel selector. */
  label: string;
  piece: MarketingPiece;
}

export interface BrandAnalysis {
  mode: AnalysisMode;
  company: {
    name: string;
    domain: string;
    /**
     * Brand-shaped identity: mark, palette and handle. Named `logo` to match
     * the analysis contract — it is what BrandMark and the post chrome draw.
     */
    logo: Brand;
  };
  /**
   * Sits under the company name. In illustrative mode this must not be a
   * factual claim — no industry, no country.
   */
  subtitle: string;
  /** Hex values, most dominant first. */
  palette: string[];
  paletteLabel: string;
  /** The intelligence table, in order. Labels already reflect the mode. */
  facts: AnalysisFact[];
  opportunity: Opportunity;
  outputs: AnalysisOutput[];
}

/* ------------------------------------------------------------------ *
 * Domain handling
 * ------------------------------------------------------------------ */

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;

/**
 * Reduces what a person actually types to a bare host.
 * "https://www.Falak Logistics.com/about?x=1" → "falaklogistics.com".
 * Returns null when the input could not be a website address.
 */
export function normalizeDomain(input: string): string | null {
  let value = (input ?? "").trim().toLowerCase();
  if (!value) return null;

  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // scheme
  value = value.replace(/^www\./, "");
  value = value.split(/[/?#]/)[0]; // path, query, fragment
  value = value.replace(/:\d+$/, ""); // port
  value = value.replace(/\.$/, ""); // trailing dot
  value = value.replace(/\s+/g, "");

  if (!value || value.length > 253) return null;
  if (!DOMAIN_RE.test(value)) return null;
  return value;
}

/** Stable hash so the same domain always produces the same company. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(list: T[], seed: number, offset = 0): T {
  return list[(seed + offset) % list.length];
}

/* ------------------------------------------------------------------ *
 * Known demo companies
 * ------------------------------------------------------------------ */

interface Profile {
  brandId: BrandId;
  industry: string;
  location: string;
  products: string[];
  audiences: string[];
  markets: string[];
  tone: string[];
  /** The label is applied by `analyzeBrand`, which knows the mode. */
  opportunity: Omit<Opportunity, "label">;
  executive: Executive;
  /**
   * Purpose-built creative per channel. Empty today — every channel falls
   * back to `fallbackScene` until real assets are supplied.
   */
  media?: BrandMediaSet;
  /** Placeholder used by any channel with no assigned asset. Temporary. */
  fallbackScene: MediaScene;
  /** Copy per channel — written for the channel, not reformatted. */
  copy: {
    company: string;
    instagram: { overline: string; caption: string; dir?: "rtl" };
    executive: string;
    newsletter: { subject: string; preheader: string; body: string; cta: string };
  };
}

const PROFILES: Record<BrandId, Profile> = {
  falak: {
    brandId: "falak",
    industry: "Logistics",
    location: "Saudi Arabia",
    products: ["Regional logistics", "Same-day delivery"],
    audiences: ["B2B operations & logistics leaders"],
    markets: ["Riyadh", "Jeddah"],
    tone: ["Direct", "Professional", "Operational"],
    opportunity: {
      title: "Regional delivery expansion",
      detail:
        "Two-day regional transit replaces the five-day standard from the 14th. Confirmed by operations, not yet announced.",
    },
    executive: {
      name: "Ahmed Al Farsi",
      role: "Chief Executive Officer, Falak Logistics",
      brandId: "falak",
      initials: "AF",
    },
    fallbackScene: "falak-port",
    copy: {
      company:
        "Our regional network moves to a two-day standard on Monday. Committed arrival windows on contracted volume, tracked end to end, and no change to how you book.",
      instagram: {
        overline: "From Monday",
        caption: "Two days. Region-wide. Same booking, shorter wait.",
      },
      executive:
        "We used to quote five days and hope. Rebuilding the network took three years of unglamorous work — depots, night runs, a lot of arguing about routing. From Monday we quote two, and we mean it.",
      newsletter: {
        subject: "A shorter route for your shipments",
        preheader: "What changes on your account on Monday",
        body:
          "From the 14th your regional lanes move to a two-day standard. Your rates, pickup windows and booking flow stay exactly as they are.",
        cta: "See your new lanes",
      },
    },
  },
  nura: {
    brandId: "nura",
    industry: "Interiors & home lifestyle",
    location: "Saudi Arabia",
    products: ["Living room collections", "Made-to-order upholstery"],
    audiences: ["Homeowners furnishing slowly", "Interior designers"],
    markets: ["Riyadh", "Jeddah"],
    tone: ["Calm", "Considered", "Unhurried"],
    opportunity: {
      title: "New collection launch",
      detail:
        "The autumn collection opens to trade partners on Sunday, with an eight-week made-to-order lead time.",
    },
    executive: {
      name: "Layla Haddad",
      role: "Founder, Nura Living",
      brandId: "nura",
      initials: "LH",
    },
    fallbackScene: "nura-room",
    copy: {
      company:
        "The new collection opens to trade partners on Sunday. Made-to-order upholstery, eight-week lead times, and a full specification pack for designers working to a deadline.",
      instagram: {
        overline: "New collection",
        caption: "Made to be kept, not replaced. The new collection is here.",
      },
      executive:
        "We nearly cut the made-to-order line last year. Eight weeks is a hard promise to sell against furniture that ships tomorrow. We kept it because the people willing to wait are the ones who still have the sofa in ten years.",
      newsletter: {
        subject: "This week at Nura Living",
        preheader: "The new collection, and the thinking behind it",
        body:
          "A short update on what has just arrived and what is coming next — written for people who furnish slowly and keep things for a long time.",
        cta: "Read this week's edition",
      },
    },
  },
  meezan: {
    brandId: "meezan",
    industry: "Professional advisory",
    location: "Saudi Arabia",
    products: ["Operating reviews", "Market entry advisory"],
    audiences: ["Boards and mid-market operators"],
    markets: ["Riyadh", "GCC"],
    tone: ["Credible", "Precise", "Executive"],
    opportunity: {
      title: "Quarterly outlook publication",
      detail:
        "The 2026 outlook for regional mid-market operators is signed off and scheduled for release this quarter.",
    },
    executive: {
      name: "Huda Nasser",
      role: "Managing Partner, Meezan Advisory",
      brandId: "meezan",
      initials: "HN",
    },
    fallbackScene: "meezan-office",
    copy: {
      company:
        "Our 2026 outlook for regional mid-market operators is out. Three shifts we think boards should be budgeting for, and one we think is overstated.",
      instagram: {
        overline: "2026 outlook",
        caption: "One chart, one decision: the cost line most boards read backwards.",
      },
      executive:
        "Most boards I sit with are budgeting for the shock they remember rather than the one in front of them. That is the whole reason we publish this, and why the least popular section is usually the useful one.",
      newsletter: {
        subject: "The quarter in three decisions",
        preheader: "What we're advising clients this month",
        body:
          "A short read for operators: where cost pressure is real, where it is seasonal, and the one line item worth protecting.",
        cta: "Read the note",
      },
    },
  },
  sidra: {
    brandId: "sidra",
    industry: "Hospitality",
    location: "Saudi Arabia",
    products: ["Courtyard rooms", "Seasonal dining"],
    audiences: ["Weekend travellers", "Private dining groups"],
    markets: ["Riyadh", "Jeddah"],
    tone: ["Warm", "Unhurried", "Hospitable"],
    opportunity: {
      title: "Season opening",
      detail:
        "The courtyard reopens in October with one seasonal menu and long tables held every Thursday.",
    },
    executive: {
      name: "Reem Al Qadi",
      role: "Founder, Dar Sidra",
      brandId: "sidra",
      initials: "RQ",
    },
    fallbackScene: "sidra-colonnade",
    copy: {
      company:
        "The courtyard reopens in October. One seasonal menu, long tables every Thursday, and rooms kept quiet for anyone staying the night.",
      // Composed in Arabic, not translated from the company post.
      instagram: {
        overline: "أكتوبر",
        caption: "موسم جديد في دار سِدرة. موائد تبدأ مع الغروب، وغرفٌ تطل على الفناء.",
        dir: "rtl",
      },
      executive:
        "We closed for two months and the question everyone asked was what we were adding. We took things away — half the menu, most of the noise. The courtyard was always the reason people came.",
      newsletter: {
        subject: "Thursdays at Dar Sidra",
        preheader: "The open table returns this month",
        body:
          "Long tables in the courtyard, one seasonal menu, and rooms kept quiet for anyone staying the night.",
        cta: "Reserve a seat",
      },
    },
  },
};

/** Domains the mock recognises, mapped to the centralised demo brands. */
const KNOWN_DOMAINS: Record<string, BrandId> = {
  "falaklogistics.com": "falak",
  "nuraliving.com": "nura",
  "meezanadvisory.com": "meezan",
  "darsidra.com": "sidra",
};

export const DEMO_DOMAINS = Object.keys(KNOWN_DOMAINS);

/* ------------------------------------------------------------------ *
 * Illustrative preview — every other domain
 *
 * Nothing below describes a real company, because nothing has been read.
 * These are neutral visual identities and example copy: no industry, no
 * country, no market, no product, no customer segment, no executive name and
 * no business event. The only value derived from the visitor's input is the
 * company's display name, which comes from the domain they typed.
 * ------------------------------------------------------------------ */

/**
 * A palette and mark so the preview looks like a designed artifact rather
 * than a wireframe. Chosen by a stable hash of the domain so the same input
 * always looks the same — it is a placeholder identity, never a claim about
 * the company's real branding, and it is labelled as such.
 */
const EXAMPLE_IDENTITIES: Array<{
  mark: Brand["mark"];
  palette: Brand["palette"];
  scene: MediaScene;
}> = [
  {
    mark: "wing",
    palette: {
      primary: "#1b3350",
      secondary: "#d9743a",
      accent: "#6b8fb8",
      ink: "#101f33",
      paper: "#ffffff",
    },
    scene: "falak-ship",
  },
  {
    mark: "scales",
    palette: {
      primary: "#164a4a",
      secondary: "#262a2e",
      accent: "#8fb3ac",
      ink: "#0b1c1c",
      paper: "#e8e2d6",
    },
    scene: "meezan-office",
  },
  {
    mark: "arch",
    palette: {
      primary: "#a9927d",
      secondary: "#6f7357",
      accent: "#c08c82",
      ink: "#33291f",
      paper: "#efe6da",
    },
    scene: "nura-room",
  },
  {
    mark: "canopy",
    palette: {
      primary: "#3e4a32",
      secondary: "#5c2733",
      accent: "#c2a878",
      ink: "#25291d",
      paper: "#eae0ce",
    },
    scene: "sidra-colonnade",
  },
];

/**
 * The example copy set.
 *
 * Each channel demonstrates the shape Malaky writes to — what leads, how long
 * it runs, what register it uses — without asserting anything about the
 * visitor's business. No dates, no cities, no products, no numbers.
 */
const EXAMPLE_COPY: Profile["copy"] = {
  company:
    "The shape of a company post: what changes for the customer first, the operational detail second, one clear next step at the end. Written to the length your team has approved before.",
  instagram: {
    overline: "Example",
    caption: "One line, one image, one reason to care. The detail lives on the channels built for it.",
  },
  executive:
    "The same news in a leader's register: first person, one concrete detail, no announcement language. Malaky learns this voice from posts your executive has already approved.",
  newsletter: {
    subject: "The shape of a Malaky newsletter",
    preheader: "An example of the structure, not a real send",
    body:
      "What changed, what it means for this reader specifically, and what they need to do — in that order, at the length your audience already reads.",
    cta: "Example call to action",
  },
};

/** "acme-trading.com" → "Acme Trading" */
function companyNameFromDomain(domain: string): string {
  const sld = domain.split(".")[0];
  const words = sld
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean);
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ------------------------------------------------------------------ *
 * Output construction
 * ------------------------------------------------------------------ */

function buildOutputs(args: {
  brand: Brand;
  executive: Executive;
  /** Purpose-built creative per channel. */
  media?: BrandMediaSet;
  /** Stand-in for any channel without an assigned asset. */
  fallbackScene: MediaScene;
  copy: Profile["copy"];
}): AnalysisOutput[] {
  const { brand, executive, media, fallbackScene, copy } = args;
  const fallback = {
    scene: fallbackScene,
    alt: `Campaign creative prepared for ${brand.name}`,
  };

  /**
   * Each channel asks for its own creative. Nothing shares one artwork any
   * more: assigning `media["instagram"]` changes only the Instagram output.
   */
  const mediaFor = (channel: Parameters<typeof resolveChannelMedia>[0]) =>
    resolveChannelMedia(channel, media, fallback);

  return [
    {
      channel: "linkedin-company",
      label: "LinkedIn",
      piece: {
        id: "demo-linkedin-company",
        brandId: brand.id,
        brand,
        platform: "linkedin-company",
        label: "LinkedIn Company Post",
        timestamp: "Prepared",
        copy: { body: copy.company },
        media: mediaFor("linkedin-company"),
        engagement: { likes: 38, comments: 5, reposts: 2 },
      },
    },
    {
      channel: "instagram",
      label: "Instagram",
      piece: {
        id: "demo-instagram",
        brandId: brand.id,
        brand,
        platform: "instagram",
        label: "Instagram Post",
        dir: copy.instagram.dir,
        postedAt: "2 hours ago",
        copy: { body: copy.instagram.caption },
        media: { ...mediaFor("instagram"), overline: copy.instagram.overline },
        engagement: { likes: 92, comments: 7 },
      },
    },
    {
      channel: "linkedin-executive",
      label: "Executive",
      piece: {
        id: "demo-linkedin-executive",
        brandId: brand.id,
        brand,
        executive,
        platform: "linkedin-executive",
        label: "LinkedIn · Executive",
        timestamp: "Prepared",
        copy: { body: copy.executive },
        engagement: { likes: 54, comments: 8 },
      },
    },
    {
      channel: "newsletter",
      label: "Newsletter",
      piece: {
        id: "demo-newsletter",
        brandId: brand.id,
        brand,
        platform: "newsletter",
        label: "Newsletter",
        timestamp: "Draft",
        copy: {
          headline: copy.newsletter.subject,
          subhead: copy.newsletter.preheader,
          body: copy.newsletter.body,
          cta: copy.newsletter.cta,
        },
        media: mediaFor("newsletter"),
      },
    },
  ];
}

/* ------------------------------------------------------------------ *
 * The seam
 * ------------------------------------------------------------------ */

/**
 * Mock analysis. Pure and synchronous — nothing is fetched.
 *
 * `domain` must already be normalised via `normalizeDomain`.
 */
export function analyzeBrand(domain: string): BrandAnalysis {
  const knownId = KNOWN_DOMAINS[domain];

  if (knownId) {
    const profile = PROFILES[knownId];
    const brand = BRANDS[knownId];
    return {
      mode: "authored",
      company: { name: brand.name, domain, logo: brand },
      subtitle: `${profile.industry} · ${profile.location}`,
      palette: [
        brand.palette.primary,
        brand.palette.secondary,
        brand.palette.accent,
        brand.palette.paper,
      ],
      paletteLabel: "Brand colors",
      facts: [
        { label: "Audience", value: profile.audiences.join(" · ") },
        { label: "Markets", value: profile.markets.join(" · ") },
        { label: "Brand voice", value: profile.tone.join(" · ") },
        { label: "Products / services", value: profile.products.join(" · ") },
      ],
      opportunity: { ...profile.opportunity, label: "Opportunity detected" },
      outputs: buildOutputs({
        brand,
        executive: profile.executive,
        media: profile.media,
        fallbackScene: profile.fallbackScene,
        copy: profile.copy,
      }),
    };
  }

  /* Unknown domain. Nothing has been read, so nothing is claimed: the display
     name comes from what the visitor typed and every other value below is an
     example, labelled as one. */
  const seed = hash(domain);
  const identity = pick(EXAMPLE_IDENTITIES, seed);
  const name = companyNameFromDomain(domain) || "Your Company";

  const brand: Brand = {
    id: "falak", // structural placeholder; identity below is what renders
    name,
    category: "Example preview",
    shortCategory: "Example preview",
    feel: "Example",
    palette: identity.palette,
    handle: domain.split(".")[0],
    website: domain,
    mark: identity.mark,
  };

  /* A silhouette and a role, never a person. The avatar is generic artwork
     already; `initials` is only the SVG title. */
  const executive: Executive = {
    name: "Your executive",
    role: "Example executive voice",
    brandId: "falak",
    initials: "Example executive",
  };

  return {
    mode: "illustrative",
    company: { name, domain, logo: brand },
    subtitle: "Example profile — this website has not been read",
    palette: [
      identity.palette.primary,
      identity.palette.secondary,
      identity.palette.accent,
      identity.palette.paper,
    ],
    paletteLabel: "Example palette",
    facts: [
      { label: "Example audience", value: "The people this company already sells to" },
      { label: "Example channel mix", value: "LinkedIn · Instagram · Executive · Newsletter" },
      { label: "Example voice", value: "Set from your own approved writing" },
      { label: "Example campaign focus", value: "Whatever is next on your calendar" },
    ],
    opportunity: {
      label: "Illustrative opportunity",
      title: "The moment Malaky would prepare for",
      detail:
        "In a real deployment this is a date on your calendar, a product milestone or a market event Malaky is already tracking. Here it stands in for one.",
    },
    outputs: buildOutputs({
      brand,
      executive,
      fallbackScene: identity.scene,
      copy: EXAMPLE_COPY,
    }),
  };
}

/**
 * The async signature a real ingestion service should implement. Swap the
 * body for a fetch to the ingestion endpoint and the section keeps working:
 * it already awaits this and shows the analysis sequence while it resolves.
 */
export async function analyzeBrandAsync(domain: string): Promise<BrandAnalysis> {
  return analyzeBrand(domain);
}

/** The six states shown while the analysis runs. */
export const ANALYSIS_STATES = [
  "Brand identity identified",
  "Products & services understood",
  "Audience identified",
  "Markets identified",
  "Brand voice analyzed",
  "Relevant opportunities found",
] as const;
