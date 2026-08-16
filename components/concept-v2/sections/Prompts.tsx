"use client";

import { useEffect, useState } from "react";
import { PROACTIVE_MOMENT } from "@/lib/concept-v2/content";
import {
  daysUntil,
  formatCountdown,
  formatObservanceDate,
  getObservance,
} from "@/lib/concept-v2/calendar";
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
 *
 * The occasion is a real public holiday, so its date comes from the verified
 * calendar and the countdown is computed from that date. Nothing about a real
 * country/event pairing is hard-coded here.
 */
export function Prompts() {
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const observance = getObservance(PROACTIVE_MOMENT.observanceId);

  /* The date is always right and renders on the server. The countdown depends
     on today, so it is added after mount — a server-rendered "N days away"
     would be stale the moment the page was cached, and would mismatch on
     hydration. */
  const [countdown, setCountdown] = useState<string | null>(null);
  useEffect(() => {
    setCountdown(formatCountdown(daysUntil(observance, new Date())));
  }, [observance]);

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
            <p className={styles.occasion}>{observance.name}</p>
            <p className={styles.countdown}>
              {formatObservanceDate(observance)}
              {countdown && (
                <>
                  <span aria-hidden="true"> · </span>
                  {countdown}
                </>
              )}
            </p>
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
