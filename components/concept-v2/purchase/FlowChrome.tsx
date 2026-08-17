import type { ReactNode } from "react";
import { DEMO_NOTICE } from "@/lib/concept-v2/onboarding-steps";
import { Stop } from "../ui";
import styles from "./flow.module.css";

/**
 * The opening block every screen in the journey shares, and the one sentence
 * none of them may be without.
 */

export function FlowHead({
  eyebrow,
  title,
  lead,
  notice = true,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Only the completion screen turns this off — it carries its own. */
  notice?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={styles.top}>
      <span className={styles.topGlow} aria-hidden="true" />
      <div className={`shell ${styles.topInner}`}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>
          {title}
          <Stop />
        </h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
        {notice && <DemoNotice />}
      </div>
    </section>
  );
}

/**
 * Says what is and is not real, in the interface rather than in a comment.
 *
 * The rule this enforces: no screen in the flow may claim that money moved,
 * an account exists, a file was stored, a channel was connected or a meeting
 * was booked. This line is the standing correction to all five.
 */
export function DemoNotice({ text = DEMO_NOTICE }: { text?: string }) {
  return (
    <p className={styles.notice}>
      <span className={styles.noticeLabel}>Preview</span>
      <span>{text}</span>
    </p>
  );
}
