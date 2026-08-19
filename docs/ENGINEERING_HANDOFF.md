# Malaky — Engineering Handoff

**Branch audited:** `claude/concept-v2-hero-3yj6pj`
**Audit date:** 2026-08-19
**Audience:** engineers taking over product integration.

Everything in this document was read off the current branch. Where something is
proposed rather than present, it is marked **PROPOSED**. Where a decision has
not been made, it is listed as an open question rather than answered.

---

## 1. Executive summary

Malaky is a proactive marketing operating system: it holds a company's brand,
products, markets, voices and calendar, prepares marketing across channels
before anyone asks, and routes the result through human approval.

This repository is the **public website and the customer-facing visual flows**.
It is substantially designed and reviewed. It is a Next.js 16 App Router
application with **no backend of any kind** — no route handlers, no server
actions, no database, no authentication, no external requests. Every route is
statically prerendered.

| Layer | Status | Owner |
| --- | --- | --- |
| Public website, marketing surfaces | Substantially designed | Product/design (frozen — §27) |
| Purchase, checkout, onboarding, scheduling screens | Designed and interactive, mock-backed | Product/design (frozen — §27) |
| Payment, accounts, storage, scheduling, CRM, analytics, email | Not implemented, seams present | **Engineering** |
| Dashboard and authentication | Not in this repository | **Engineering** |

**The task is to connect functionality underneath these surfaces.** Every
integration point already exists as an adapter with a typed input, a typed
output and a written statement of what production must do (§22). Replacing a
mock with a real implementation should require no change to any page — that is
the test each adapter file is written to pass.

> **Do not redesign approved website surfaces unless a technical constraint
> genuinely requires it.** If one does, raise it before changing the surface;
> §27 lists what is frozen and §26 lists the QA suites that will fail if it is
> changed accidentally.

### Stack facts

- Next.js `^16.3.1` (App Router, Turbopack), React `^19.2.8`, TypeScript `^5.7`.
- **Runtime dependencies are exactly `next`, `react`, `react-dom`.** No CSS
  framework, no component library, no state library, no data-fetching library.
- Styling is CSS Modules plus design tokens in `app/globals.css`.
- Fonts via `next/font/google`: DM Sans and IBM Plex Sans Arabic.
- Only dev dependencies beyond types: `playwright` (QA) and `typescript`.

---

## 2. Current routes

Every route below is statically prerendered (`○ (Static)` in `next build`).
None reads a cookie, a header or a database.

### `/` → `/concept-v2`

- **File:** `app/page.tsx`
- **Purpose:** the deployment hostname must land on the site, not on a list of builds.
- **Current state:** server `redirect()`. Nothing else.
- **Integration:** decide at launch whether the site moves out of `/concept-v2`
  to `/`. Moving it rewrites every internal link and every QA selector; it is a
  product decision, not a technical necessity.
- **Data:** none.

### `/concept-v2` — public homepage

- **File:** `app/concept-v2/page.tsx`
- **Sections in order:** `Hero`, `Prompts`, `OneEvent`, `RealBrands`,
  `Approval`, `Memory`, `Arabic`, `BrandDemo`, `ClosingCta`.
- **Current state:** fully static. All content from `lib/concept-v2/content.ts`,
  `customers.ts`, `real-posts.ts`. The hero orbit and several sections animate
  client-side; the brand demo (§10) is interactive and mock-backed.
- **Integration:** only the brand demo (§10). The rest is content.
- **Data in:** none. **Data out:** analytics events (§16), navigation to
  `/get-started`, `/request-demo`, `/pricing`, login (§7).

### `/concept-v2/pricing`

- **File:** `app/concept-v2/pricing/page.tsx` → `components/concept-v2/pricing/PricingPage.tsx`
- **Current state:** renders entirely from `lib/concept-v2/pricing.ts` (§4).
  Plan CTAs link into the purchase flow with the selection already in the query
  string (§5).
- **Integration:** none directly. Pricing must become server-authoritative for
  payment (§4, §6).
- **Data out:** `/concept-v2/get-started?plan=business|scale`, and
  `/concept-v2/request-demo` for Enterprise.

### `/concept-v2/get-started`

- **File:** `app/concept-v2/get-started/page.tsx` → `components/concept-v2/purchase/GetStarted.tsx`
- **Purpose:** plan, billing term and the optional Managed layer.
- **Current state:** client component reading the selection from the query
  string via `readSelection()`. Totals computed by `priceOrder()`. Emits
  `get_started_view`, `plan_selected`, `term_selected`, `managed_toggled`.
- **Integration:** none on this screen; the price it shows must be
  re-derived server-side at payment time.
- **Data in:** `?plan`, `?term`, `?managed`. **Data out:** the same three
  parameters forwarded to `/checkout`.

### `/concept-v2/checkout`

- **File:** `app/concept-v2/checkout/page.tsx` → `components/concept-v2/purchase/Checkout.tsx`
- **Purpose:** billing identity, payment method choice, order confirmation.
- **Current state:** collects `BillingIdentity` (`fullName`, `workEmail`,
  `company`, `country`) with client-side validation. Renders
  `PaymentSurface` — **inert shapes, not inputs**: they are not focusable and
  accept no keystrokes, so no card detail can be entered, held in state, logged
  or transmitted. On submit it calls `submitPayment()` then `createAccount()`
  (§22), writes a `FlowRecord` to `sessionStorage`, and routes to onboarding.
- **Integration:** **payment (§6) and account creation (§7).** This is the
  highest-risk screen in the repository.
- **Data in:** `?plan`, `?term`, `?managed`. **Data out:** `PaymentIntent`,
  `AccountRequest`, and a `FlowRecord` in `sessionStorage`.

### `/concept-v2/onboarding`

- **File:** `app/concept-v2/onboarding/page.tsx` → `components/concept-v2/purchase/Onboarding.tsx`
- **Purpose:** Intelligence Setup, steps 01–07 (§8).
- **Current state:** the whole draft lives in one piece of component state and
  is handed to `saveOnboarding()` **once, at the end**. There is deliberately no
  per-step save. Executive voice count is capped by plan. Emits
  `onboarding_view`, `onboarding_step_completed`, `onboarding_submitted`.
- **Integration:** **persistence (§8)**, server-side validation, file upload (§9).
- **Data in:** `?plan` (drives the voice limit). **Data out:** `OnboardingDraft`.

### `/concept-v2/onboarding/schedule`

- **File:** `app/concept-v2/onboarding/schedule/page.tsx` → `components/concept-v2/purchase/Schedule.tsx`
- **Purpose:** walkthrough preferences (step 08).
- **Current state:** collects timezone, preferred windows, horizon, attendees,
  notes. **No availability is shown and no slot is held** — see §11 for why
  this is a deliberate design position, not a missing feature.
- **Integration:** **scheduling (§11).**
- **Data out:** `WalkthroughRequest`; the chosen window is echoed into the
  `FlowRecord`.

### `/concept-v2/onboarding/complete`

- **File:** `app/concept-v2/onboarding/complete/page.tsx` → `components/concept-v2/purchase/Complete.tsx`
- **Purpose:** what Malaky has been given and what happens next.
- **Current state:** reads the `FlowRecord` from `sessionStorage` and echoes it.
  Handles `null` — the page renders correctly if storage is empty or blocked.
  Its primary button currently returns to `/concept-v2`.
- **Integration:** **this button becomes the dashboard hand-off (§13).**
- **Data in:** `FlowRecord`, `?plan`.

### `/concept-v2/request-demo`

- **File:** `app/concept-v2/request-demo/page.tsx` → `components/concept-v2/requestdemo/RequestDemo.tsx`
- **Purpose:** the Enterprise / sales-led route.
- **Current state:** validated form; `submitDemoRequest()` resolves locally
  after ~900 ms and transmits nothing (§12).
- **Integration:** **lead capture (§12).**

### `/concept-v2/login`

- **File:** `app/concept-v2/login/page.tsx`
- **Purpose:** the entry point for existing customers.
- **Current state:** **no form at all** — no email field, no password field, no
  provider buttons, no reset, no session, no storage. Logo, "Welcome back.",
  supporting line, an inert `Continue to Malaky` (`aria-disabled`, not a link
  or a control), and the note "Dashboard sign-in will be connected by the
  product team."
- **Integration:** set `NEXT_PUBLIC_DASHBOARD_URL` and this page stops being
  reachable — header and footer point straight at the dashboard (§7, §13, §21).

### `/concept-v2/privacy`, `/concept-v2/terms`

- **Files:** `app/concept-v2/privacy/page.tsx`, `app/concept-v2/terms/page.tsx`
- **Current state:** website documents only, rendered from `lib/concept-v2/legal.ts`,
  where every real-world value is `null` and prints a visible
  `[To be confirmed: …]` placeholder (§19).
- **Integration:** supply the legal values; these are **not** the customer SaaS
  agreement.

---

## 3. Purchase flow

### Business / Scale (self-serve)

```
/pricing
  → /get-started        plan · term · optional Malaky Managed
  → /checkout           billing identity · payment
      submitPayment()   ── MOCK ──▶ real payment provider          [§6]
      createAccount()   ── MOCK ──▶ real account/tenant creation   [§7]
  → /onboarding         steps 01–07
      saveOnboarding()  ── MOCK ──▶ real persistence               [§8]
  → /onboarding/schedule
      requestWalkthrough() ── MOCK ──▶ real booking                [§11]
  → /onboarding/complete
      → dashboard                                                 [§13]
```

### Enterprise (sales-led)

```
/pricing → /request-demo → submitDemoRequest() ── MOCK ──▶ CRM / notification [§12]
```

**Today the visual journey is complete end to end and can be walked by anyone.**
No money moves, no account exists, no answer is stored, no file leaves the
browser, and no meeting is booked. Every screen states this where a visitor can
read it (§23) rather than only in code comments.

Ordering constraint worth deciding early: `createAccount()` is currently called
from the browser immediately after `submitPayment()` resolves. In production the
account should be created by the **confirmed payment webhook**, not by the
browser returning — otherwise an account can exist without a payment or the
reverse. This is stated in `adapters/account.ts` and it changes the shape of
the checkout's success path.

---

## 4. Pricing source of truth

**Files:** `lib/concept-v2/pricing.ts` (the prices) and
`lib/concept-v2/commerce.ts` (the arithmetic). `commerce.ts` imports from
`pricing.ts` and defines no price of its own, so the purchase flow cannot drift
from the pricing page.

| Item | Value | Constant |
| --- | --- | --- |
| Malaky Business | $599 / month | `PLANS[0].monthly` |
| Malaky Scale | $899 / month | `PLANS[1].monthly` |
| Malaky Enterprise | Custom (`monthly: null`, `priceNote: "Custom"`) | `PLANS[2]` |
| Malaky Managed | +$299 / month | `MANAGED.monthly` |
| Business executive voices | 1 | `executiveVoiceLimit("business")` |
| Scale executive voices | up to 3 | `executiveVoiceLimit("scale")` |
| Intelligence Setup | `fee: null` → "Included during launch" | `Plan.setup` |

`setup.fee` is `null` rather than `0` deliberately: "included" and "$0" are
different commercial claims, and `purchase-qa` asserts the distinction.

### Annual billing, exactly as implemented

`ANNUAL_DISCOUNT = 0.1` in `commerce.ts`, matching the published
"Annual prepayment available. Save 10%." In `priceOrder()`:

```
monthly  = plan.monthly + (managed ? 299 : 0)
months   = term === "annual" ? 12 : 1
subtotal = monthly * months
discount = term === "annual" ? Math.round(subtotal * 0.1) : 0
total    = subtotal - discount
```

The discount is **rounded to whole dollars before the total is derived**, so the
three figures a customer can see always reconcile exactly as printed. A
percentage applied at render time would not. `purchase-qa` asserts
`subtotal − discount === total` and `Number.isInteger(discount)` across all
eight plan/term/managed combinations.

> **Production rule:** the server must recompute the amount from the plan
> identifier and term it owns. **Never charge the `total` in the payload** —
> it arrives from the browser and can be edited. `PaymentIntent.total` exists so
> the UI and the adapter agree on what was displayed, not as an instruction to
> the payment provider.

---

## 5. URL state

**File:** `lib/concept-v2/flow-state.ts`

Three parameters carry the selection between routes:

| Param | Accepted values | Fallback |
| --- | --- | --- |
| `plan` | `business`, `scale` | `business` |
| `term` | `monthly`, `annual` | `monthly` |
| `managed` | `1` or `true` → on; anything else → off | off |

Example: `/concept-v2/checkout?plan=scale&term=annual&managed=1`

- **Read by:** `GetStarted`, `Checkout`, `Onboarding`, `Complete`, via
  `readSelection(useSearchParams())`.
- **Written by:** `selectionQuery()` / `withSelection()`, always emitting all
  three keys so links read plainly.
- **Validation today:** `readSelection()` is total — anything unrecognised falls
  back to the default and never throws. Enterprise is not a purchasable id and
  cannot be selected through the URL.
- **Direct links and refresh:** every step is directly linkable and survives a
  refresh, by design. This is worth keeping after a backend exists: a checkout
  link can be sent to a colleague and QA can open any step.
- **Production:** validate again server-side at payment time. Treat these
  parameters as a **display preference**, never as the price.

Anything larger than the selection travels in `sessionStorage` under one key,
`malaky.concept.flow` (`FlowRecord`: company, full name, reference, accountId,
plan, managed, term, walkthrough window). It is per-tab, cleared when the tab
closes, and **every reader handles `null`**. Production replaces it with the
account the customer has just created.

---

## 6. Payment integration

**Seam:** `lib/concept-v2/adapters/payment.ts`
**Visual surface:** `components/concept-v2/purchase/PaymentSurface.tsx`

### Current behaviour

`submitPayment(intent)` waits 1100 ms and returns. It takes no money, stores
nothing and sends nothing. A work email ending `@fail.test` drives the decline
path so the failure state can be exercised (`.test` is reserved by RFC 2606 and
can never belong to a real company).

`PaymentSurface` renders inert shapes labelled "Card number", "Expiry",
"Security code", "Name on card". They are **not inputs** — not focusable, no
keystrokes accepted — so no card detail can enter this application's state,
logs or network. An invoice variant renders explanatory text only.

### Interface

```ts
interface BillingIdentity { fullName: string; workEmail: string; company: string; country: string }

interface PaymentIntent {
  planId: string; planName: string;
  term: "monthly" | "annual";
  managed: boolean;
  total: number;            // whole USD, as displayed — NOT authoritative
  billing: BillingIdentity;
}

interface PaymentResult {
  ok: boolean;
  demoMode: boolean;        // true here, always; production sets false
  reference?: string;       // local label, not a receipt
  message?: string;         // shown verbatim on the decline path
}
```

**Card details are not part of the interface and must never be.** The production
payment module owns those fields.

### UI states to preserve

| State | Behaviour today |
| --- | --- |
| Idle | Order summary and billing form |
| Submitting | Pending state on the action; form stays populated |
| Declined / error | Checkout **stays put, keeps every value the customer typed**, and renders `message` |
| Success | `checkout_success` emitted, `FlowRecord` written, route to `/onboarding` |

### Production requirements

- Hosted or embedded payment element from the chosen provider, mounted where
  `PaymentSurface` renders `.ghostFields`, so card data never touches this app.
- **Server-side amount calculation** from a price the server owns (§4).
- The provider's own 3-D Secure / SCA handling.
- Idempotency key so a double submit cannot charge twice.
- Webhook confirmation — the browser returning is not proof of payment.
- Recurring subscription creation, status, failed-payment handling,
  cancellation and plan change.
- Receipts and invoices.
- Tax/VAT treatment per market. **Nothing in this repository models tax.**
- PCI scope: no card data through the Malaky front end or backend unless the
  architecture is deliberately built to carry that obligation.

**No provider is named anywhere in this repository, and none may be added until
one is contracted.**

---

## 7. Account and authentication

**Seam:** `lib/concept-v2/adapters/account.ts`
**Login entry:** `Header.tsx` (desktop bar and mobile panel), `Footer.tsx`
("Client login" in the Company group), destination from `lib/site.ts`.

### Current behaviour

```ts
interface AccountRequest { planId: string; managed: boolean; billing: BillingIdentity }
interface AccountResult  { ok: boolean; demoMode: boolean; accountId?: string; message?: string }
```

`createAccount()` waits 300 ms and returns `accountId: "demo-<company-slug>"`.
Nothing is created. The onboarding pages read `accountId` only to label the
session; **nothing branches on it**.

### Login destination

`lib/site.ts` exports:

- `DASHBOARD_URL` — `NEXT_PUBLIC_DASHBOARD_URL` trimmed, or `null`.
- `LOGIN_HREF` — the dashboard URL when configured, otherwise `/concept-v2/login`.
- `LOGIN_IS_PLACEHOLDER` — `true` while the concept page is the destination.

Verified on this branch: with the variable set, header and footer both render
the configured absolute URL and the concept login page is unreachable from
navigation.

### Must be built

- Account creation triggered by the **confirmed payment webhook**, not the browser.
- Workspace/tenant record the deployment hangs off.
- Sign-in method — password, OAuth, SSO — **not chosen here**.
- Session management, logout, email verification if required, password recovery
  if relevant.
- Organisation membership, invitations if more than one person per company will
  have access, roles and permissions.
- Dashboard routing and post-login landing.

**No authentication vendor is named anywhere in this repository.**

---

## 8. Onboarding data

**Steps:** `lib/concept-v2/onboarding-steps.ts` (`STEPS`, `FORM_STEPS = STEPS.slice(0,7)`)
**Draft type:** `lib/concept-v2/adapters/onboarding.ts` (`OnboardingDraft`)
**Screen:** `components/concept-v2/purchase/Onboarding.tsx`

Validation today is deliberately light — only what makes the next step
answerable. The four blocking rules, from `problem()`:

1. `business.company` non-empty
2. `markets.primary` chosen
3. at least one language
4. at least one channel

Everything else is optional. **All of it must be validated again server-side.**

| # | Step | Fields (`OnboardingDraft` path) | Required | Notes |
| --- | --- | --- | --- | --- |
| 01 | Your business | `business.company`, `.website`, `.industry`, `.description` | company only | `INDUSTRIES` is a fixed list |
| 02 | Your brand | `brand.colours`, `.products`, `.audience`, `.personality`, `.never`, `.documents[]` | none | `documents` holds **file names only** (§9) |
| 03 | Executive voices | `voices[]`: `name`, `title`, `linkedin`, `language`, `tone`, `topics`, `avoid`, `samples` | none | **Count capped by plan:** 1 (Business) / 3 (Scale) via `executiveVoiceLimit()` |
| 04 | Markets & languages | `markets.primary`, `markets.also[]`, `languages[]` | primary + ≥1 language | `MARKET_OPTIONS` = SA, AE, JO, QA, OM, other; `LANGUAGE_OPTIONS` = Arabic, English |
| 05 | Channels | `channels[]` | ≥1 | 11 options in `CHANNEL_OPTIONS`, each `state: "supported" \| "scoped"` |
| 06 | Your calendar | `calendar.dates`, `.notes` | none | Free text; company events, not public occasions |
| 07 | Approvals | `approvals.model`, `.approver` | none | `APPROVAL_MODELS`: `all`, `campaigns`, `exec` |
| 08 | Walkthrough | separate route — see §11 | — | `WalkthroughRequest`, not part of `OnboardingDraft` |

### Persistence

`saveOnboarding(draft)` waits 500 ms, discards the draft and returns
`{ ok: true, demoMode: true }`.

Production must provide storage, server-trusted validation, and a handoff into
Intelligence Setup for the team who configure the deployment.

> **Product decision required, not just engineering:** whether steps save as the
> customer goes. If they do, the pages need a resume path — which is a **design
> change** to a frozen surface, not only an implementation detail. Raise it
> before building it.

Conceptual entities the UI actually implies — **do not extend the schema beyond
what the screens need**: `Organisation` (business + brand + markets +
languages), `ExecutiveVoice` (many per organisation, capped by plan),
`ChannelSelection`, `CalendarNote`, `ApprovalPolicy`, `BrandDocument` (§9).

---

## 9. File uploads

**Seam:** `lib/concept-v2/adapters/upload.ts`
**Surface:** the upload zone in onboarding step 02 (Your brand).

```ts
interface UploadResult { ok: boolean; demoMode: boolean; name: string; size: number; message?: string }
```

`stageDocument(file)` reads nothing and transmits nothing — it records the
choice so the zone can list it. **The file never leaves the browser.** The
screen says so on the page: *"Files are listed here only. Nothing is uploaded,
read or stored in this preview."* (`UPLOAD_NOTE`).

What the zone invites (`UPLOAD_HINT`): brand guidelines, tone of voice, product
sheets, past campaigns. In practice this covers logo, brand guidelines, company
profile, product/service documents and executive writing samples — all as
generic documents; there is no per-type upload surface.

### Production requirements

- Object storage, and a decision about **where it lives** — this matters in
  these markets and is not made here (§18).
- Direct-to-storage upload so documents do not pass through the app server.
- Type and size limits enforced server-side. The zone's `accept` attribute is a
  convenience, not a control.
- Malware scanning before anything is handed to the team.
- Per-tenant isolation, signed/private URLs, no public bucket paths.
- Deletion, with a customer-visible way to ask for it, and a retention policy
  the privacy policy will have to describe.

**No storage vendor is named.**

---

## 10. Website / brand analysis

**Surface:** `components/concept-v2/branddemo/` — `BrandDemo`, `DomainForm`,
`AnalysisSequence`, `IntelligenceSummary`, `OutputStage`.
**Seam:** `lib/concept-v2/analysis.ts` — `analyzeBrand(domain)` /
`analyzeBrandAsync(domain)`.

### Today

Pure, synchronous mock. Nothing is fetched, no request leaves the page, no
website is read. It returns a `BrandAnalysis`, and **every presentation
component consumes only that shape** — no component reads the customer table
directly or hardcodes a company.

The honesty rule is enforced in the data, not in the components, so a
presentation layer cannot accidentally state an example as a fact:

- `mode: "authored"` — a demo company written by hand. May read as findings.
- `mode: "illustrative"` — any other domain including a visitor's own. **Nothing
  was read, so nothing may be presented as discovered**: no country, market,
  product, segment, executive identity or business event is asserted. Labels
  travel with the data (`"Illustrative opportunity"` rather than
  `"Opportunity detected"`).

Two visible disclosures: the concept-preview banner in `BrandDemo.tsx`
(*"Malaky is not reading this website yet"*) and *"Preview only — nothing is
published or connected."*

### Production goal

Visitor enters a website → backend retrieves and analyses permitted public
content → brand and business context is derived → result returns in the same
`BrandAnalysis` shape → real setup can begin from that context.

Return `mode: "authored"` only for values genuinely read from a source. The
result is deliberately plain serialisable data, so a future saved-analysis
route could rehydrate one; sharing is not built.

> Once real analysis is connected and results are genuinely `authored`, the
> large concept-preview disclosure should be removed — see §23, which lists it
> as a flag that must disappear with its integration.

**Do not invent crawler or AI architecture.** Robots/ToS compliance, rate
limits, caching and model choice are all open (§29).

---

## 11. Scheduling

**Seam:** `lib/concept-v2/adapters/scheduling.ts`
**Screen:** `components/concept-v2/purchase/Schedule.tsx`

### Today

```ts
interface WalkthroughRequest { timezone: string; windows: string[]; horizon: string; attendees: string; notes: string }
```

Fixed option sets in the same file: `TIMEZONES` (Riyadh, Dubai/Muscat, Amman,
Doha, other), `WINDOWS` (morning, midday, afternoon, evening — described as
ranges, not times), `HORIZONS` (next few days, next week, later this month).
`requestWalkthrough()` waits 700 ms and returns. **Nothing is booked, no
invitation is sent, no time is held.**

**Why no slot grid:** a grid of bookable times would be the obvious design and
would be a lie — there is no calendar, no availability and no way to hold a
time. Asking for preferences is honest at every size and needs no disclaimer.
The completion screen says the time *will be confirmed*, not that a meeting
exists.

### Production

- Real availability from the team's calendars, in the customer's timezone.
- Timezone-safe handling across GMT+3/+4 and DST-free zones.
- Booking that holds the slot, with the double-booking race resolved
  **server-side** rather than by whoever clicked first.
- Calendar invitations to customer and attendees; video link if remote.
- Reminders, reschedule and cancel — **each is a screen this concept does not
  have**.
- A decision on whether the customer picks a slot or the team proposes one. If
  it becomes slot-picking, **this step is redesigned** — the preference form is
  not a slot picker with the slots missing.

**No scheduling provider is named.**

---

## 12. Request a private demo

**Seam:** `lib/concept-v2/demo-request.ts` — `submitDemoRequest()`
**Screen:** `components/concept-v2/requestdemo/RequestDemo.tsx`

### Fields

| Field | Required | Validation today |
| --- | --- | --- |
| `name` | yes | non-empty |
| `email` | yes | permissive regex; personal-mailbox hosts **nudge, never block** (`isFreeEmailHost`) |
| `company` | yes | non-empty |
| `website` | yes | `normalizeWebsite()` reduces `https://www.Example.com/about?x=1` → `example.com`; rejects non-hosts |
| `role` | yes | non-empty |
| `market` | yes | non-empty |
| `interests[]` | no | 7 `INTEREST_OPTIONS` |
| `notes` | no | free text |

`validateDemoRequest()` is **pure and imports nothing**, so the same validator
can run server-side — do that rather than writing a second one.

### Current behaviour

Resolves locally after 900 ms; nothing is transmitted, stored or emailed. A
website normalising to `fail.test` drives the failure path. Emits
`demo_request_view`, `_started`, `_interest_selected`, `_submitted`,
`_success`, `_error`.

### Production must define

Form API and transport; server-side validation reusing the pure validators;
lead storage; CRM destination; internal notification; attribution/source
capture; error handling that preserves the typed values; spam and rate
limiting; privacy handling and consent record.

The file suggests a POST to a route handler under
`app/concept-v2/request-demo/` as a realistic first implementation. **That route
does not exist yet** — it is a suggestion in a comment, not code.

**No CRM and no email provider is named.**

---

## 13. Dashboard handoff

The public site needs the following from the dashboard team.

| Need | Current state | Where it plugs in |
| --- | --- | --- |
| Login destination | `NEXT_PUBLIC_DASHBOARD_URL` → `LOGIN_HREF` | `Header.tsx`, `Footer.tsx` |
| Post-purchase redirect | Currently routes to `/onboarding` in-site | `Checkout.tsx` success path |
| Onboarding-complete redirect | Currently a button back to `/concept-v2` | `Complete.tsx` |
| Account / workspace identifier | `AccountResult.accountId` — a local label only | `adapters/account.ts` |
| Organisation / customer context | Not modelled | new |
| Subscription / plan state | Not modelled; the site only knows the selection | new |
| Onboarding status | Not modelled; no resume path exists | new |

`NEXT_PUBLIC_DASHBOARD_URL` **exists on this branch** (§7, §21). Anything else
above is a recommended seam, not a hard-coded URL — and no hostname may be
invented for any of it.

---

## 14. Marketing operating data

What the site demonstrates visually versus what has to exist in the product.

| Concept | Demonstrated in front end | Actual functionality to build |
| --- | --- | --- |
| Business memory | `Memory` section; `MEMORY_EXAMPLE` in `content.ts` — a correction becoming a rule, labelled *Illustrative* | Persistent per-tenant brand/business memory; rule extraction from edits |
| Brand voice | Onboarding step 02; brand demo output | Voice model per organisation |
| Executive voices | Onboarding step 03 (plan-capped); hero executive card; One Event executive card | Per-person voice, ownership, and the consent/approval model for publishing in someone's name |
| Market intelligence | `Prompts`, brand demo opportunities | Real signal ingestion |
| Country-specific calendar | `operating-calendar.ts` + `calendar.ts`, five markets, each occasion carrying a verified official date and source | Real calendar service, per country and year, with the same verification rule (§27) |
| Company calendar / events | `company` entries in the operating calendar, dated freely and labelled illustrative | Customer-supplied events (onboarding step 06) |
| Channel outputs | `OneEvent` fan-out; `posts/` components for Instagram, LinkedIn company, LinkedIn executive, X, newsletter, reel | Generation per channel |
| Arabic-native content | `Arabic` section; RTL composition, IBM Plex Sans Arabic | Native Arabic generation — **not a translation layer** |
| Approvals | `Approval` section, interactive | Approval workflow, roles, audit |
| Edits / declines / preference learning | `Approval` + `Memory` interactions | Feedback loop into memory |
| Scheduled / published states | Depicted in card chrome and the calendar | Real scheduling and publishing, per channel |

**Nothing in the front end performs any of the right-hand column.** All state is
local component state; there is no persistence anywhere.

---

## 15. Real customer content

**Files:** `lib/concept-v2/customers.ts` (facts), `lib/concept-v2/real-posts.ts`
(published screenshots), `lib/concept-v2/campaign-creative.ts` (compositions
built on customer artwork).
**Assets:** `public/brand/customers/`, `public/brand/real-posts/`.

Six real customers: `ataccama`, `baker-tilly-sa`, `inception-dap`,
`shrimp-joint`, `ila`, `alpha-pro`.

### The honesty model — three separate layers

1. **Real customer fact.** Every entry in `Customer.facts` is a `VerifiedFact`
   carrying a `source`. `website`, `handle`, `logo` and executive `portrait` are
   **nullable**, and null means "not confirmed", not "fill this in". Every
   handle in the repository is currently `null`; nothing may invent one.
2. **Real published work.** `real-posts.ts` holds five screenshots of work the
   customers actually published. `RealPostCard` **never draws chrome around
   them** — they already contain their own — and never crops or stretches them
   (`realpost-qa` asserts the rendered ratio equals the file's own).
3. **Malaky-prepared illustrative output.** Everything else, explicitly
   labelled: `PREPARED_LABEL` (`"Prepared by Malaky"`), `FANOUT_NOTE`, the
   Arabic section's closing line, the Memory section's *Illustrative* note.

> **Engineering must not accidentally remove these distinctions.** They are
> enforced by `customer-qa` and `realpost-qa`, which check that logos are
> unmodified and correctly proportioned, that no retired fictional identity
> reappears, that published work is separated from adapted work in the visible
> copy, and that every fan-out image resolves to a file under the customer's own
> asset directory.

> **Engagement figures on drawn cards are illustration, not analytics.** They
> are stated as such in the interface (`ENGAGEMENT_NOTE`: *"Interface figures
> are part of the illustration, not performance."*). **Do not wire them to real
> analytics and do not present them as performance data.** If real metrics
> arrive, that is a new design decision, not a substitution.

---

## 16. Analytics

**Seam:** `lib/concept-v2/analytics.ts` — `track(name, payload?)`.

**Current behaviour:** no vendor attached. Events are buffered in memory
(capped at 100) and mirrored to `window.__malakyEvents`, which is what the QA
scripts read. Nothing leaves the page. The single replacement point is marked
in the file: *"Replace this block with the provider call when one is chosen."*

Events currently emitted (the `ConceptEvent` union — this is the complete list):

| Group | Events |
| --- | --- |
| Brand demo | `brand_demo_started`, `brand_demo_analysis_completed`, `brand_demo_channel_viewed`, `brand_demo_approved`, `brand_demo_reset` |
| Demo request | `demo_request_view`, `_started`, `_interest_selected`, `_submitted`, `_success`, `_error` |
| Purchase | `get_started_view`, `plan_selected`, `term_selected`, `managed_toggled`, `checkout_view`, `checkout_submitted`, `checkout_error`, `checkout_success` |
| Onboarding | `onboarding_view`, `onboarding_step_completed`, `onboarding_submitted`, `walkthrough_view`, `walkthrough_requested`, `onboarding_complete_view` |

**Not currently emitted, and requested in the brief:** page views (there is no
route-change listener), generic CTA clicks, and login. Add them at the same
seam; do not scatter provider calls through components.

**No analytics vendor is named.** Consent/cookie behaviour is undecided and
interacts with the privacy policy (§19).

---

## 17. Email and notifications

Places that will eventually need a transactional message. **None exists today** —
this repository sends no email of any kind.

| Trigger | Recipient | Source of the event |
| --- | --- | --- |
| Purchase confirmation / receipt | Customer | Payment webhook (§6) |
| Payment failure / dunning | Customer | Payment webhook |
| Onboarding continuation / resume | Customer | Onboarding persistence (§8) — depends on the resume decision |
| Walkthrough booking, reminder, reschedule, cancellation | Customer + attendees | Scheduling (§11) |
| Demo request acknowledgement | Prospect | Demo submission (§12) |
| Internal sales notification | Sales | Demo submission |
| Account invitation | Colleague | Account/org membership (§7) |
| Password / auth events | Customer | Only if a password method is chosen (§7) |

**No email provider is named.**

---

## 18. Security and data questions engineering must answer

**ENGINEERING / SECURITY FACTS REQUIRED**

The website's legal documents, the customer agreement and any future security
page all depend on these. **None is answered in this repository, and none may be
filled with an assumption.**

- [ ] Hosting provider
- [ ] Deployment regions
- [ ] Database and storage (product and residency)
- [ ] AI providers and models
- [ ] Whether prompts/data are retained by those providers
- [ ] Whether customer data is used for training
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Authentication method
- [ ] Roles and permissions model
- [ ] Audit logs
- [ ] Tenant isolation
- [ ] Backups
- [ ] Disaster recovery
- [ ] Customer data deletion and export
- [ ] Internal employee access controls
- [ ] Subprocessor list
- [ ] Monitoring
- [ ] Incident response
- [ ] Data residency commitments
- [ ] Saudi Arabia requirements (PDPL and any sector rules)
- [ ] UAE requirements
- [ ] SSO support
- [ ] APIs and third-party integrations

`legal-qa` currently asserts the **absence** of security and compliance claims
on the public pages. Adding one before it is true will fail that suite, which is
the intended behaviour.

---

## 19. Legal

**Routes:** `/concept-v2/privacy`, `/concept-v2/terms`.
**Config:** `lib/concept-v2/legal.ts`.

The current documents cover **the public website only** — a privacy policy for
the site and terms of use for visiting it. They are **not** the customer SaaS
agreement, a DPA, a security policy or an SLA, and nothing in `legal.ts` should
grow into one; those follow the product.

Every value is `null` and renders a conspicuous `[To be confirmed: …]`
placeholder:

| Field | Needed for |
| --- | --- |
| `entity` | Registered company name, exactly as incorporated |
| `address` | Registered address on the privacy notice |
| `privacyEmail` | Mailbox for privacy requests — **not a sales address** |
| `legalEmail` | General legal/website enquiries |
| `jurisdiction` | Governing law and forum, agreed with counsel — **never inferred from where the company operates** |
| `effectiveDate` | ISO `YYYY-MM-DD`, set on publication day |

`isProductionReady()` in the same file reports what is still missing. Filling
these values in is the whole change — the pages need no edit.

Before final SaaS terms, DPA, security documentation, subprocessor list and any
SLA can be written, §18 must be answered.

---

## 20. SEO and production config

**File:** `lib/site.ts`.

| Item | Current |
| --- | --- |
| `SITE_URL` | `NEXT_PUBLIC_SITE_URL` trimmed, falling back to `http://localhost:3000` so `metadataBase` always resolves |
| `HOME_TITLE` | `"Malaky — Your marketing was working before you were"` |
| `HOME_DESCRIPTION` | One canonical sentence, shared by head, Open Graph and the X card |
| `OG_IMAGE` | `/og/malaky-social.png`, 1200×630, generated by `scripts/social-card.mjs` |
| `pageMetadata()` | Helper that returns the full object so a page overriding metadata cannot silently drop the card |
| Root redirect | `app/page.tsx` → `/concept-v2` |

**Deliberately absent:** `alternates.canonical`, robots directives and a
sitemap. Declaring a canonical URL is a production SEO decision that cannot be
made honestly before the hostname exists.

Production must supply: the real hostname in `NEXT_PUBLIC_SITE_URL`, the
canonical URL decision, a robots policy, a sitemap, and an explicit indexing
decision. **No deployment host is hard-coded anywhere and none may be** —
`metadata-qa` asserts the absence of a hard-coded host and that no indexing
decision has been made.

---

## 21. Environment variables

### Current — present and used on this branch

| Variable | Used by | Behaviour when unset |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `lib/site.ts` → `metadataBase`, OG/X absolute URLs | Falls back to `http://localhost:3000`; no page emits a broken or invented absolute address |
| `NEXT_PUBLIC_DASHBOARD_URL` | `lib/site.ts` → `LOGIN_HREF`, header, footer | Login points at `/concept-v2/login`, the holding page (§7) |

These are the **only** two `process.env` reads in the entire application.

### PROPOSED — NAME MAY CHANGE

Not present on this branch. Names are placeholders for discussion.

| Proposed | Purpose | Public? |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base for demo submission, onboarding save, analysis | public |
| `NEXT_PUBLIC_PAYMENT_PUBLIC_KEY` | Publishable key for the chosen payment provider's client element | public |
| `NEXT_PUBLIC_ANALYTICS_ID` | Analytics property identifier | public |
| `PAYMENT_SECRET_KEY` | Server-side payment calls | **server only** |
| `PAYMENT_WEBHOOK_SECRET` | Webhook signature verification | **server only** |
| `DATABASE_URL` | Persistence | **server only** |
| `STORAGE_*` | Object storage credentials | **server only** |
| `CRM_*`, `EMAIL_*` | Lead routing and transactional mail | **server only** |

> **`NEXT_PUBLIC_` variables are inlined into the client bundle at build time
> and are readable by anyone.** Never put a secret, an API secret key, a
> webhook secret or a database URL behind that prefix.

---

## 22. Front-end adapter inventory

**Directory:** `lib/concept-v2/adapters/` — six files, all present and audited.

| File | Responsibility | Input | Output | Today | Production |
| --- | --- | --- | --- | --- | --- |
| `index.ts` | Barrel + shared `AdapterResult` | — | — | Re-exports the five below plus `submitDemoRequest` | Keep as the single import surface |
| `payment.ts` | Money | `PaymentIntent` | `PaymentResult` | 1100 ms, returns `DEMO-<plan>` reference; `@fail.test` declines | §6 |
| `account.ts` | Account / tenant | `AccountRequest` | `AccountResult` | 300 ms, returns `demo-<company>` | §7 |
| `onboarding.ts` | Setup answers | `OnboardingDraft` | `OnboardingResult` | 500 ms, discards the draft | §8 |
| `upload.ts` | Brand documents | `{ name, size }` | `UploadResult` | 200 ms, records the choice; also exports `formatBytes()` | §9 |
| `scheduling.ts` | Walkthrough | `WalkthroughRequest` | `SchedulingResult` | 700 ms, books nothing; also exports `TIMEZONES`, `WINDOWS`, `HORIZONS`, `EMPTY_WALKTHROUGH`, `WALKTHROUGH_COVERS` | §11 |

**Two integration seams live outside this directory** and are worth knowing about:

| File | Responsibility | Today |
| --- | --- | --- |
| `lib/concept-v2/demo-request.ts` | `submitDemoRequest()` — predates the directory, re-exported from `index.ts` | §12 |
| `lib/concept-v2/analysis.ts` | `analyzeBrand()` / `analyzeBrandAsync()` — website analysis | §10 |

Every adapter returns `demoMode: true`. **A production implementation sets it
`false`**, which is the hook §23 depends on.

---

## 23. Demo mode and honesty flags

Every place the application currently tells a visitor that nothing real happened.
These exist because the flows are complete and walkable — a visitor who reaches
a success screen must not believe money moved.

| Where | String / mechanism | Disappears when |
| --- | --- | --- |
| All six adapters | `demoMode: true` in the result | The adapter is real (§22) |
| `onboarding-steps.ts` `DEMO_NOTICE` | "Concept preview. Nothing here is charged, stored, connected or booked." | Payment + account + onboarding persistence + scheduling are all connected |
| `onboarding-steps.ts` `UPLOAD_NOTE` | "Files are listed here only. Nothing is uploaded, read or stored in this preview." | Upload is connected (§9) |
| `onboarding-steps.ts` `CHANNEL_NOTE` | "No account is connected here, and nothing is published." | Channel integrations exist (§14) — likely last |
| `onboarding-steps.ts` `APPROVAL_NOTE` | "Nothing is approved or published from this screen." | Approvals backend exists |
| `PaymentSurface.tsx` | "Placeholder" tag; invoice note "nothing is sent" | Payment element is mounted (§6) |
| `payment.ts` decline copy | "Nothing has been charged" | Real decline messages come from the provider |
| `BrandDemo.tsx` | "**Concept preview** — Malaky is not reading this website yet." | Real analysis returns `mode: "authored"` (§10) |
| `BrandDemo.tsx` | "Preview only — nothing is published or connected." | Analysis + publishing connected |
| `analysis.ts` | `AnalysisMode` + `"Illustrative opportunity"` labels | Values are genuinely read; the type stays as the guard |
| `content.ts` `ENGAGEMENT_NOTE` | "Prepared by Malaky. Interface figures are part of the illustration, not performance." | **Never, unless real metrics replace them** — see §15 |
| `content.ts` `PREPARED_LABEL` | "Prepared by Malaky" | Never for illustrative output (§15) |
| `content.ts` `FANOUT_NOTE` | Separates published work from adaptations | Never (§15) |
| `login/page.tsx` | "Dashboard sign-in will be connected by the product team." | `NEXT_PUBLIC_DASHBOARD_URL` set — **already automatic** via `LOGIN_IS_PLACEHOLDER` |

**Two different kinds of flag are mixed in that table, and conflating them would
be a mistake:** the `demoMode` group disappears when its integration lands; the
`PREPARED_LABEL` / `ENGAGEMENT_NOTE` / `FANOUT_NOTE` group is a permanent
honesty distinction about customer content (§15) and must survive every
integration.

### Recommendation on centralising

The login page **already** derives its note from configuration
(`LOGIN_IS_PLACEHOLDER`), which is the pattern to copy. A modest, low-risk
improvement: derive each remaining notice from the `demoMode` its own adapter
returns, or from a small `integrations.ts` module exporting one boolean per
integration, and have the copy read that flag.

This can be done **without redesigning any screen** — the strings already live
in data files, not inline in components. `demo-honesty-qa` and `customer-qa`
will hold the honesty rules while it is done. Do not attempt a wider refactor
than this.

---

## 24. Error, loading and success states

These already exist and are visually designed. **Preserve them when replacing
the mocks — do not fall back to browser alerts or unstyled errors.** Every mock
has a deliberate latency (200–1100 ms) so the pending states are real and
already exercised.

| State | Where | Behaviour to keep |
| --- | --- | --- |
| Loading / pending | Checkout, onboarding submit, schedule, demo request, brand demo | In-place pending state on the action; the form stays visible and populated |
| Validation error | Demo request, checkout, onboarding | Inline message next to the field, `p[role=alert]`; focus moves to the first problem; the form is never cleared |
| Payment decline | Checkout | Stays on the page, **keeps every typed value**, shows `PaymentResult.message` |
| Network failure | All adapters | Currently unreachable — mocks never reject. **Add a rejection path and route it into the existing error UI**, not into an uncaught promise |
| Successful payment | Checkout | `checkout_success`, `FlowRecord` written, route to onboarding |
| Onboarding save | Onboarding | Saving state, then route to the walkthrough |
| Upload failure | Brand step | `UploadResult.ok === false` with `message` — the shape exists; the UI path is untested because the mock never fails |
| Schedule unavailable | Walkthrough | No such state today — preferences cannot be unavailable. **Real availability introduces a new state and a design question** (§11) |
| Demo request failure | Demo form | `{ ok: false, message }` rendered in place, typed values preserved |
| Success confirmation | Complete | Reads `FlowRecord`; **handles `null` correctly** — keep that |

Two gaps worth naming: **no adapter can currently reject**, so no component has
a catch path; and **there is no timeout handling anywhere**. Both need adding
with the real integrations.

---

## 25. Responsive and accessibility requirements

**Targets:** 1440, 1024, 768, 390. Verified: no horizontal overflow at 1440,
1280, 1100, 900, 768 or 390.

- **Spacing** — `--section-y: clamp(3.5rem, 6vw, 6.5rem)` and
  `--section-y-dense: clamp(2.5rem, 4vw, 4.25rem)` in `app/globals.css` are
  **frozen** and enforced by `spacing-qa`, which measures rendered padding on
  every section and lists the sanctioned exceptions explicitly.
- **No horizontal overflow** at any target width. `purchase-qa` asserts 0px
  overflow at 390 across the whole purchase journey.
- **Form labels** — every input has an associated label; errors are wired via
  `aria-describedby` and announced as `p[role=alert]`.
- **Keyboard** — the brand demo channel tabs implement full arrow/Home/End
  roving-tabindex behaviour, asserted by `pass2-qa`. The mobile nav uses
  `aria-expanded` / `aria-controls`. The demo form moves focus to the first
  invalid field, asserted by `pass7-qa`.
- **Reduced motion** — 9 `prefers-reduced-motion` blocks across the stylesheets;
  the hero orbit becomes static. `pass7-qa` runs a reduced-motion pass.
- **Contrast** — the palette is fixed in `app/globals.css`
  (`--c-text: #f3ede6` on `--c-bg: #080d11`). Muted tiers (`--c-text-2`,
  `--c-text-3`) are used for supporting copy only.
- **Images** — every customer logo carries intrinsic `width`/`height` and is
  rendered `object-fit: contain`; `realpost-qa` asserts nothing is stretched.

**Integrations must not break any of these.** A third-party embed (payment
element, scheduler widget, chat) is the most likely thing to introduce
horizontal overflow or an unlabelled input — check at 390 before merging.

---

## 26. QA suite

Playwright drives a local Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Scripts that import
TypeScript run through a loader shim (`scripts/ts-resolve.mjs` +
`scripts/ts-hooks.mjs`).

**All suites require the site running at `http://localhost:3000`:**

```bash
npm run build && npm start        # in one terminal
```

Then, per suite:

```bash
node --experimental-strip-types --import ./scripts/ts-resolve.mjs scripts/<name>.mjs
```

| Suite | Protects |
| --- | --- |
| `purchase-qa` | The purchase and onboarding journey: every figure reconciles with the pricing page and with itself; no screen claims money moved, an account exists, a file was stored or a meeting was booked; no infrastructure vendor is named; header hierarchy; 390px overflow |
| `spacing-qa` | The frozen spacing rhythm, measured on rendered sections, with sanctioned exceptions listed |
| `calendar-qa` | Every real occasion carries its verified date for the right country; no country's occasion appears in another's calendar |
| `legal-qa` | The negative checks: no invented entity, jurisdiction or address; no compliance or security claim; no statement about where customer data lives |
| `demo-honesty-qa` | For a domain Malaky has not read, the brand demo asserts nothing factual about that company |
| `customer-qa` | The real-customer conversion: sourced facts only; no invented handle, logo or face; no retired fictional identity; published work separated from adapted work; logo legibility; the exact supplied Arabic strings |
| `realpost-qa` | Real screenshots are never stretched and never nested inside drawn platform chrome |
| `metadata-qa` | Root redirect; one canonical title/description across head, OG and X card; one shared card; no indexing decision made |
| `pass2-qa` | Brand demo: inline validation, distinct per-channel copy, keyboard tab behaviour, approve/reset state |
| `pass7-qa` | Demo request form: required-field reporting, focus management, email/website validation, interest selection, analytics event sequence, reduced motion |
| `interactions` | Orbit motion and hover response, approval sequence, calendar, pricing invariants; fails on any page error |

Every suite exits non-zero on failure and prints `PASS`/`FAIL` per assertion.

**Build and typecheck:**

```bash
npx tsc --noEmit      # typecheck
npm run build         # production build; every route must stay ○ (Static)
npm run lint          # next lint
npm run dev           # local development
```

**Not test suites** (utilities in the same directory): `*-shots.mjs` screenshot
scripts, `social-card.mjs` (generates the OG card), `crop-*.mjs` (customer
artwork crops), `webp.mjs` / `webp-verify.mjs`, `frames.mjs`, `lines.mjs`,
`net.mjs`, `sec.mjs`, `deliver.mjs`, `orbit-bounds.mjs`, `section-shot.mjs`,
`audit-shots.mjs`.

---

## 27. DESIGN / PRODUCT SURFACES CURRENTLY FROZEN

> **Connect functionality underneath these surfaces. Do not redesign them.**
> If a technical constraint genuinely requires a change, raise it with product
> before implementing — several of these are enforced by QA and a change will
> fail the build pipeline.

- **Malaky logo** — the official artwork. Not recoloured, redrawn or re-lettered.
- **Typography** — DM Sans (Latin) and IBM Plex Sans Arabic, via `next/font/google`.
- **Colour hierarchy** — `--c-gold: #e3c084` is brand identity only;
  `--c-accent: #ff4e2d` is the single signal for action. **One filled orange
  action per surface.**
- **Hero composition** — orbit ring, card slots (phase, width, offset, roll,
  scale per card), glow, activity timeline, hero height.
- **Spacing system** — `--section-y` / `--section-y-dense`, enforced by `spacing-qa`.
- **Homepage section order** — Hero, Prompts, One Event, Real Brands, Approval,
  Memory, Arabic, Brand Demo, Closing CTA.
- **Calendar UI** — the multi-market operating calendar, its per-market month
  anchoring, and **the verified-date rule** (`calendar-qa`).
- **One Event structure** — four channels: Instagram, LinkedIn Company,
  Executive LinkedIn, Arabic LinkedIn, plus the disclosure line.
- **Real Brands structure** — and the published/adapted distinction (§15).
- **Approval interaction** — the review-to-scheduled sequence.
- **Memory interaction** — correction becoming a rule.
- **Arabic section structure** — EN/AR panels composed independently, RTL.
- **Pricing** — page structure, plan cards, the platform-stated-once rule, and
  the Business / Scale / Enterprise plan structure.
- **Purchase flow** — route order, step rail, order summary.
- **Onboarding flow** — eight steps, their order, and the channel card design.
- **Honesty language** — every string in §23. Removing one before its
  integration lands is a correctness bug, not a copy edit.

---

## 28. Engineering workstream checklist

### P0 — required to make the site commercially functional

- [ ] Choose a payment provider; mount its element in place of `PaymentSurface`
- [ ] Server-authoritative pricing; never charge a browser-supplied total
- [ ] Payment webhook, idempotency, subscription creation
- [ ] Account/tenant creation **from the webhook**, not the browser
- [ ] Authentication method and session management
- [ ] Subscription state readable by the dashboard
- [ ] Onboarding persistence + server-side validation (reuse the pure validators)
- [ ] Real demo-request submission, lead storage and internal notification
- [ ] `NEXT_PUBLIC_DASHBOARD_URL` pointed at the real dashboard; wire the
      post-purchase and onboarding-complete redirects
- [ ] Rejection and timeout paths in every adapter, routed into the existing
      error UI (§24)

### P1 — required for complete onboarding

- [ ] File upload: storage, direct upload, server-side limits, scanning, deletion
- [ ] Scheduling: availability, booking, invitations, reschedule/cancel
      (**and the slot-picking design decision** — §11)
- [ ] Website analysis behind `analyzeBrandAsync`, returning `mode: "authored"`
- [ ] Transactional email for the triggers in §17
- [ ] Analytics provider at the `track()` seam; add page views, CTA clicks, login

### P2 — product operationalisation

- [ ] Channel integrations and publishing
- [ ] Approvals backend, roles and audit
- [ ] Business memory and preference learning
- [ ] Real market and company calendars, keeping the verified-date rule
- [ ] Executive voices, including the consent model for publishing in a
      named person's name
- [ ] Arabic-native generation workflows

### P3 — production launch

- [ ] Production hostname in `NEXT_PUBLIC_SITE_URL`
- [ ] Canonical URL, robots policy, sitemap, indexing decision
- [ ] Legal values in `legal.ts`; SaaS terms, DPA, subprocessors, SLA
- [ ] Security facts (§18) answered and documented
- [ ] Monitoring, alerting, incident response
- [ ] Final performance and accessibility audit at 1440 / 1024 / 768 / 390
- [ ] Decide whether the site moves from `/concept-v2` to `/`

---

## 29. Open questions

**Do not answer these in code before they are decided.**

| # | Question | Blocks |
| --- | --- | --- |
| 1 | Which payment provider? | §6, P0 |
| 2 | Authentication method — password, OAuth, SSO? | §7, P0 |
| 3 | Dashboard hostname? | §13, P0 |
| 4 | Is the account created on payment webhook, or at checkout? | §3, §7 |
| 5 | Which CRM receives demo leads? | §12 |
| 6 | Scheduling provider — and does the customer pick a slot or does the team propose one? | §11 |
| 7 | Analytics platform, and consent/cookie handling? | §16, §19 |
| 8 | File storage product and region? | §9, §18 |
| 9 | AI provider and model architecture; is data retained or used for training? | §10, §14, §18 |
| 10 | Deployment regions and data residency, specifically for Saudi and UAE? | §18 |
| 11 | Data retention periods? | §9, §18, §19 |
| 12 | Customer deletion and export mechanism? | §18, §19 |
| 13 | How are social channels connected — official APIs, per-channel apps, or manual? | §14, P2 |
| 14 | Subscription cancellation and plan-change policy? | §6, and the public pricing copy |
| 15 | VAT/tax handling per market? | §6 |
| 16 | Does onboarding save per step (needs a resume path — a design change)? | §8 |
| 17 | Does the site move from `/concept-v2` to `/` at launch? | §2, P3 |
| 18 | Contractual term for Business/Scale — deliberately absent from the public cards today | §4 |
| 19 | Operating ceilings — the previous per-month output numbers were set against retired pricing and were removed rather than replaced | `CAPACITY_NOTE` in `pricing.ts` |

---

## Appendix — findings from this audit

Two things noticed while auditing the branch. Neither is fixed here; both are
reported for a decision.

1. **Orphaned asset.** `public/brand/customers/alpha-pro-mena/inception-dap/Logo-DAP-1.png`
   is an Inception DAP logo nested inside the Alpha Pro directory. Nothing
   references it — `customers.ts` points Inception at
   `/brand/customers/inception-dap/inception-dap.png`. It appears to be a
   misplaced upload.

2. **Split asset directories for one customer.** Alpha Pro's logo lives in
   `public/brand/customers/alpha-pro-mena/` while its campaign crops live in
   `public/brand/customers/alpha-pro/`. Every other customer uses one
   directory. Both paths are referenced correctly and nothing is broken; the
   inconsistency is cosmetic, but it will confuse the next person adding an
   asset.

Also worth flagging for planning rather than as a defect: **no adapter can
currently fail with a rejection**, only with `ok: false`. Components therefore
have no `catch` path and no timeout handling. Add both alongside the real
integrations (§24).
