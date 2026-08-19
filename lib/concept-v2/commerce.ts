/**
 * The commercial shape of a self-serve Malaky order.
 *
 * Prices are not defined here. They are read from ./pricing, which is the one
 * place a price may live, so the purchase flow can never drift from the
 * pricing page. Business and Scale are purchasable; Enterprise is sales-led
 * and deliberately absent from this module.
 *
 * Nothing here talks to a payment provider, a tax engine or a billing system.
 * It computes what the summary shows, and that is all it does — see
 * ./adapters/payment for the seam where money would actually move.
 */

import { MANAGED, PLANS, formatUsd, type Plan } from "./pricing";

/** The plans a customer can buy without talking to anyone. */
export const PURCHASABLE_PLAN_IDS = ["business", "scale"] as const;
export type PurchasablePlanId = (typeof PURCHASABLE_PLAN_IDS)[number];

export function purchasablePlans(): Plan[] {
  return PLANS.filter((p) =>
    (PURCHASABLE_PLAN_IDS as readonly string[]).includes(p.id),
  );
}

export function getPurchasablePlan(id: string | null | undefined): Plan {
  return purchasablePlans().find((p) => p.id === id) ?? purchasablePlans()[0];
}

/* ------------------------------------------------------------------ *
 * Term
 * ------------------------------------------------------------------ */

export type Term = "monthly" | "annual";

/**
 * The annual discount is the one already published on the pricing page —
 * "Annual prepayment available. Save 10%." No second discount is invented
 * here, and none may be.
 */
export const ANNUAL_DISCOUNT = 0.1;

export const TERMS: { id: Term; label: string; note: string }[] = [
  { id: "monthly", label: "Monthly", note: "Billed each month" },
  { id: "annual", label: "Annual", note: `Prepaid, save ${ANNUAL_DISCOUNT * 100}%` },
];

/* ------------------------------------------------------------------ *
 * The order
 * ------------------------------------------------------------------ */

export interface OrderSelection {
  planId: PurchasablePlanId;
  term: Term;
  managed: boolean;
}

export const DEFAULT_SELECTION: OrderSelection = {
  planId: "business",
  term: "monthly",
  managed: false,
};

export interface OrderLine {
  label: string;
  detail?: string;
  amount: number | null;
  /** Rendered as text rather than a figure — setup during launch, for one. */
  amountLabel?: string;
}

export interface OrderTotals {
  plan: Plan;
  term: Term;
  managed: boolean;
  /** What the subscription costs per month, before any term discount. */
  monthly: number;
  lines: OrderLine[];
  /** Months covered by the payment being taken. */
  months: number;
  subtotal: number;
  /** Whole dollars, so the summary always adds up exactly as printed. */
  discount: number;
  total: number;
  /** "per month" or "per year", for the total's unit. */
  cadence: string;
}

/**
 * Everything the summary needs, computed once.
 *
 * The discount is rounded to whole dollars *before* the total is derived, so
 * the three numbers a customer can see — subtotal, discount, total — always
 * reconcile. A percentage applied at render time would not.
 */
export function priceOrder(selection: OrderSelection): OrderTotals {
  const plan = getPurchasablePlan(selection.planId);
  const planMonthly = plan.monthly ?? 0;
  const managedMonthly = selection.managed ? MANAGED.monthly : 0;
  const monthly = planMonthly + managedMonthly;
  const months = selection.term === "annual" ? 12 : 1;

  const subtotal = monthly * months;
  const discount =
    selection.term === "annual" ? Math.round(subtotal * ANNUAL_DISCOUNT) : 0;

  const lines: OrderLine[] = [
    {
      label: plan.name,
      detail: selection.term === "annual" ? "12 months" : "1 month",
      amount: planMonthly * months,
    },
  ];
  if (selection.managed) {
    lines.push({
      label: MANAGED.name,
      detail: selection.term === "annual" ? "12 months" : "1 month",
      amount: managedMonthly * months,
    });
  }
  lines.push({
    label: plan.setup.label,
    amount: null,
    amountLabel: plan.setup.fee != null ? formatUsd(plan.setup.fee) : plan.setup.includedLabel,
  });

  return {
    plan,
    term: selection.term,
    managed: selection.managed,
    monthly,
    lines,
    months,
    subtotal,
    discount,
    total: subtotal - discount,
    cadence: selection.term === "annual" ? "per year" : "per month",
  };
}

/** "$599 / month" — the way a plan is said in the flow. */
export function monthlyLabel(amount: number): string {
  return `${formatUsd(amount)} / month`;
}

/** How many executive voices this plan covers. Enforced in onboarding. */
export function executiveVoiceLimit(planId: string): number {
  return planId === "scale" ? 3 : 1;
}

export { MANAGED, formatUsd };
export type { Plan };
