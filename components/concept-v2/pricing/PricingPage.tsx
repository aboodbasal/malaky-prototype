import {
  ADD_ONS,
  ANNUAL_NOTE,
  COMPARISON,
  ENGAGEMENT_LINE,
  ENGAGEMENT_TERMS,
  PILLARS,
  PLANS,
  SETUP_STEPS,
  formatUsd,
} from "@/lib/concept-v2/pricing";
import { Button, Stop } from "../ui";
import {
  CheckIcon,
  ClockIcon,
  GlobeIcon,
  LayersIcon,
  MemoryIcon,
  ShieldIcon,
  SparkIcon,
  TargetIcon,
} from "../icons";
import styles from "./pricing.module.css";

const PILLAR_ICONS = [MemoryIcon, TargetIcon, SparkIcon, ShieldIcon];

/**
 * Fully static — there is no billing toggle, so this renders on the server
 * and ships no JavaScript of its own.
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
            Malaky learns your business, plans around what&rsquo;s coming, prepares the work, and
            brings your team the decisions that matter.
          </p>

          <ul className={styles.pillars}>
            {PILLARS.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <li key={p.id} className={styles.pillar}>
                  <span className={styles.pillarIcon}>
                    <Icon size={20} />
                  </span>
                  <h2 className={styles.pillarTitle}>{p.title}</h2>
                  <p className={styles.pillarBody}>{p.body}</p>
                </li>
              );
            })}
          </ul>

          <ul className={styles.terms}>
            {ENGAGEMENT_TERMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- plans -------------------------------------------------- */}
      <section className={styles.plansSection} aria-labelledby="plans-title">
        <div className="shell">
          <h2 className="visually-hidden" id="plans-title">
            Plans
          </h2>

          <div className={styles.plans}>
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={styles.plan}
                data-popular={plan.popular || undefined}
                aria-labelledby={`${plan.id}-name`}
              >
                {plan.popular && <span className={styles.popular}>Most popular</span>}

                <h3 className={styles.planName} id={`${plan.id}-name`}>
                  {plan.name}
                </h3>
                <p className={styles.planTagline}>{plan.tagline}</p>

                <div className={styles.priceBlock}>
                  {plan.monthly != null ? (
                    <>
                      <p className={styles.price}>
                        <span className={styles.priceNum}>{formatUsd(plan.monthly)}</span>
                        <span className={styles.pricePer}>/month</span>
                      </p>
                      <p className={styles.engagement}>{ENGAGEMENT_LINE}</p>
                      <p className={styles.annualNote}>{ANNUAL_NOTE}</p>
                    </>
                  ) : (
                    <>
                      <p className={styles.price}>
                        <span className={styles.priceNum}>Custom</span>
                      </p>
                      <p className={styles.engagement}>{plan.priceNote}</p>
                    </>
                  )}
                  <p className={styles.setup}>{plan.setup}</p>
                </div>

                {/* What the business gets — this is the offer. */}
                <ul className={styles.features}>
                  {plan.capabilities.map((c) => (
                    <li key={c}>
                      <CheckIcon size={12} className={styles.featureCheck} />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>

                {/* Capacity is an operational detail, not the pitch. */}
                <div className={styles.limits}>
                  <p className={styles.limitsHead}>Operating capacity</p>
                  <dl className={styles.limitsList}>
                    {plan.limits.map((l) => (
                      <div key={l.label}>
                        <dt>{l.label}</dt>
                        <dd>{l.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {plan.scoped && (
                  <div className={styles.scopedGroup}>
                    <p className={styles.scopedHead}>Available with enterprise deployment</p>
                    <ul className={styles.scopedList}>
                      {plan.scoped.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.footnote && <p className={styles.planFootnote}>{plan.footnote}</p>}

                <div className={styles.planCta}>
                  <Button
                    href="#request-demo"
                    tone={plan.popular ? "primary" : "secondary"}
                    full
                    arrow={plan.popular}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- intelligence setup ------------------------------------- */}
      <section className={styles.setupSection} aria-labelledby="setup-title">
        <div className={`shell ${styles.setupInner}`}>
          <div className={styles.setupHead}>
            <h2 className={styles.setupTitle} id="setup-title">
              Every Malaky relationship begins with intelligence setup
              <Stop />
            </h2>
            <p className={styles.setupLead}>
              Before Malaky starts operating, our team configures it around your company — your
              business, your voice, your audience and your goals — and builds your first 30-day
              marketing plan.
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
        </div>
      </section>

      {/* --- add-ons ------------------------------------------------ */}
      <section className={styles.addOnSection} aria-labelledby="addons-title">
        <div className="shell">
          <h2 className={styles.minorTitle} id="addons-title">
            Add-ons
          </h2>
          <ul className={styles.addOns}>
            {ADD_ONS.map((a) => (
              <li key={a.label} className={styles.addOn}>
                <span className={styles.addOnLabel}>{a.label}</span>
                <span className={styles.addOnPrice}>
                  {a.price}
                  <span className={styles.addOnPer}>{a.per}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- comparison --------------------------------------------- */}
      <section className={styles.compareSection} aria-labelledby="compare-title">
        <div className={`shell ${styles.compareGrid}`}>
          <div>
            <h2 className={styles.minorTitle} id="compare-title">
              Compare plans
            </h2>

            {/* Desktop: a table. Mobile: the same data as stacked cards. */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Capability</th>
                    <th scope="col">Business</th>
                    <th scope="col">
                      Scale <span className={styles.thTag}>most popular</span>
                    </th>
                    <th scope="col">Enterprise</th>
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

            <ul className={styles.compareCards}>
              {PLANS.map((plan, pi) => (
                <li key={plan.id} className={styles.compareCard}>
                  <h3>{plan.name}</h3>
                  <dl>
                    {COMPARISON.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{[row.business, row.scale, row.enterprise][pi]}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.rail}>
            <div className={styles.railCard}>
              <span className={styles.railIcon}>
                <ClockIcon size={17} />
              </span>
              <h3 className={styles.railTitle}>Twelve-month engagements</h3>
              <p className={styles.railBody}>
                Malaky gets better the longer it runs. Engagements are annual so the memory, voice
                and calendar we build with you keep compounding.
              </p>
            </div>

            <div className={styles.railCard}>
              <span className={styles.railIcon}>
                <LayersIcon size={17} />
              </span>
              <h3 className={styles.railTitle}>{ANNUAL_NOTE}</h3>
              <p className={styles.railBody}>
                Subscriptions are billed monthly by default. Prepaying the twelve months takes 10%
                off the subscription; intelligence setup is unchanged.
              </p>
            </div>

            <div className={styles.railCard}>
              <span className={styles.railIcon}>
                <GlobeIcon size={17} />
              </span>
              <h3 className={styles.railTitle}>Arabic and English, included</h3>
              <p className={styles.railBody}>
                Both languages are part of every plan — not an add-on and not a translation layer.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
