"use client";

import { PROACTIVE_MOMENT } from "@/lib/concept-v2/content";
import { useReveal } from "@/hooks/useConceptHooks";
import { SectionHead, Stop } from "../ui";
import { CalendarIcon, CheckIcon } from "../icons";
import styles from "./prompts.module.css";

/**
 * Proactive opportunity detection, and nothing else.
 *
 * One panel rather than a grid of cards — both because there is one idea to
 * carry now, and because it gives the page a different shape between the hero
 * and the six-card fan-out that follows.
 */
export function Prompts() {
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className={styles.section} id="product" aria-labelledby="prompts-title">
      <div className="shell">
        <SectionHead
          id="prompts-title"
          title={
            <>
              It doesn&rsquo;t wait for prompts
              <Stop />
            </>
          }
          lead="Malaky watches what's coming and starts the work before anyone asks for it."
        />

        <article className={styles.panel} ref={ref} data-reveal={reveal}>
          <div className={styles.date}>
            <span className={styles.dateIcon}>
              <CalendarIcon size={20} />
            </span>
            <p className={styles.occasion}>{PROACTIVE_MOMENT.occasion}</p>
            <p className={styles.countdown}>{PROACTIVE_MOMENT.countdown}</p>
          </div>

          <div className={styles.detail}>
            <p className={styles.live}>
              <span className={styles.liveDot} aria-hidden="true" />
              {PROACTIVE_MOMENT.status}
            </p>
            <p className={styles.body}>{PROACTIVE_MOMENT.body}</p>

            <dl className={styles.proof}>
              {PROACTIVE_MOMENT.proof.map((row) => (
                <div key={row.label} className={styles.proofRow}>
                  <dt>
                    <CheckIcon size={12} />
                    {row.label}
                  </dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}
