/**
 * Pricing data for /concept-v2/pricing.
 *
 * Nothing here is wired to billing.
 *
 * The page is built on one rule: the platform is stated once, and the plans
 * describe how much of a marketing organisation each one covers. What used to
 * be here — the same seven capabilities printed inside all three cards, an
 * eleven-row table repeating the cards, and a monthly output count large
 * enough to divide into the price — invited the buyer to work out a cost per
 * post. At $42K–$120K a year that is the wrong unit entirely, so plans now
 * differ by brands, voices, markets, approval depth, planning scope, operating
 * cadence, support and implementation. Capacity still exists for commercial
 * protection; it sits in a disclosure below the cards, never in the pitch.
 *
 * Second rule: nothing is presented as shipped unless this concept actually
 * exercises it. Capability entries carry an explicit state, and anything that
 * depends on a deployment lives under "available where scoped" rather than
 * being implied.
 */

/** Every engagement is annual; monthly billing is the default rhythm. */
export const ENGAGEMENT_LINE = "12-month engagement";

/** Stated once on the page, near the plans. Never inside a card. */
export const ANNUAL_NOTE = "Annual prepayment available. Save 10%.";

export const PRICE_FROM_LINE = "Private deployments start at $3,500 / month.";

/* ------------------------------------------------------------------ *
 * The platform — stated once, above the plans
 * ------------------------------------------------------------------ */

/**
 * `state` is the same honesty rule the homepage uses. "included" means this
 * concept exercises the behaviour somewhere you can go and try. "planned"
 * means it is described and still to be built, and it is labelled as such
 * rather than quietly listed beside the rest.
 */
export interface PlatformCapability {
  title: string;
  body: string;
  state: "included" | "planned";
}

export const PLATFORM: PlatformCapability[] = [
  {
    title: "Persistent brand memory",
    body: "Your brand, products, audience and voice are held between campaigns rather than re-explained.",
    state: "included",
  },
  {
    title: "Proactive campaign planning",
    body: "Malaky works from your calendar and prepares the work before anyone asks for it.",
    state: "included",
  },
  {
    title: "Company + executive marketing",
    body: "The company's voice and your executives' own voices, written separately.",
    state: "included",
  },
  {
    title: "Arabic + English",
    body: "Each language composed natively. Not a translation layer, and not an add-on.",
    state: "included",
  },
  {
    title: "Cross-channel adaptation",
    body: "One business moment becomes work written for each channel, not one post reformatted.",
    state: "included",
  },
  {
    title: "Human approval",
    body: "Nothing publishes until the required approval is given.",
    state: "included",
  },
  {
    title: "Business and calendar context",
    body: "Malaky operates from the facts and dates your team has approved.",
    state: "included",
  },
  {
    title: "Continuous learning",
    body: "Every edit, approval and decline becomes a rule the next draft already follows.",
    state: "included",
  },
];

/**
 * Named here rather than omitted. Both were previously implied by plan
 * features — "advanced approvals & workflows", "governance" — which read as
 * shipped. They are not.
 */
export const PLATFORM_PLANNED: PlatformCapability[] = [
  {
    title: "Roles & workflows",
    body: "Different people prepare, review and approve, with permissions per role.",
    state: "planned",
  },
  {
    title: "Source visibility",
    body: "Where a factual claim came from, shown before approval.",
    state: "planned",
  },
];

/* ------------------------------------------------------------------ *
 * Plans
 * ------------------------------------------------------------------ */

/** One row of a plan's coverage. This is the offer — how much of the operation. */
export interface CoverageRow {
  label: string;
  value: string;
}

export interface Plan {
  id: "business" | "scale" | "enterprise";
  name: string;
  tagline: string;
  /** Monthly list price, or null for a scoped deployment. */
  monthly: number | null;
  /** Price context for the scoped tier. */
  priceNote?: string;
  setupLabel: string;
  setupValue: string;
  term?: string;
  /** What the deployment covers. Differs meaningfully between plans. */
  coverage: CoverageRow[];
  /**
   * Capacity, in a sentence rather than a number. Exact ceilings live in
   * CAPACITY_DETAIL, below the cards.
   */
  capacity: string;
  footnote?: string;
}

export const PLANS: Plan[] = [
  {
    id: "business",
    name: "Malaky Business",
    tagline: "For one business that wants Malaky running its day-to-day marketing operation.",
    monthly: 3500,
    setupLabel: "One-time intelligence setup",
    setupValue: "$7,500",
    term: ENGAGEMENT_LINE,
    coverage: [
      { label: "Brands", value: "1 primary brand" },
      { label: "Executive voices", value: "Up to 2" },
      { label: "Markets", value: "One primary operating market" },
      { label: "Channels", value: "Core supported channels" },
      { label: "Approvals", value: "Standard approval workflow" },
      { label: "Campaign planning", value: "Proactive calendar for one brand" },
      { label: "Operating review", value: "Monthly" },
      { label: "Support", value: "Standard" },
    ],
    capacity: "Built for an active single-brand marketing calendar.",
  },
  {
    id: "scale",
    name: "Malaky Scale",
    tagline: "For growing marketing teams operating across more people, markets and campaigns.",
    monthly: 6000,
    setupLabel: "One-time intelligence setup",
    setupValue: "$12,500",
    term: ENGAGEMENT_LINE,
    coverage: [
      { label: "Brands", value: "Up to 2 brands or business units" },
      { label: "Executive voices", value: "Up to 5" },
      { label: "Markets", value: "Multi-market campaign planning" },
      { label: "Channels", value: "Broader supported coverage" },
      { label: "Approvals", value: "Multi-step approval paths" },
      { label: "Campaign planning", value: "Several concurrent initiatives" },
      { label: "Operating review", value: "Monthly strategy session" },
      { label: "Support", value: "Priority" },
    ],
    capacity: "Expanded capacity for multi-market and multi-team operations.",
  },
  {
    id: "enterprise",
    name: "Malaky Enterprise",
    tagline: "For enterprise marketing organisations that require a tailored deployment.",
    monthly: null,
    priceNote: "Starting from $120,000 / year",
    setupLabel: "Implementation",
    setupValue: "Starting from $25,000",
    term: "Custom scope",
    coverage: [
      { label: "Brands", value: "Multiple brands and business units" },
      { label: "Executive voices", value: "Extended voice library" },
      { label: "Markets", value: "Regional and multi-market operating context" },
      { label: "Channels", value: "Defined in deployment" },
      { label: "Approvals", value: "Tailored approval architecture" },
      { label: "Campaign planning", value: "Defined in deployment" },
      { label: "Operating review", value: "Dedicated operating cadence" },
      { label: "Support", value: "Defined in your proposal" },
    ],
    capacity: "Capacity defined around deployment scope.",
    footnote:
      "Integrations, governance, reporting and security review are scoped in your proposal — see Additional scope below.",
  },
];

/**
 * The commercial ceilings, kept for protection and moved out of the pitch.
 * Shown inside a closed disclosure under the plan grid.
 */
export const CAPACITY_DETAIL: { label: string; business: string; scale: string; enterprise: string }[] = [
  { label: "Prepared outputs", business: "80 / month", scale: "200 / month", enterprise: "Scoped" },
  { label: "Short-form video", business: "4 / month", scale: "12 / month", enterprise: "Scoped" },
  { label: "Team members", business: "5", scale: "15", enterprise: "Scoped" },
];

export const CAPACITY_NOTE =
  "Operating ceilings, not the offer. They exist so a deployment stays within what the team behind it can run well, and they are reviewed with you at each operating review.";

/* ------------------------------------------------------------------ *
 * Intelligence setup
 * ------------------------------------------------------------------ */

/** What happens before Malaky starts operating. No duration is promised. */
export const SETUP_STEPS = [
  "Brand ingestion",
  "Products & services",
  "Audience and market context",
  "Company voice",
  "Arabic voice",
  "Executive voices",
  "Approved business facts",
  "Campaign calendar",
  "Approval workflow",
  "Initial operating rules",
];

export const SETUP_CLOSE =
  "Malaky starts with your company's context instead of a blank prompt.";

/* ------------------------------------------------------------------ *
 * What changes between plans
 *
 * Only the differences. Anything included in every deployment belongs in
 * PLATFORM and is deliberately absent here — the table answers "why Scale
 * instead of Business", not "does this plan have AI".
 * ------------------------------------------------------------------ */

export interface ComparisonRow {
  label: string;
  business: string;
  scale: string;
  enterprise: string;
}

export const COMPARISON: ComparisonRow[] = [
  {
    label: "Brands / business units",
    business: "1",
    scale: "Up to 2",
    enterprise: "Multiple",
  },
  {
    label: "Executive voices",
    business: "Up to 2",
    scale: "Up to 5",
    enterprise: "Extended library",
  },
  {
    label: "Market coverage",
    business: "One primary market",
    scale: "Multi-market",
    enterprise: "Regional / multi-market",
  },
  {
    label: "Approval complexity",
    business: "Standard workflow",
    scale: "Multi-step paths",
    enterprise: "Tailored architecture",
  },
  {
    label: "Campaign planning scope",
    business: "One brand calendar",
    scale: "Several concurrent initiatives",
    enterprise: "Defined in deployment",
  },
  {
    label: "Operating review cadence",
    business: "Monthly",
    scale: "Monthly strategy session",
    enterprise: "Dedicated cadence",
  },
  {
    label: "Support level",
    business: "Standard",
    scale: "Priority",
    enterprise: "Defined in proposal",
  },
  {
    label: "Implementation scope",
    business: "Intelligence setup",
    scale: "Intelligence setup",
    enterprise: "Custom implementation",
  },
];

/* ------------------------------------------------------------------ *
 * Additional scope
 *
 * Replaces a nine-item monthly add-on menu. At this price point additions are
 * a conversation, not a shopping list.
 * ------------------------------------------------------------------ */

export const ADDITIONAL_SCOPE =
  "Additional brands, markets, executive voices, channels, integrations and specialised creative requirements can be scoped into your deployment.";

/**
 * Named so a buyer knows what is available to ask for, and grouped under
 * "where scoped" so none of it reads as shipped. Nothing here is claimed as a
 * feature of any plan.
 */
export const SCOPED_ITEMS = [
  "Custom integrations",
  "Governance and approval architecture",
  "Custom reporting",
  "Security review",
  "Dedicated success team",
  "Enterprise onboarding",
];

export const SCOPED_NOTE =
  "Scoped items are agreed during deployment. Nothing beyond the agreed scope is implied.";

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
