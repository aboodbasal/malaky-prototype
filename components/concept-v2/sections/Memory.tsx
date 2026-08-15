"use client";

import { useEffect, useState } from "react";
import { getBrand } from "@/lib/concept-v2/brands";
import { MEMORY_EXAMPLE } from "@/lib/concept-v2/content";
import { usePrefersReducedMotion, useReveal } from "@/hooks/useConceptHooks";
import { BrandMark } from "../BrandMark";
import { SectionHead, Stop } from "../ui";
import { ArrowRight, CheckIcon, MemoryIcon, PencilIcon } from "../icons";
import styles from "./memory.module.css";

const STEP_DELAYS = [0, 620, 1240, 1860];

/**
 * Proof of learning rather than a claim of it: the edit happens, the rule is
 * derived from it, and a later draft written by Malaky already obeys the rule.
 */
export function Memory() {
  const brand = getBrand(MEMORY_EXAMPLE.brandId);
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const reducedMotion = usePrefersReducedMotion();
  // Fully visible until the observer arms, so the sequence never hides
  // content from a visitor whose JavaScript hasn't run.
  const [step, setStep] = useState(4);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reveal === "idle") return;
    if (reveal === "armed") {
      setStep(0);
      return;
    }
    if (reducedMotion) {
      setStep(4);
      return;
    }
    setStep(0);
    const timers = STEP_DELAYS.map((d, i) =>
      window.setTimeout(() => setStep(i + 1), d + 200),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [reveal, reducedMotion, run]);

  return (
    <section className={styles.section} aria-labelledby="memory-title">
      <div className="shell">
        <SectionHead
          id="memory-title"
          title={
            <>
              You shouldn&rsquo;t have to correct the same thing twice
              <Stop />
            </>
          }
          lead="Every edit, approval and decline is a rule Malaky keeps. The next draft starts where your last correction ended."
        />

        <div className={styles.flow} ref={ref}>
          <div className={styles.lane}>
            <article className={styles.draft} data-on={step >= 1 || undefined}>
              <p className={styles.draftLabel}>
                <BrandMark brand={brand} size={16} />
                Original draft
              </p>
              <p className={`${styles.draftBody} ${styles.draftOld}`}>
                {MEMORY_EXAMPLE.original}
              </p>
            </article>

            <span className={styles.arrow} data-on={step >= 2 || undefined} aria-hidden="true">
              <PencilIcon size={14} />
            </span>

            <article
              className={`${styles.draft} ${styles.draftEdited}`}
              data-on={step >= 2 || undefined}
            >
              <p className={styles.draftLabel}>
                <PencilIcon size={13} />
                You changed it to
              </p>
              <p className={styles.draftBody}>{MEMORY_EXAMPLE.edited}</p>
            </article>
          </div>

          <div className={styles.lane}>
            <article className={styles.learned} data-on={step >= 3 || undefined}>
              <p className={styles.learnedTop}>
                <span className={styles.learnedIcon}>
                  <MemoryIcon size={15} />
                </span>
                {MEMORY_EXAMPLE.learned.title}
                <CheckIcon size={13} className={styles.learnedCheck} />
              </p>
              <p className={styles.learnedBody}>{MEMORY_EXAMPLE.learned.body}</p>
              <ul className={styles.rules}>
                {MEMORY_EXAMPLE.learned.rules.map((rule, i) => (
                  <li key={rule} style={{ "--i": i } as React.CSSProperties}>
                    <CheckIcon size={11} />
                    {rule}
                  </li>
                ))}
              </ul>
            </article>

            <span className={styles.arrowDown} data-on={step >= 4 || undefined} aria-hidden="true">
              <ArrowRight size={14} />
            </span>

            <article className={styles.future} data-on={step >= 4 || undefined}>
              <p className={styles.futureLabel}>{MEMORY_EXAMPLE.future.context}</p>
              <p className={styles.futureBody}>{MEMORY_EXAMPLE.future.body}</p>
              <p className={styles.futureNote}>
                Written in the style you taught it. Nobody re-explained the rule.
              </p>
            </article>
          </div>
        </div>

        <button type="button" className={styles.replay} onClick={() => setRun((r) => r + 1)}>
          Replay the sequence
        </button>
      </div>
    </section>
  );
}
