"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAccount, submitPayment, type BillingIdentity } from "@/lib/concept-v2/adapters";
import { priceOrder } from "@/lib/concept-v2/commerce";
import { readSelection, saveFlow, withSelection } from "@/lib/concept-v2/flow-state";
import { track } from "@/lib/concept-v2/analytics";
import { Button } from "../ui";
import { FlowHead } from "./FlowChrome";
import { OrderSummary } from "./OrderSummary";
import { PaymentSurface } from "./PaymentSurface";
import flow from "./flow.module.css";
import styles from "./checkout.module.css";

type Phase = "form" | "paying";
type Method = "card" | "invoice";
type BillingField = keyof BillingIdentity;
type Errors = Partial<Record<BillingField, string>>;

const EMPTY: BillingIdentity = { fullName: "", workEmail: "", company: "", country: "" };

/** The launch markets, plus the two neighbours that ask most often. */
const COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Jordan",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "Other",
];

/** Permissive on purpose — this catches a typo, it does not police an address. */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function validate(values: BillingIdentity): Errors {
  const errors: Errors = {};
  if (!values.fullName.trim()) errors.fullName = "Who is this deployment for?";

  const email = values.workEmail.trim();
  if (!email) errors.workEmail = "We need an address for your account.";
  else if (!EMAIL_RE.test(email)) errors.workEmail = "That doesn't look like an email address.";

  if (!values.company.trim()) errors.company = "Which company is Malaky marketing?";
  if (!values.country.trim()) errors.country = "Where is the business based?";
  return errors;
}

const WHAT_HAPPENS = [
  "Your Malaky account is created.",
  "Intelligence Setup collects your brand, voices, markets and calendar.",
  "You choose when the walkthrough with our team should happen.",
];

/**
 * Step two: details, payment surface, and the button that starts a deployment.
 *
 * The important thing about this screen is what it does not do. It collects an
 * identity and hands it to two adapters — one for payment, one for the
 * account — and neither of them does anything: no money moves, no account is
 * created, nothing is stored. The interface says so where a customer will read
 * it, not only in the code, and the button's success state says a setup has
 * *begun*, never that a payment succeeded.
 */
export function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const selection = readSelection(params);
  const order = priceOrder(selection);

  const [values, setValues] = useState<BillingIdentity>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [method, setMethod] = useState<Method>("card");
  const [phase, setPhase] = useState<Phase>("form");
  const [failure, setFailure] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const uid = useId();

  useEffect(() => {
    track("checkout_view", { plan: selection.planId, term: selection.term });
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (name: BillingField, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (name in e ? { ...e, [name]: undefined } : e));
    setFailure(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "paying") return;

    const found = validate(values);
    setErrors(found);
    const firstBad = (Object.keys(found) as BillingField[])[0];
    if (firstBad) {
      document.getElementById(`${uid}-${firstBad}`)?.focus();
      return;
    }

    setPhase("paying");
    setFailure(null);
    track("checkout_submitted", {
      plan: selection.planId,
      term: selection.term,
      managed: selection.managed,
      method,
    });

    const payment = await submitPayment({
      planId: selection.planId,
      planName: order.plan.name,
      term: selection.term,
      managed: selection.managed,
      total: order.total,
      billing: values,
    });

    if (!payment.ok) {
      setPhase("form");
      setFailure(payment.message ?? "That didn't go through. Nothing has been charged.");
      track("checkout_error");
      window.requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }

    const account = await createAccount({
      planId: selection.planId,
      managed: selection.managed,
      billing: values,
    });

    saveFlow({
      company: values.company.trim(),
      fullName: values.fullName.trim(),
      reference: payment.reference,
      accountId: account.accountId,
      planId: selection.planId,
      term: selection.term,
      managed: selection.managed,
    });

    track("checkout_success", { plan: selection.planId });
    router.push(withSelection("/concept-v2/onboarding", selection));
  };

  const paying = phase === "paying";

  return (
    <>
      <FlowHead
        eyebrow="Checkout"
        title="Start your Malaky deployment"
        lead="Your details, then Intelligence Setup. Malaky begins learning your business straight after this step."
      />

      <section className={flow.body} aria-labelledby="checkout-title">
        <div className={`shell ${flow.grid}`}>
          <form className={`${flow.main} ${styles.form}`} onSubmit={onSubmit} noValidate>
            <h2 className="visually-hidden" id="checkout-title">
              Your details and payment
            </h2>

            {/* --- 01 details --- */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <p className={styles.sectionTitle}>
                  <span className={styles.sectionNum}>01</span> Your details
                </p>
              </div>

              <div className={flow.fields}>
                <p className={flow.field} data-invalid={errors.fullName ? true : undefined}>
                  <label className={flow.label} htmlFor={`${uid}-fullName`}>
                    Full name
                  </label>
                  <input
                    id={`${uid}-fullName`}
                    className={flow.input}
                    autoComplete="name"
                    value={values.fullName}
                    disabled={paying}
                    aria-invalid={errors.fullName ? true : undefined}
                    aria-describedby={errors.fullName ? `${uid}-fullName-error` : undefined}
                    onChange={(e) => setField("fullName", e.target.value)}
                  />
                  {errors.fullName && (
                    <span className={flow.fieldError} id={`${uid}-fullName-error`}>
                      {errors.fullName}
                    </span>
                  )}
                </p>

                <p className={flow.field} data-invalid={errors.workEmail ? true : undefined}>
                  <label className={flow.label} htmlFor={`${uid}-workEmail`}>
                    Work email
                  </label>
                  <input
                    id={`${uid}-workEmail`}
                    className={flow.input}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={values.workEmail}
                    disabled={paying}
                    aria-invalid={errors.workEmail ? true : undefined}
                    aria-describedby={errors.workEmail ? `${uid}-workEmail-error` : undefined}
                    onChange={(e) => setField("workEmail", e.target.value)}
                  />
                  {errors.workEmail && (
                    <span className={flow.fieldError} id={`${uid}-workEmail-error`}>
                      {errors.workEmail}
                    </span>
                  )}
                </p>

                <p className={flow.field} data-invalid={errors.company ? true : undefined}>
                  <label className={flow.label} htmlFor={`${uid}-company`}>
                    Company
                  </label>
                  <input
                    id={`${uid}-company`}
                    className={flow.input}
                    autoComplete="organization"
                    value={values.company}
                    disabled={paying}
                    aria-invalid={errors.company ? true : undefined}
                    aria-describedby={errors.company ? `${uid}-company-error` : undefined}
                    onChange={(e) => setField("company", e.target.value)}
                  />
                  {errors.company && (
                    <span className={flow.fieldError} id={`${uid}-company-error`}>
                      {errors.company}
                    </span>
                  )}
                </p>

                <p className={flow.field} data-invalid={errors.country ? true : undefined}>
                  <label className={flow.label} htmlFor={`${uid}-country`}>
                    Billing country
                  </label>
                  <select
                    id={`${uid}-country`}
                    className={`${flow.input} ${flow.select}`}
                    value={values.country}
                    disabled={paying}
                    aria-invalid={errors.country ? true : undefined}
                    aria-describedby={errors.country ? `${uid}-country-error` : undefined}
                    onChange={(e) => setField("country", e.target.value)}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className={flow.fieldError} id={`${uid}-country-error`}>
                      {errors.country}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* --- 02 payment --- */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <p className={styles.sectionTitle}>
                  <span className={styles.sectionNum}>02</span> Payment
                </p>
                <p className={styles.sectionNote}>No payment is taken in this preview.</p>
              </div>

              <fieldset className={styles.methods}>
                <legend className="visually-hidden">How would you like to pay?</legend>
                {(
                  [
                    { id: "card", label: "Card", note: "Deployment starts immediately" },
                    { id: "invoice", label: "Invoice", note: "For finance-led purchasing" },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.id}
                    className={styles.method}
                    data-on={method === option.id || undefined}
                  >
                    <input
                      type="radio"
                      name="method"
                      className={styles.control}
                      checked={method === option.id}
                      disabled={paying}
                      onChange={() => setMethod(option.id)}
                    />
                    <span className={styles.methodLabel}>{option.label}</span>
                    <span className={styles.methodNote}>{option.note}</span>
                  </label>
                ))}
              </fieldset>

              <PaymentSurface method={method} />
            </div>

            <p
              className={flow.submitError}
              role="alert"
              tabIndex={-1}
              ref={errorRef}
              hidden={!failure}
            >
              {failure}
            </p>

            <div className={flow.submitRow}>
              <Button type="submit" tone="primary" size="lg" arrow disabled={paying}>
                {paying ? "Starting…" : "Start my Malaky deployment"}
              </Button>
              {/* Deliberately not "you agree to our terms". The published
                  Terms of Use govern this website; the agreement covering a
                  Malaky deployment is a separate document that does not exist
                  yet, and pretending otherwise would be the one dishonest
                  sentence on the page. */}
              <p className={flow.submitNote}>
                Your service agreement is confirmed with you before Intelligence Setup begins.{" "}
                <Link href="/concept-v2/privacy" className={flow.quietLink}>
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className={flow.panel}>
              <p className={flow.sectionLabel}>After this step</p>
              <ol className={styles.next}>
                {WHAT_HAPPENS.map((item, i) => (
                  <li key={item}>
                    <span className={styles.nextNum}>{String(i + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </form>

          <aside className={flow.aside}>
            <OrderSummary selection={selection} editHref="/concept-v2/get-started" />
          </aside>
        </div>
      </section>
    </>
  );
}
