/**
 * What Intelligence Setup asks for, and in what order.
 *
 * This is content, not behaviour: the steps, the options inside them and the
 * sentences that keep each screen honest. The draft's shape lives in
 * ./adapters/onboarding, and the screens live in components/concept-v2/purchase.
 *
 * Two rules run through the whole file.
 *
 * 1. Nothing claims a connection. Choosing a channel tells Malaky where to
 *    prepare work; it does not link an account, and the copy says so on the
 *    page rather than only here.
 * 2. Nothing invents a duration. No step promises a turnaround, and the flow
 *    never says how long setup takes, because nobody has decided.
 */

export interface StepDef {
  /** "01" … "08". The rail prints these. */
  num: string;
  id: string;
  title: string;
  /** One line under the title. What this step is for. */
  purpose: string;
}

/**
 * Eight steps. Seven are filled in; the eighth is the walkthrough, which lives
 * on its own route because it is a request rather than a field.
 */
export const STEPS: StepDef[] = [
  {
    num: "01",
    id: "business",
    title: "Your business",
    purpose: "The company Malaky is going to market.",
  },
  {
    num: "02",
    id: "brand",
    title: "Your brand",
    purpose: "What makes work look and sound like you.",
  },
  {
    num: "03",
    id: "voices",
    title: "Executive voices",
    purpose: "The people who publish in their own name.",
  },
  {
    num: "04",
    id: "markets",
    title: "Markets & languages",
    purpose: "Where you operate, and in which language.",
  },
  {
    num: "05",
    id: "channels",
    title: "Channels",
    purpose: "Where your marketing needs to appear.",
  },
  {
    num: "06",
    id: "calendar",
    title: "Your calendar",
    purpose: "What is already coming for your business.",
  },
  {
    num: "07",
    id: "approval",
    title: "Approvals",
    purpose: "Who signs work off, and how much of it.",
  },
  {
    num: "08",
    id: "walkthrough",
    title: "Walkthrough",
    purpose: "Meet the team who will run your setup.",
  },
];

/** The steps that are filled in on /onboarding. Step 08 has its own route. */
export const FORM_STEPS = STEPS.slice(0, 7);

export const WALKTHROUGH_STEP = STEPS[STEPS.length - 1];

/* ------------------------------------------------------------------ *
 * 01 — Business
 * ------------------------------------------------------------------ */

export const INDUSTRIES = [
  "Retail & e-commerce",
  "Food & beverage",
  "Real estate & development",
  "Financial services",
  "Healthcare",
  "Technology & software",
  "Education",
  "Hospitality & travel",
  "Logistics & industrial",
  "Professional services",
  "Government & public sector",
  "Other",
];

/* ------------------------------------------------------------------ *
 * 02 — Brand
 * ------------------------------------------------------------------ */

/**
 * The upload zone is visual. The file is named in a list and never read,
 * uploaded or stored — see ./adapters/upload, and the line the zone prints.
 */
export const UPLOAD_NOTE =
  "Files are listed here only. Nothing is uploaded, read or stored in this preview.";

export const UPLOAD_HINT = "Brand guidelines, tone of voice, product sheets, past campaigns.";

/* ------------------------------------------------------------------ *
 * 03 — Executive voices
 * ------------------------------------------------------------------ */

export const VOICE_TONES = [
  "Direct and factual",
  "Warm and personal",
  "Analytical",
  "Visionary",
  "Understated",
];

export const VOICE_LANGUAGES = ["English", "Arabic", "Both"];

/** Said on the step, so the plan limit reads as scope rather than a wall. */
export const VOICE_LIMIT_NOTE =
  "Additional executive voices can be scoped into your deployment at any time.";

/* ------------------------------------------------------------------ *
 * 04 — Markets & languages
 * ------------------------------------------------------------------ */

export const MARKET_OPTIONS = [
  { id: "SA", label: "Saudi Arabia" },
  { id: "AE", label: "United Arab Emirates" },
  { id: "JO", label: "Jordan" },
  { id: "QA", label: "Qatar" },
  { id: "OM", label: "Oman" },
  { id: "other", label: "Other" },
];

export const LANGUAGE_OPTIONS = ["Arabic", "English"];

export const MARKET_NOTE =
  "Your primary market decides which calendar Malaky plans against first.";

/* ------------------------------------------------------------------ *
 * 05 — Channels
 * ------------------------------------------------------------------ */

/**
 * `state` is the same honesty rule the pricing page uses. "supported" means
 * Malaky prepares work for it; "scoped" means it is available where a
 * deployment includes it. Neither means an account is connected — nothing in
 * this flow connects anything.
 */
export interface ChannelOption {
  id: string;
  label: string;
  detail: string;
  state: "supported" | "scoped";
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    id: "linkedin-company",
    label: "LinkedIn — Company",
    detail: "Company page posts",
    state: "supported",
  },
  {
    id: "linkedin-exec",
    label: "LinkedIn — Executive",
    detail: "Written in a named person's voice",
    state: "supported",
  },
  { id: "instagram", label: "Instagram", detail: "Feed and carousels", state: "supported" },
  { id: "x", label: "X", detail: "Short-form posts and threads", state: "supported" },
  { id: "facebook", label: "Facebook", detail: "Page posts", state: "supported" },
  { id: "tiktok", label: "TikTok", detail: "Short-form video scripts", state: "supported" },
  { id: "youtube", label: "YouTube", detail: "Titles, descriptions, scripts", state: "supported" },
  { id: "email", label: "Email", detail: "Campaigns and newsletters", state: "supported" },
  { id: "website", label: "Website & Blog", detail: "Articles and landing copy", state: "supported" },
  { id: "whatsapp", label: "WhatsApp Business", detail: "Broadcast messaging", state: "scoped" },
  { id: "press", label: "Press & PR", detail: "Statements and announcements", state: "scoped" },
];

/**
 * The most important sentence on the step. Choosing a channel is a planning
 * instruction, not an integration, and this concept connects nothing.
 */
export const CHANNEL_NOTE =
  "Choosing a channel tells Malaky where to prepare work. No account is connected here, and nothing is published.";

export const CHANNEL_SCOPED_NOTE = "Available where your deployment includes it.";

/* ------------------------------------------------------------------ *
 * 06 — Calendar
 * ------------------------------------------------------------------ */

/**
 * The line the whole product argument rests on. It belongs on this step
 * because this is the moment the customer realises they are only being asked
 * for half of it.
 */
export const CALENDAR_LINE_ONE = "Tell Malaky what is happening inside your business.";
export const CALENDAR_LINE_TWO = "Malaky already watches what is happening in your market.";

/** Prompts, not fields. The customer writes in their own words. */
export const CALENDAR_PROMPTS = [
  "Product launches and releases",
  "Openings, events and trade shows",
  "Seasonal peaks and quiet periods",
  "Announcements you already know are coming",
];

/**
 * What Malaky brings without being told — and every one of these is a
 * capability the homepage calendar already demonstrates.
 */
export const CALENDAR_MARKET_SIDE = [
  "National days and public holidays in your markets",
  "Religious observances, on their announced dates",
  "Retail and seasonal moments",
  "Industry moments in your sector",
];

/* ------------------------------------------------------------------ *
 * 07 — Approvals
 * ------------------------------------------------------------------ */

export interface ApprovalModel {
  id: string;
  label: string;
  detail: string;
}

export const APPROVAL_MODELS: ApprovalModel[] = [
  {
    id: "all",
    label: "Approve everything",
    detail: "Nothing leaves Malaky until someone has read it.",
  },
  {
    id: "campaigns",
    label: "Approve campaigns",
    detail: "Campaign work is approved; routine posts follow agreed rules.",
  },
  {
    id: "exec",
    label: "Approve executive work",
    detail: "Anything published in a person's name is approved by them.",
  },
];

/** Approvals are configured here and exercised nowhere. Said on the step. */
export const APPROVAL_NOTE =
  "This sets how approvals will work. Nothing is approved or published from this screen.";

/* ------------------------------------------------------------------ *
 * Completion
 * ------------------------------------------------------------------ */

export const COMPLETE_TITLE = "Your Malaky setup is underway";

export const COMPLETE_NEXT = [
  {
    title: "Intelligence Setup begins",
    body: "Your brand, voices, markets and calendar become the context Malaky operates from.",
  },
  {
    title: "Your walkthrough is confirmed",
    body: "We come back with a time that matches the window you chose.",
  },
  {
    title: "Your first calendar is prepared",
    body: "Malaky plans against what is coming, and you approve before anything runs.",
  },
];

/* ------------------------------------------------------------------ *
 * The line every screen in this flow carries
 * ------------------------------------------------------------------ */

/**
 * One sentence, used verbatim wherever the flow could otherwise be mistaken
 * for the real thing. It is deliberately specific: a vague "demo" label would
 * let a reader assume the parts it does not mention are real.
 */
export const DEMO_NOTICE =
  "Concept preview. Nothing here is charged, stored, connected or booked.";
