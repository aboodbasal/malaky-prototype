/**
 * Pricing data for /concept-v2/pricing.
 *
 * Nothing here is wired to billing. Features are described only as far as the
 * concept can honestly describe them — anything that would depend on a
 * deployment is marked `scoped` and rendered with a qualifier rather than
 * presented as shipped.
 */

export const ANNUAL_DISCOUNT = 0.1;

export interface PlanFeature {
  label: string;
  /** Rendered with an "available with enterprise deployment" qualifier. */
  scoped?: boolean;
}

export interface Plan {
  id: "business" | "scale" | "enterprise";
  name: string;
  tagline: string;
  /** Monthly list price, or null for custom pricing. */
  monthly: number | null;
  /** One-time intelligence setup. */
  setup: string;
  /** Extra price context for the custom tier. */
  priceNote?: string;
  popular?: boolean;
  features: PlanFeature[];
  cta: string;
  footnote?: string;
}

export const PLANS: Plan[] = [
  {
    id: "business",
    name: "Malaky Business",
    tagline: "Your marketing operation, without building the department.",
    monthly: 3500,
    setup: "$7,500 one-time intelligence setup",
    features: [
      { label: "1 brand" },
      { label: "5 users" },
      { label: "80 prepared outputs / month" },
      { label: "1 executive voice" },
      { label: "4 AI videos / month" },
      { label: "All supported channels" },
      { label: "Arabic + English" },
      { label: "Standard approvals" },
      { label: "Core analytics" },
      { label: "Priority support" },
      { label: "Quarterly strategy review" },
    ],
    cta: "Request a demo",
  },
  {
    id: "scale",
    name: "Malaky Scale",
    tagline: "For companies running marketing across more people, channels and campaigns.",
    monthly: 6000,
    setup: "$12,500 one-time intelligence setup",
    popular: true,
    features: [
      { label: "2 brands" },
      { label: "15 users" },
      { label: "200 prepared outputs / month" },
      { label: "Up to 3 executive voices" },
      { label: "12 AI videos / month" },
      { label: "All supported channels" },
      { label: "Arabic + English" },
      { label: "Advanced approvals & workflows" },
      { label: "Advanced analytics & insights" },
      { label: "Dedicated customer success" },
      { label: "Monthly strategy session" },
      { label: "Priority generation" },
      { label: "Early access to selected capabilities" },
    ],
    cta: "Build Malaky for my company",
  },
  {
    id: "enterprise",
    name: "Malaky Enterprise",
    tagline: "A marketing operating layer for complex organizations.",
    monthly: null,
    setup: "Implementation from $25,000",
    priceNote: "Starting at $120,000 / year",
    features: [
      { label: "Custom brands and business units" },
      { label: "Custom users" },
      { label: "Custom content capacity" },
      { label: "Custom executive voices" },
      { label: "Custom AI video capacity" },
      { label: "Arabic + English + additional languages" },
      { label: "Custom integrations", scoped: true },
      { label: "Custom approval and governance", scoped: true },
      { label: "Custom reporting", scoped: true },
      { label: "Security review", scoped: true },
      { label: "Dedicated success team", scoped: true },
    ],
    cta: "Talk to enterprise",
    footnote:
      "Items marked with a qualifier are scoped during deployment. Nothing beyond this list is implied.",
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
  { label: "10 additional AI videos", price: "$1,500", per: "/month" },
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
  { label: "AI video / month", business: "4", scale: "12", enterprise: "Custom" },
  { label: "Approvals", business: "Standard", scale: "Advanced", enterprise: "Custom" },
  { label: "Analytics", business: "Core", scale: "Advanced", enterprise: "Custom" },
  { label: "Strategy sessions", business: "Quarterly", scale: "Monthly", enterprise: "Custom" },
  { label: "Support", business: "Priority", scale: "Dedicated success", enterprise: "Dedicated team" },
  { label: "Integrations", business: "Supported channels", scale: "Supported channels", enterprise: "Scoped in deployment" },
  { label: "Governance", business: "Standard approvals", scale: "Advanced workflows", enterprise: "Scoped in deployment" },
];

export function monthlyPrice(plan: Plan, annual: boolean): number | null {
  if (plan.monthly == null) return null;
  return annual ? Math.round(plan.monthly * (1 - ANNUAL_DISCOUNT)) : plan.monthly;
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}
