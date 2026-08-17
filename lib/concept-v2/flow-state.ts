/**
 * How the purchase journey carries a selection between routes.
 *
 * Every page in this repository is statically prerendered and there is no
 * session, so the selection travels in the URL: `?plan=scale&term=annual&managed=1`.
 * That has three properties worth keeping even after a backend exists — a
 * checkout link can be sent to a colleague, a refresh does not lose the
 * choice, and QA can open any step of the flow directly.
 *
 * Anything larger than the selection — the billing name, the onboarding draft —
 * is held in component state and, where a later screen needs it, in
 * `sessionStorage` under one key. That is a browser convenience and nothing
 * more: it is per-tab, it is cleared when the tab closes, and no page depends
 * on it being there. Production replaces it with the account the customer has
 * just created; see ./adapters/account.
 */

import {
  DEFAULT_SELECTION,
  PURCHASABLE_PLAN_IDS,
  type OrderSelection,
  type PurchasablePlanId,
  type Term,
} from "./commerce";

/* ------------------------------------------------------------------ *
 * The selection, in the URL
 * ------------------------------------------------------------------ */

/** Anything unrecognised falls back to the default rather than erroring. */
export function readSelection(params: URLSearchParams | null): OrderSelection {
  const planId = params?.get("plan");
  const term = params?.get("term");
  const managed = params?.get("managed");

  return {
    planId: (PURCHASABLE_PLAN_IDS as readonly string[]).includes(planId ?? "")
      ? (planId as PurchasablePlanId)
      : DEFAULT_SELECTION.planId,
    term: term === "annual" || term === "monthly" ? (term as Term) : DEFAULT_SELECTION.term,
    managed: managed === "1" || managed === "true",
  };
}

/** "?plan=scale&term=annual&managed=1" — always all three, so links read plainly. */
export function selectionQuery(selection: OrderSelection): string {
  const params = new URLSearchParams({
    plan: selection.planId,
    term: selection.term,
    managed: selection.managed ? "1" : "0",
  });
  return `?${params.toString()}`;
}

export function withSelection(path: string, selection: OrderSelection): string {
  return `${path}${selectionQuery(selection)}`;
}

/* ------------------------------------------------------------------ *
 * The journey record, in the tab
 * ------------------------------------------------------------------ */

const KEY = "malaky.concept.flow";

/**
 * The few things a later screen wants to show back to the customer. Not a
 * substitute for an account, and never treated as one — every reader handles
 * `null`.
 */
export interface FlowRecord {
  company?: string;
  fullName?: string;
  /** From the payment adapter. A local label, not a receipt. */
  reference?: string;
  /** From the account adapter. A local label, not an account. */
  accountId?: string;
  planId?: string;
  managed?: boolean;
  term?: string;
  /** Set by the walkthrough step so the completion screen can echo it. */
  walkthroughWindow?: string;
}

export function saveFlow(patch: FlowRecord): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...(readFlow() ?? {}), ...patch };
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Private modes and blocked storage are fine — nothing depends on this. */
  }
}

export function readFlow(): FlowRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FlowRecord) : null;
  } catch {
    return null;
  }
}

export function clearFlow(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
