/**
 * Pricing data for /concept-v2/pricing.
 *
 * Nothing here is wired to billing. Two deliberate shapes:
 *
 * 1. `capabilities` lead. What Malaky does for the business is the offer;
 *    `limits` are operational ceilings and sit below the fold of the card.
 * 2. Anything that would depend on a deployment lives in `scoped` and is
 *    rendered under an explicit qualifier rather than claimed as shipped.
 */

/** Every engagement is annual; monthly billing is the default rhythm. */
export const ENGAGEMENT_LINE = "12-month engagement · billed monthly";
export const ANNUAL_NOTE = "Annual prepayment saves 10%";

export interface PlanLimit {
  label: string;
  value: string;
}

export interface Plan {
  id: "business" | "scale" | "enterprise";
  name: string;
  tagline: string;
  /** Monthly list price, or null for custom pricing. */
  monthly: number | null;
  /** Extra price context for the custom tier. */
  priceNote?: string;
  /** One-time intelligence setup. */
  setup: string;
  popular?: boolean;
  /** What the business gets. Leads the card. */
  capabilities: string[];
  /** Operational ceilings. Deliberately secondary. */
  limits: PlanLimit[];
  /** Scoped during deployment — never presented as shipped. */
  scoped?: string[];
  cta: string;
  footnote?: string;
}

/** The seven things every deployment includes, in the same order throughout. */
const CORE_CAPABILITIES = [
  "Persistent brand memory",
  "Proactive campaign planning",
  "Arabic + English",
  "Company + executive marketing",
  "Cross-channel adaptation",
  "Human approval",
  "All supported channels",
];

export const PLANS: Plan[] = [
  {
    id: "business",
    name: "Malaky Business",
    tagline: "Your marketing operation, without building the department.",
    monthly: 3500,
    setup: "$7,500 one-time intelligence setup",
    capabilities: [
      ...CORE_CAPABILITIES,
      "Standard approvals",
      "Core analytics",
      "Priority support",
      "Quarterly strategy review",
    ],
    limits: [
      { label: "Brands", value: "1" },
      { label: "Users", value: "5" },
      { label: "Prepared outputs", value: "80 / month" },
      { label: "Executive voices", value: "1" },
      { label: "Short-form video", value: "4 / month" },
    ],
    cta: "Request a private demo",
  },
  {
    id: "scale",
    name: "Malaky Scale",
    tagline: "For companies running marketing across more people, channels and campaigns.",
    monthly: 6000,
    setup: "$12,500 one-time intelligence setup",
    popular: true,
    capabilities: [
      ...CORE_CAPABILITIES,
      "Advanced approvals & workflows",
      "Advanced analytics & insights",
      "Dedicated customer success",
      "Monthly strategy session",
      "Priority generation",
      "Early access to selected capabilities",
    ],
    limits: [
      { label: "Brands", value: "2" },
      { label: "Users", value: "15" },
      { label: "Prepared outputs", value: "200 / month" },
      { label: "Executive voices", value: "Up to 3" },
      { label: "Short-form video", value: "12 / month" },
    ],
    cta: "Request a private demo",
  },
  {
    id: "enterprise",
    name: "Malaky Enterprise",
    tagline: "A marketing operating layer for complex organizations.",
    monthly: null,
    priceNote: "Starting at $120,000 / year",
    setup: "Implementation from $25,000",
    capabilities: [
      ...CORE_CAPABILITIES,
      "Additional languages",
      "Business units and multiple brands",
    ],
    limits: [
      { label: "Brands", value: "Custom" },
      { label: "Users", value: "Custom" },
      { label: "Prepared outputs", value: "Custom" },
      { label: "Executive voices", value: "Custom" },
      { label: "Short-form video", value: "Custom" },
    ],
    scoped: [
      "Custom integrations",
      "Custom approval and governance",
      "Custom reporting",
      "Security review",
      "Dedicated success team",
    ],
    cta: "Talk to Enterprise",
    footnote:
      "Scoped items are agreed during deployment. Nothing beyond this list is implied.",
  },
];

/** The four things Malaky does, shown above the plans. */
export const PILLARS = [
  {
    id: "learns",
    title: "Learns your business",
    body: "Persistent memory of your brand, audience, products and goals.",
  },
  {
    id: "plans",
    title: "Plans proactively",
    body: "Knows what's coming and prepares the work before you ask.",
  },
  {
    id: "creates",
    title: "Creates and adapts",
    body: "On-brand content in Arabic and English, shaped per channel.",
  },
  {
    id: "approved",
    title: "Human approved",
    body: "Every piece goes to a person before it goes anywhere else.",
  },
];

export const ENGAGEMENT_TERMS = [
  "White-glove implementation",
  "Arabic + English",
  "Human approval",
  "12-month engagements",
];

/** What happens before Malaky starts operating. */
export const SETUP_STEPS = [
  "Brand ingestion",
  "Products and services",
  "Audience setup",
  "Content history",
  "English voice",
  "Arabic voice",
  "Executive voice",
  "Marketing calendar",
  "Approval configuration",
  "Initial campaign setup",
];

export const ADD_ONS = [
  { label: "Additional brand workspace", price: "$1,500", per: "/month" },
  { label: "Additional executive voice", price: "$500", per: "/month" },
  { label: "Additional 50 prepared outputs", price: "$750", per: "/month" },
  { label: "10 additional short-form videos", price: "$1,500", per: "/month" },
  { label: "Additional market / country setup", price: "$750", per: "/month" },
  { label: "Additional language", price: "$750", per: "/month" },
  { label: "Dedicated marketing strategist", price: "$2,500", per: "/month" },
  { label: "Weekly strategy session", price: "$1,500", per: "/month" },
  { label: "Custom integration", price: "From $5,000", per: "setup" },
];

export interface ComparisonRow {
  label: string;
  business: string;
  scale: string;
  enterprise: string;
}

export const COMPARISON: ComparisonRow[] = [
  { label: "Brands", business: "1", scale: "2", enterprise: "Custom" },
  { label: "Users", business: "5", scale: "15", enterprise: "Custom" },
  { label: "Prepared outputs / month", business: "80", scale: "200", enterprise: "Custom" },
  { label: "Executive voices", business: "1", scale: "Up to 3", enterprise: "Custom" },
  { label: "Short-form video / month", business: "4", scale: "12", enterprise: "Custom" },
  { label: "Approvals", business: "Standard", scale: "Advanced", enterprise: "Custom" },
  { label: "Analytics", business: "Core", scale: "Advanced", enterprise: "Custom" },
  { label: "Strategy sessions", business: "Quarterly", scale: "Monthly", enterprise: "Custom" },
  { label: "Support", business: "Priority", scale: "Dedicated success", enterprise: "Dedicated team" },
  { label: "Integrations", business: "Supported channels", scale: "Supported channels", enterprise: "Scoped in deployment" },
  { label: "Governance", business: "Standard approvals", scale: "Advanced workflows", enterprise: "Scoped in deployment" },
];

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
