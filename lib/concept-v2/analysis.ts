/**
 * Brand analysis — the replaceable layer behind "See Malaky with your brand".
 *
 * `analyzeBrand(domain)` is the seam. Today it is a pure, synchronous mock:
 * nothing is fetched, no request leaves the page, and no website is read. It
 * returns a `BrandAnalysis`, and every presentation component in the section
 * consumes only that shape — no component reads BRANDS directly or hardcodes
 * a company.
 *
 * To connect real ingestion later, replace the body of `analyzeBrand` with a
 * call that returns the same shape (see `analyzeBrandAsync`). The UI does not
 * need to change.
 *
 * The result is deliberately plain data — serialisable, so a future
 * /preview/<slug> route could rehydrate a saved analysis. Sharing is not
 * built here.
 */

import { BRANDS, type Brand, type BrandId, type Executive } from "./brands";
import type { MarketingPiece, MediaScene } from "./content";

/* ------------------------------------------------------------------ *
 * Shape
 * ------------------------------------------------------------------ */

export interface Opportunity {
  title: string;
  detail: string;
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
  company: {
    name: string;
    domain: string;
    /**
     * Brand-shaped identity: mark, palette and handle. Named `logo` to match
     * the analysis contract — it is what BrandMark and the post chrome draw.
     */
    logo: Brand;
  };
  /** Hex values, most dominant first. */
  palette: string[];
  industry: string;
  /** Where the company operates from, shown beside the industry. */
  location: string;
  products: string[];
  audiences: string[];
  markets: string[];
  tone: string[];
  opportunities: Opportunity[];
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
  opportunity: Opportunity;
  executive: Executive;
  scene: MediaScene;
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
    scene: "falak-port",
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
    scene: "nura-room",
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
    scene: "meezan-office",
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
    scene: "sidra-colonnade",
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
 * Generated companies — any other domain still works
 * ------------------------------------------------------------------ */

const SECTORS: Array<{
  industry: string;
  products: string[];
  audiences: string[];
  tone: string[];
  scene: MediaScene;
  mark: Brand["mark"];
  palette: Brand["palette"];
  opportunity: (name: string, market: string) => Opportunity;
}> = [
  {
    industry: "Trading & distribution",
    products: ["Wholesale supply", "Regional distribution"],
    audiences: ["Procurement and operations teams"],
    tone: ["Professional", "Clear", "Direct"],
    scene: "falak-ship",
    mark: "wing",
    palette: {
      primary: "#1b3350",
      secondary: "#d9743a",
      accent: "#6b8fb8",
      ink: "#101f33",
      paper: "#ffffff",
    },
    opportunity: (name, market) => ({
      title: "New supply lane",
      detail: `${name} is opening regular distribution into ${market} next month.`,
    }),
  },
  {
    industry: "Professional services",
    products: ["Advisory retainers", "Operating reviews"],
    audiences: ["Founders and finance leads"],
    tone: ["Credible", "Precise", "Measured"],
    scene: "meezan-office",
    mark: "scales",
    palette: {
      primary: "#164a4a",
      secondary: "#262a2e",
      accent: "#8fb3ac",
      ink: "#0b1c1c",
      paper: "#e8e2d6",
    },
    opportunity: (name, market) => ({
      title: "Practice expansion",
      detail: `${name} is taking on ${market} clients for the first time this quarter.`,
    }),
  },
  {
    industry: "Retail & lifestyle",
    products: ["Seasonal collections", "Made-to-order pieces"],
    audiences: ["Considered buyers", "Repeat customers"],
    tone: ["Warm", "Considered", "Plain-spoken"],
    scene: "nura-room",
    mark: "arch",
    palette: {
      primary: "#a9927d",
      secondary: "#6f7357",
      accent: "#c08c82",
      ink: "#33291f",
      paper: "#efe6da",
    },
    opportunity: (name, market) => ({
      title: "Season launch",
      detail: `${name} is launching its next season, starting with ${market}.`,
    }),
  },
  {
    industry: "Hospitality",
    products: ["Rooms and stays", "Seasonal dining"],
    audiences: ["Weekend travellers", "Private groups"],
    tone: ["Warm", "Unhurried", "Hospitable"],
    scene: "sidra-colonnade",
    mark: "canopy",
    palette: {
      primary: "#3e4a32",
      secondary: "#5c2733",
      accent: "#c2a878",
      ink: "#25291d",
      paper: "#eae0ce",
    },
    opportunity: (name, market) => ({
      title: "Season opening",
      detail: `${name} reopens for the season, with ${market} bookings first.`,
    }),
  },
  {
    industry: "Industrial & logistics",
    products: ["Fleet operations", "Contract haulage"],
    audiences: ["Operations and supply chain leads"],
    tone: ["Direct", "Operational", "Factual"],
    scene: "falak-port",
    mark: "wing",
    palette: {
      primary: "#12233d",
      secondary: "#f26722",
      accent: "#5b7ba6",
      ink: "#0a1526",
      paper: "#ffffff",
    },
    opportunity: (name, market) => ({
      title: "Coverage expansion",
      detail: `${name} is extending contracted coverage to ${market} from next month.`,
    }),
  },
];

const MARKET_SETS = [
  ["Riyadh", "Jeddah"],
  ["Riyadh", "Dammam"],
  ["Jeddah", "Makkah"],
  ["Riyadh", "GCC"],
];

const EXEC_NAMES = [
  { name: "Sara Al Mutairi", initials: "SM" },
  { name: "Omar Haddad", initials: "OH" },
  { name: "Nadia Rahman", initials: "NR" },
  { name: "Yousef Khalil", initials: "YK" },
];

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
  scene: MediaScene;
  copy: Profile["copy"];
}): AnalysisOutput[] {
  const { brand, executive, scene, copy } = args;
  const alt = `Campaign creative prepared for ${brand.name}`;

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
        media: { scene, alt, aspect: "16:9" },
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
        copy: { body: copy.instagram.caption },
        media: { scene, alt, aspect: "1:1", overline: copy.instagram.overline },
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
        media: { scene, alt, aspect: "3:2" },
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
      company: { name: brand.name, domain, logo: brand },
      palette: [
        brand.palette.primary,
        brand.palette.secondary,
        brand.palette.accent,
        brand.palette.paper,
      ],
      industry: profile.industry,
      location: profile.location,
      products: profile.products,
      audiences: profile.audiences,
      markets: profile.markets,
      tone: profile.tone,
      opportunities: [profile.opportunity],
      outputs: buildOutputs({
        brand,
        executive: profile.executive,
        scene: profile.scene,
        copy: profile.copy,
      }),
    };
  }

  // Unknown domain — generate a stable fictional company from it.
  const seed = hash(domain);
  const sector = pick(SECTORS, seed);
  const markets = pick(MARKET_SETS, seed, 1);
  const execSeed = pick(EXEC_NAMES, seed, 2);
  const name = companyNameFromDomain(domain) || "Your Company";
  const [homeMarket, nextMarket] = markets;
  const product = sector.products[0];

  const brand: Brand = {
    id: "falak", // structural placeholder; identity below is what renders
    name,
    category: sector.industry,
    shortCategory: sector.industry.split(" ")[0],
    feel: sector.tone.join(", "),
    palette: sector.palette,
    handle: domain.split(".")[0],
    website: domain,
    mark: sector.mark,
  };

  const executive: Executive = {
    name: execSeed.name,
    role: `Chief Executive Officer, ${name}`,
    brandId: "falak",
    initials: execSeed.initials,
  };

  return {
    company: { name, domain, logo: brand },
    palette: [
      sector.palette.primary,
      sector.palette.secondary,
      sector.palette.accent,
      sector.palette.paper,
    ],
    industry: sector.industry,
    location: "Saudi Arabia",
    products: sector.products,
    audiences: sector.audiences,
    markets,
    tone: sector.tone,
    opportunities: [sector.opportunity(name, nextMarket)],
    outputs: buildOutputs({
      brand,
      executive,
      scene: sector.scene,
      copy: {
        company: `From next month, ${product.toLowerCase()} from ${name} covers ${nextMarket} as well as ${homeMarket}. Same team, same commitments, wider coverage.`,
        instagram: {
          overline: `${nextMarket}, from next month`,
          caption: `${product} — now closer to you.`,
        },
        executive: `We said no to ${nextMarket} twice. The third time the numbers worked and the operation was ready to carry it. That is the whole story, and it took longer than anyone wanted.`,
        newsletter: {
          subject: `What changes for you next month`,
          preheader: `${nextMarket} joins your coverage`,
          body: `From next month your account covers ${nextMarket} alongside ${homeMarket}. Nothing changes in how you order — the same terms carry over.`,
          cta: "See what's covered",
        },
      },
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
