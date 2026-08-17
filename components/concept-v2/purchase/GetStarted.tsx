"use client";

import { useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MANAGED,
  TERMS,
  formatUsd,
  monthlyLabel,
  purchasablePlans,
  type OrderSelection,
  type PurchasablePlanId,
  type Term,
} from "@/lib/concept-v2/commerce";
import { SETUP_PRICE_LINE, SETUP_STEPS } from "@/lib/concept-v2/pricing";
import { readSelection, withSelection } from "@/lib/concept-v2/flow-state";
import { track } from "@/lib/concept-v2/analytics";
import { Button } from "../ui";
import { CheckIcon } from "../icons";
import { FlowHead } from "./FlowChrome";
import { OrderSummary } from "./OrderSummary";
import flow from "./flow.module.css";
import styles from "./getStarted.module.css";

/** The four coverage rows that actually differ between Business and Scale. */
const SHOWN_ROWS = ["Brands", "Executive voices", "Campaign planning", "Support"];

/**
 * Step one of the journey: choose a deployment.
 *
 * Three decisions and no more — plan, term, and whether Malaky is operated
 * with you. Enterprise is not one of the choices, because it cannot be bought
 * from a page; it sits underneath as a route into a conversation.
 *
 * Nothing is reserved, held or charged here. The selection lives in the URL
 * (see lib/concept-v2/flow-state) so it survives a refresh and can be sent to
 * a colleague, and that is the whole of its persistence.
 *
 * On the markup: each card is a container with a real radio or checkbox and a
 * `<label>` whose ::after stretches over the whole card. A card carries a
 * price, a list and a description — none of which may live inside a label —
 * so the native control does the semantics and the card does the hit area.
 */
export function GetStarted() {
  const params = useSearchParams();
  const [selection, setSelection] = useState<OrderSelection>(() => readSelection(params));
  const plans = purchasablePlans();
  const uid = useId();

  useEffect(() => {
    track("get_started_view");
  }, []);

  const choosePlan = (planId: PurchasablePlanId) => {
    setSelection((s) => ({ ...s, planId }));
    track("plan_selected", { plan: planId });
  };

  const chooseTerm = (term: Term) => {
    setSelection((s) => ({ ...s, term }));
    track("term_selected", { term });
  };

  const toggleManaged = () => {
    setSelection((s) => {
      track("managed_toggled", { on: !s.managed });
      return { ...s, managed: !s.managed };
    });
  };

  return (
    <>
      <FlowHead
        eyebrow="Get started"
        title="Choose how Malaky runs your marketing"
        lead="Two deployments and one optional operating layer. Everything here can still be changed with us before setup begins."
      />

      <section className={flow.body} aria-labelledby="choose-title">
        <div className={`shell ${flow.grid}`}>
          <div className={flow.main}>
            <h2 className="visually-hidden" id="choose-title">
              Choose your deployment
            </h2>

            {/* --- 01 plan --- */}
            <div className={styles.block}>
              <div className={styles.blockHead}>
                <p className={styles.stepLabel}>
                  <span className={styles.stepNum}>01</span> Deployment
                </p>
              </div>

              <fieldset className={styles.plans}>
                <legend className="visually-hidden">Plan</legend>
                {plans.map((plan) => {
                  const on = selection.planId === plan.id;
                  const id = `${uid}-plan-${plan.id}`;
                  const rows = plan.coverage.filter((r) => SHOWN_ROWS.includes(r.label));
                  return (
                    <div key={plan.id} className={styles.plan} data-on={on || undefined}>
                      <input
                        type="radio"
                        id={id}
                        name="plan"
                        className={styles.control}
                        checked={on}
                        onChange={() => choosePlan(plan.id as PurchasablePlanId)}
                      />
                      <div className={styles.planTop}>
                        <label htmlFor={id} className={styles.planName}>
                          {plan.name}
                        </label>
                        <span className={styles.mark} aria-hidden="true">
                          <CheckIcon size={12} />
                        </span>
                      </div>
                      <p className={styles.planPrice}>
                        <span className={styles.planNum}>{formatUsd(plan.monthly as number)}</span>
                        <span className={styles.planUnit}>/ month</span>
                      </p>
                      <p className={styles.planTagline}>{plan.tagline}</p>
                      <dl className={styles.planRows}>
                        {rows.map((row) => (
                          <div key={row.label} className={styles.planRow}>
                            <dt>{row.label}</dt>
                            <dd>{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </fieldset>
            </div>

            {/* --- 02 term --- */}
            <div className={styles.block}>
              <div className={styles.blockHead}>
                <p className={styles.stepLabel}>
                  <span className={styles.stepNum}>02</span> Billing
                </p>
                {/* Says what the control does. It deliberately makes no
                    commitment about ending or continuing a subscription —
                    that belongs in the service agreement, not in a helper
                    line above a pair of radio buttons. */}
                <p className={styles.blockNote}>
                  Choose monthly or annual billing. Save 10% with annual prepayment.
                </p>
              </div>

              <fieldset className={styles.terms}>
                <legend className="visually-hidden">Billing term</legend>
                {TERMS.map((term) => {
                  const on = selection.term === term.id;
                  return (
                    <label key={term.id} className={styles.term} data-on={on || undefined}>
                      <input
                        type="radio"
                        name="term"
                        className={styles.control}
                        checked={on}
                        onChange={() => chooseTerm(term.id)}
                      />
                      <span className={styles.termLabel}>{term.label}</span>
                      <span className={styles.termNote}>{term.note}</span>
                    </label>
                  );
                })}
              </fieldset>
            </div>

            {/* --- 03 managed --- */}
            <div className={styles.block}>
              <div className={styles.blockHead}>
                <p className={styles.stepLabel}>
                  <span className={styles.stepNum}>03</span> {MANAGED.eyebrow}
                </p>
              </div>

              <div className={styles.managed} data-on={selection.managed || undefined}>
                <input
                  type="checkbox"
                  id={`${uid}-managed`}
                  className={styles.control}
                  checked={selection.managed}
                  onChange={toggleManaged}
                />
                <div className={styles.managedTop}>
                  <p>
                    <label htmlFor={`${uid}-managed`} className={styles.managedName}>
                      {MANAGED.name}
                    </label>
                    <span className={styles.managedPrice}>
                      {" · "}
                      +{monthlyLabel(MANAGED.monthly)}
                    </span>
                  </p>
                  <span className={styles.switch} aria-hidden="true" />
                </div>

                <p className={styles.couplet}>
                  {MANAGED.couplet.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>

                <p className={styles.managedBody}>{MANAGED.description}</p>

                <ul className={styles.managedList}>
                  {MANAGED.responsibilities.map((item) => (
                    <li key={item}>
                      <CheckIcon size={12} className={styles.tick} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className={styles.managedNote}>{MANAGED.clarification}</p>
              </div>
            </div>

            {/* --- setup --- */}
            <div className={`${flow.panel} ${styles.setup}`}>
              <p className={flow.sectionLabel}>Intelligence Setup</p>
              <p className={flow.panelLead}>{SETUP_PRICE_LINE}</p>
              <ul className={styles.setupSteps}>
                {SETUP_STEPS.map((step) => (
                  <li key={step} className={styles.setupStep}>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* --- enterprise --- */}
            <div className={styles.enterprise}>
              <div className={styles.enterpriseText}>
                <p className={styles.enterpriseTitle}>Larger than this?</p>
                <p className={styles.enterpriseBody}>
                  Multi-brand, multi-market and tailored deployments are scoped with you rather
                  than chosen from a page.
                </p>
              </div>
              <Button href="/concept-v2/request-demo" tone="secondary">
                Request a private demo
              </Button>
            </div>
          </div>

          <aside className={flow.aside}>
            <OrderSummary selection={selection}>
              <Button
                href={withSelection("/concept-v2/checkout", selection)}
                tone="primary"
                size="lg"
                full
                arrow
              >
                Continue to checkout
              </Button>
            </OrderSummary>
          </aside>
        </div>
      </section>
    </>
  );
}
