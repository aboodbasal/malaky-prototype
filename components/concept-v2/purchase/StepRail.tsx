import { STEPS } from "@/lib/concept-v2/onboarding-steps";
import styles from "./onboarding.module.css";

/**
 * The eight steps, always all eight.
 *
 * A percentage or a filling bar would be a guess about how long the rest
 * takes. Numbered steps are not: a customer can see exactly where they are and
 * exactly how much is left. Steps already answered can be returned to; steps
 * ahead cannot be jumped to, because each one narrows what the next asks.
 */
export function StepRail({
  currentIndex,
  onJump,
}: {
  currentIndex: number;
  /** Absent on the walkthrough step, which is a separate route. */
  onJump?: (index: number) => void;
}) {
  return (
    <nav className={styles.rail} aria-label="Setup steps">
      <p className={styles.railHead}>Steps</p>
      <ol>
        {STEPS.map((step, i) => {
          const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "todo";
          const inner = (
            <>
              <span className={styles.railNum}>{step.num}</span>
              <span className={styles.railTitle}>{step.title}</span>
              <span className={styles.railPurpose}>{step.purpose}</span>
            </>
          );

          return (
            <li key={step.id}>
              {state === "done" && onJump ? (
                <button
                  type="button"
                  className={styles.railItem}
                  data-state={state}
                  onClick={() => onJump(i)}
                >
                  {inner}
                </button>
              ) : (
                <div
                  className={styles.railItem}
                  data-state={state}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
