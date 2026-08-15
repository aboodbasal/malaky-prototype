"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ANALYSIS_STATES,
  analyzeBrandAsync,
  type AnalysisChannel,
  type BrandAnalysis,
} from "@/lib/concept-v2/analysis";
import { track } from "@/lib/concept-v2/analytics";
import { usePrefersReducedMotion } from "@/hooks/useConceptHooks";
import { Stop } from "../ui";
import { AnalysisSequence } from "./AnalysisSequence";
import { DomainForm } from "./DomainForm";
import { IntelligenceSummary } from "./IntelligenceSummary";
import { OutputStage } from "./OutputStage";
import styles from "./brandDemo.module.css";

type Phase = "idle" | "analyzing" | "ready";

/** Roughly five seconds end to end, inside the 4–7s the sequence should take. */
const STATE_INTERVAL_MS = 760;
const SETTLE_MS = 520;

/**
 * "See Malaky with your brand".
 *
 * Nothing is fetched and no website is read — `analyzeBrandAsync` is a local
 * mock (see lib/concept-v2/analysis.ts). It is already awaited here, so a real
 * ingestion call can replace it without touching this component.
 */
export function BrandDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [domain, setDomain] = useState("");
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null);
  const [reached, setReached] = useState(0);
  const [channel, setChannel] = useState<AnalysisChannel>("linkedin-company");

  const timers = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const start = useCallback(
    async (nextDomain: string) => {
      clearTimers();
      setDomain(nextDomain);
      setPhase("analyzing");
      setReached(0);
      setChannel("linkedin-company");
      track("brand_demo_started", { domain: nextDomain });

      // Resolved up front; the sequence below is presentation, not polling.
      const result = await analyzeBrandAsync(nextDomain);

      const finish = () => {
        setAnalysis(result);
        setPhase("ready");
        track("brand_demo_analysis_completed", {
          domain: nextDomain,
          company: result.company.name,
          channels: result.outputs.length,
        });
      };

      if (reducedMotion) {
        setReached(ANALYSIS_STATES.length);
        timers.current.push(window.setTimeout(finish, 150));
        return;
      }

      ANALYSIS_STATES.forEach((_, i) => {
        timers.current.push(
          window.setTimeout(() => setReached(i + 1), (i + 1) * STATE_INTERVAL_MS),
        );
      });
      timers.current.push(
        window.setTimeout(finish, ANALYSIS_STATES.length * STATE_INTERVAL_MS + SETTLE_MS),
      );
    },
    [reducedMotion],
  );

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setAnalysis(null);
    setDomain("");
    setReached(0);
    setChannel("linkedin-company");
    track("brand_demo_reset");
    // Focus belongs back on the input the visitor is about to use.
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectChannel = (next: AnalysisChannel) => {
    setChannel(next);
    track("brand_demo_channel_viewed", { domain, channel: next });
  };

  const heading =
    phase === "idle"
      ? "See Malaky with your brand"
      : phase === "analyzing"
        ? "Understanding your business"
        : "Here's what Malaky would prepare today";

  const lead =
    phase === "idle"
      ? "Enter your company website. Malaky will show you what it would prepare."
      : phase === "analyzing"
        ? "Reading the business before writing anything."
        : "Built from what Malaky learned about your business.";

  return (
    <section className={styles.section} id="brand-demo" aria-labelledby="demo-title">
      <div className="shell">
        <div className={styles.head}>
          <h2 className={styles.title} id="demo-title">
            {heading}
            <Stop />
          </h2>
          <p className={styles.lead}>{lead}</p>
        </div>

        {phase === "idle" && <DomainForm ref={inputRef} onSubmit={start} />}

        {phase === "analyzing" && <AnalysisSequence domain={domain} reached={reached} />}

        {/* IntelligenceSummary and OutputStage are direct grid children, so
            the grid-areas in the stylesheet can place the summary and channel
            selector on the left and the preview on the right. */}
        {phase === "ready" && analysis && (
          <div className={styles.result} ref={resultRef}>
            <IntelligenceSummary analysis={analysis} />
            <OutputStage analysis={analysis} selected={channel} onSelect={selectChannel} />
          </div>
        )}

        {phase === "ready" && (
          <div className={styles.footRow}>
            <button type="button" className={styles.tryAnother} onClick={reset}>
              Try another company
            </button>
            <p className={styles.note}>Preview only — nothing is published or connected.</p>
          </div>
        )}
      </div>
    </section>
  );
}
