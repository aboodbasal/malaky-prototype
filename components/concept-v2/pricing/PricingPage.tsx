import {
  ADDITIONAL_SCOPE,
  SCOPED_ITEMS,
  SCOPED_NOTE,
  ANNUAL_NOTE,
  CAPACITY_DETAIL,
  CAPACITY_NOTE,
  COMPARISON,
  PLANS,
  PLATFORM,
  PLATFORM_PLANNED,
  PRICE_FROM_LINE,
  SETUP_CLOSE,
  SETUP_STEPS,
  formatUsd,
} from "@/lib/concept-v2/pricing";
import { Button, Stop } from "../ui";
import { CheckIcon } from "../icons";
import styles from "./pricing.module.css";

/**
 * Fully static — no billing toggle, no interactive state, so this renders on
 * the server and ships no JavaScript of its own. The one interactive element
 * is a native <details>, which needs none.
 *
 * The order is the argument: what the platform is, then how much of the
 * organisation each deployment covers, then what configuring it involves,
 * then only the differences, then the conversation.
 */
export function PricingPage() {
  return (
    <>
      {/* --- opening ------------------------------------------------ */}
      <section className={styles.top}>
        <span className={styles.topGlow} aria-hidden="true" />
        <div className={`shell ${styles.topInner}`}>
          <h1 className={styles.title}>
            Malaky is not another tool.
            <br />
            <span className={styles.titleGold}>It&rsquo;s your marketing operation</span>
            <Stop />
          </h1>
          <p className={styles.lead}>
            Every deployment is configured around your brand, team, markets and approval
            process.
          </p>
          <p className={styles.priceFrom}>{PRICE_FROM_LINE}</p>
        </div>
      </section>

      {/* --- the platform, stated once ------------------------------ */}
      <section className={styles.platformSection} aria-labelledby="platform-title">
        <div className="shell">
          <div className={styles.platformGrid}>
            <div>
              <h2 className={styles.sectionTitle} id="platform-title">
                Every Malaky deployment includes
                <Stop />
              </h2>

              {/* Named rather than omitted — both were previously implied by
                  plan features that read as shipped. */}
              <div className={styles.planned}>
                <p className={styles.plannedHead}>Described here, still to be built</p>
                <ul className={styles.plannedList}>
                  {PLATFORM_PLANNED.map((c) => (
                    <li key={c.title}>
                      <span>{c.title}</span> — {c.body}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <ul className={styles.platform}>
              {PLATFORM.map((c) => (
                <li key={c.title} className={styles.capability}>
                  <CheckIcon size={13} className={styles.capabilityCheck} />
                  <div>
                    <p className={styles.capabilityTitle}>{c.title}</p>
                    <p className={styles.capabilityBody}>{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- plans -------------------------------------------------- */}
      <section className={styles.plansSection} aria-labelledby="plans-title">
        <div className="shell">
          <h2 className="visually-hidden" id="plans-title">
            Deployments
          </h2>

          <div className={styles.plans}>
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={styles.plan}
                data-scoped={plan.monthly == null || undefined}
                aria-labelledby={`${plan.id}-name`}
              >
                <h3 className={styles.planName} id={`${plan.id}-name`}>
                  {plan.name}
                </h3>
                <p className={styles.planTagline}>{plan.tagline}</p>

                <div className={styles.priceBlock}>
                  {plan.monthly != null ? (
                    <p className={styles.price}>
                      <span className={styles.priceNum}>{formatUsd(plan.monthly)}</span>
                      <span className={styles.pricePer}>/month</span>
                    </p>
                  ) : (
                    <p className={styles.price}>
                      <span className={styles.priceNum}>{plan.priceNote}</span>
                    </p>
                  )}

                  <dl className={styles.priceMeta}>
                    <div>
                      <dt>{plan.setupLabel}</dt>
                      <dd>{plan.setupValue}</dd>
                    </div>
                    {plan.term && (
                      <div>
                        <dt>Term</dt>
                        <dd>{plan.term}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* The offer: how much of the marketing operation this covers. */}
                <dl className={styles.coverage}>
                  {plan.coverage.map((row) => (
                    <div key={row.label} className={styles.coverageRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <p className={styles.capacity}>{plan.capacity}</p>

                {plan.footnote && <p className={styles.planFootnote}>{plan.footnote}</p>}

                <div className={styles.planCta}>
                  <Button href="/concept-v2/request-demo" tone="secondary" full>
                    Request a private demo
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Terms, not features. Closed by default and native, so it needs no
              JavaScript and stays keyboard-operable. */}
          <div className={styles.belowPlans}>
            <details className={styles.capacityDetails}>
              <summary>Operating capacity in detail</summary>
              <div className={styles.capacityBody}>
                <table className={styles.capacityTable}>
                  <thead>
                    <tr>
                      <th scope="col">Ceiling</th>
                      <th scope="col">Business</th>
                      <th scope="col">Scale</th>
                      <th scope="col">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAPACITY_DETAIL.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.business}</td>
                        <td>{row.scale}</td>
                        <td>{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.capacityNote}>{CAPACITY_NOTE}</p>
              </div>
            </details>

            {/* Said once on the page, not inside three cards. */}
            <p className={styles.annual}>{ANNUAL_NOTE}</p>
          </div>
        </div>
      </section>

      {/* --- intelligence setup ------------------------------------- */}
      <section className={styles.setupSection} aria-labelledby="setup-title">
        <div className={`shell ${styles.setupInner}`}>
          <div className={styles.setupHead}>
            <h2 className={styles.setupTitle} id="setup-title">
              Your Malaky deployment starts with Intelligence Setup
              <Stop />
            </h2>
            <p className={styles.setupLead}>
              Malaky is configured, not activated. Before it operates, our team builds your
              company into it — the brand, the voices, the facts your team has approved, the
              calendar and the way work gets signed off.
            </p>
          </div>

          <ol className={styles.setupSteps}>
            {SETUP_STEPS.map((step, i) => (
              <li key={step} className={styles.setupStep}>
                <span className={styles.setupNum}>{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>

          <p className={styles.setupClose}>{SETUP_CLOSE}</p>
        </div>
      </section>

      {/* --- what changes between plans ----------------------------- */}
      <section className={styles.compareSection} aria-labelledby="compare-title">
        <div className="shell">
          <h2 className={styles.sectionTitle} id="compare-title">
            What changes between deployments
            <Stop />
          </h2>

          {/* One table at every width. Narrow screens scroll it sideways —
              stacking it per plan would reprint the coverage already in the
              cards above, which is the duplication this page is removing. */}
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="compare-title">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Coverage</th>
                  {PLANS.map((p) => (
                    <th key={p.id} scope="col">
                      {p.name.replace("Malaky ", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.business}</td>
                    <td>{row.scale}</td>
                    <td>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scope lives here rather than inside the Enterprise card, where it
              stretched the row and left the other two cards half empty. */}
          <div className={styles.additional}>
            <p className={styles.additionalHead}>Additional scope</p>
            <div>
              <p className={styles.additionalBody}>{ADDITIONAL_SCOPE}</p>
              <ul className={styles.scopedList}>
                {SCOPED_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className={styles.additionalNote}>{SCOPED_NOTE}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
