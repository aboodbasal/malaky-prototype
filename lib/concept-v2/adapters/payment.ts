/**
 * PaymentAdapter — the seam where money would move.
 *
 * ## What the UI hands it
 *
 * A `PaymentIntent`: the priced order (plan, term, managed, total in whole
 * USD) and the billing identity typed into the checkout form. Card details are
 * **not** part of it and must never be: the production payment module owns the
 * card fields, and this repository's checkout renders a visual placeholder in
 * their place.
 *
 * ## What the UI expects back
 *
 * `PaymentResult`. On success the flow moves to onboarding; on failure the
 * checkout stays put, keeps every value the customer typed, and shows
 * `message`. Nothing else is read.
 *
 * ## What production must provide
 *
 * - A hosted or embedded payment element from the chosen provider, mounted
 *   where `<PaymentSurface />` renders today, so card data never touches this
 *   application.
 * - Server-side creation of the payment intent from a price the server owns —
 *   never from the amount in this payload, which comes from the browser.
 * - The provider's own 3-D Secure / SCA handling.
 * - An idempotency key so a double submit cannot charge twice.
 * - A webhook that confirms the charge and creates the subscription, because
 *   the browser returning is not proof of payment.
 * - Tax treatment per market, which nothing in this repository models.
 *
 * Nothing here is chosen. No provider is named anywhere in this file, and none
 * may be until one is contracted.
 */

export interface BillingIdentity {
  fullName: string;
  workEmail: string;
  company: string;
  country: string;
}

export interface PaymentIntent {
  planId: string;
  planName: string;
  term: "monthly" | "annual";
  managed: boolean;
  /** Whole USD, as displayed in the order summary. */
  total: number;
  billing: BillingIdentity;
}

export interface PaymentResult {
  ok: boolean;
  /** True in this repository, always. Production sets it false. */
  demoMode: boolean;
  /** Present on success. A local reference for the UI, not a real receipt. */
  reference?: string;
  message?: string;
}

/** Long enough to feel like a real request, short enough not to annoy. */
const MOCK_LATENCY_MS = 1100;

/**
 * A work email at `fail.test` drives the failure path so the declined state
 * can be exercised and screenshotted without a provider. `.test` is reserved
 * by RFC 2606 and can never belong to a real company, which is the same probe
 * the demo request form uses.
 */
const FAILURE_PROBE = "@fail.test";

/**
 * Moves UI state. Takes no money, stores nothing, sends nothing.
 *
 * The reference it returns is generated from the order so the completion
 * screen has something stable to show; it is not a transaction id and the
 * interface never presents it as one.
 */
export async function submitPayment(intent: PaymentIntent): Promise<PaymentResult> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  if (intent.billing.workEmail.trim().toLowerCase().endsWith(FAILURE_PROBE)) {
    return {
      ok: false,
      demoMode: true,
      message:
        "That didn't go through. Nothing has been charged — check the details and try again.",
    };
  }

  const seed = `${intent.planId}-${intent.term}${intent.managed ? "-m" : ""}`;
  return { ok: true, demoMode: true, reference: `DEMO-${seed.toUpperCase()}` };
}
