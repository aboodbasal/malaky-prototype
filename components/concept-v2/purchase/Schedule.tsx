"use client";

import { useEffect, useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EMPTY_WALKTHROUGH,
  HORIZONS,
  TIMEZONES,
  WALKTHROUGH_COVERS,
  WINDOWS,
  requestWalkthrough,
  type WalkthroughRequest,
} from "@/lib/concept-v2/adapters";
import { WALKTHROUGH_STEP } from "@/lib/concept-v2/onboarding-steps";
import { readSelection, saveFlow, withSelection } from "@/lib/concept-v2/flow-state";
import { track } from "@/lib/concept-v2/analytics";
import { Button } from "../ui";
import { CheckIcon } from "../icons";
import { FlowHead } from "./FlowChrome";
import { StepRail } from "./StepRail";
import flow from "./flow.module.css";
import styles from "./onboarding.module.css";

/**
 * Step 08: the walkthrough.
 *
 * Deliberately a preference form and not a slot picker. There is no calendar
 * behind this page, so a grid of times would be invented availability — the
 * one thing the brief rules out and the one thing a customer would most
 * reasonably believe. Windows and a horizon are true no matter what the team's
 * calendar looks like, and the confirmation says the time will be confirmed
 * rather than that it has been booked.
 *
 * See lib/concept-v2/adapters/scheduling for what production has to provide,
 * and for the note that turning this into slot-picking is a redesign.
 */
export function Schedule() {
  const params = useSearchParams();
  const router = useRouter();
  const selection = readSelection(params);

  const [values, setValues] = useState<WalkthroughRequest>(EMPTY_WALKTHROUGH);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const uid = useId();

  useEffect(() => {
    track("walkthrough_view");
  }, []);

  const toggleWindow = (id: string) => {
    setError(null);
    setValues((v) => ({
      ...v,
      windows: v.windows.includes(id)
        ? v.windows.filter((w) => w !== id)
        : [...v.windows, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    if (values.windows.length === 0) {
      setError("Choose at least one time of day that works for you.");
      return;
    }

    setSending(true);
    track("walkthrough_requested", { windows: values.windows, horizon: values.horizon });

    const result = await requestWalkthrough(values);
    if (!result.ok) {
      setSending(false);
      setError(result.message ?? "We couldn't record that just now. Please try again.");
      return;
    }

    const chosen = WINDOWS.filter((w) => values.windows.includes(w.id)).map((w) => w.label);
    const horizon = HORIZONS.find((h) => h.id === values.horizon);
    saveFlow({ walkthroughWindow: `${chosen.join(" or ")}, ${horizon?.label.toLowerCase()}` });

    router.push(withSelection("/concept-v2/onboarding/complete", selection));
  };

  return (
    <>
      <FlowHead
        eyebrow="Intelligence Setup"
        title="Meet the team running your setup"
        lead="One walkthrough, with the people who will configure your deployment. Tell us when suits and we will confirm a time."
      />

      <section className={flow.body} aria-labelledby="walkthrough-title">
        <div className={`shell ${styles.layout}`}>
          <StepRail currentIndex={7} />

          <form className={styles.step} onSubmit={submit} noValidate>
            <div className={styles.stepHead}>
              <p className={styles.stepEyebrow}>
                <span className={styles.stepNum}>{WALKTHROUGH_STEP.num}</span>
                Step 8 of 8
              </p>
              <h2 className={styles.stepTitle} id="walkthrough-title">
                {WALKTHROUGH_STEP.title}
              </h2>
              <p className={styles.stepLead}>{WALKTHROUGH_STEP.purpose}</p>
            </div>

            <div className={styles.stepBody}>
              <div className={styles.calendarSplit}>
                <div className={styles.stepBody}>
                  <p className={flow.field}>
                    <label className={flow.label} htmlFor={`${uid}-tz`}>
                      Your timezone
                    </label>
                    <select
                      id={`${uid}-tz`}
                      className={`${flow.input} ${flow.select}`}
                      value={values.timezone}
                      onChange={(e) => setValues((v) => ({ ...v, timezone: e.target.value }))}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.id} value={tz.id}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </p>

                  <fieldset className={styles.group}>
                    <legend className={styles.groupLabel}>What time of day suits you?</legend>
                    <div className={flow.chips}>
                      {WINDOWS.map((w) => {
                        const on = values.windows.includes(w.id);
                        return (
                          <label key={w.id} className={flow.chip} data-on={on || undefined}>
                            <input
                              type="checkbox"
                              className={flow.chipInput}
                              checked={on}
                              disabled={sending}
                              onChange={() => toggleWindow(w.id)}
                            />
                            <CheckIcon size={12} className={flow.chipCheck} aria-hidden="true" />
                            {w.label}
                            <span className={flow.optional}>{w.detail}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend className={styles.groupLabel}>How soon?</legend>
                    <div className={flow.chips}>
                      {HORIZONS.map((h) => {
                        const on = values.horizon === h.id;
                        return (
                          <label key={h.id} className={flow.chip} data-on={on || undefined}>
                            <input
                              type="radio"
                              name="horizon"
                              className={flow.chipInput}
                              checked={on}
                              disabled={sending}
                              onChange={() => setValues((v) => ({ ...v, horizon: h.id }))}
                            />
                            <CheckIcon size={12} className={flow.chipCheck} aria-hidden="true" />
                            {h.label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className={flow.fields}>
                    <p className={`${flow.field} ${flow.fieldWide}`}>
                      <span className={flow.labelRow}>
                        <label className={flow.label} htmlFor={`${uid}-attendees`}>
                          Who else should join?
                        </label>
                        <span className={flow.optional}>Optional</span>
                      </span>
                      <input
                        id={`${uid}-attendees`}
                        className={flow.input}
                        placeholder="Names or email addresses"
                        value={values.attendees}
                        disabled={sending}
                        onChange={(e) => setValues((v) => ({ ...v, attendees: e.target.value }))}
                      />
                    </p>
                    <p className={`${flow.field} ${flow.fieldWide}`}>
                      <span className={flow.labelRow}>
                        <label className={flow.label} htmlFor={`${uid}-notes`}>
                          Anything we should prepare?
                        </label>
                        <span className={flow.optional}>Optional</span>
                      </span>
                      <textarea
                        id={`${uid}-notes`}
                        className={`${flow.input} ${flow.textarea}`}
                        rows={3}
                        value={values.notes}
                        disabled={sending}
                        onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                      />
                    </p>
                  </div>
                </div>

                <div className={flow.panel}>
                  <p className={flow.sectionLabel}>What the walkthrough covers</p>
                  <ul className={`${styles.prompts} ${styles.panelList}`}>
                    {WALKTHROUGH_COVERS.map((item) => (
                      <li key={item}>
                        <span className={`${styles.dot} ${styles.dotGold}`} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className={flow.panelLead}>
                    Usually one call, with whoever from your side should be in the room.
                  </p>
                </div>
              </div>

              <p className={styles.truth}>
                No time is held and no invitation is sent from this screen. We confirm the exact
                time with you before the walkthrough happens.
              </p>
            </div>

            <p className={flow.submitError} role="alert" hidden={!error}>
              {error}
            </p>

            <div className={styles.nav}>
              <div className={styles.navLeft}>
                <Button
                  tone="ghost"
                  href={withSelection("/concept-v2/onboarding", selection)}
                >
                  Back to setup
                </Button>
                <span className={styles.progress}>8 / 8</span>
              </div>
              <Button type="submit" tone="primary" size="lg" arrow disabled={sending}>
                {sending ? "Sending…" : "Request my walkthrough"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
