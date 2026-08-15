"use client";

import { TRUST_PILLARS } from "@/lib/concept-v2/content";
import { useReveal } from "@/hooks/useConceptHooks";
import { SectionHead, Stop } from "../ui";
import { CheckCircleIcon, LayersIcon, MemoryIcon, TargetIcon } from "../icons";
import styles from "./trust.module.css";

const ICONS: Record<string, typeof MemoryIcon> = {
  "human-approval": CheckCircleIcon,
  "business-knowledge": MemoryIcon,
  "roles-workflows": LayersIcon,
  "source-visibility": TargetIcon,
};

/**
 * The reassurance before the ask.
 *
 * Each card carries an explicit state. "Demonstrated" means the behaviour is
 * actually exercised elsewhere on this page; "planned" means it is described
 * but not built. Labelling both keeps the section from reading as a list of
 * shipped guarantees.
 */
export function Trust() {
  const [ref, reveal] = useReveal<HTMLUListElement>({ threshold: 0.15 });

  return (
    <section className={styles.section} id="control" aria-labelledby="trust-title">
      <div className="shell">
        <SectionHead
          id="trust-title"
          title={
            <>
              Your brand stays under your control
              <Stop />
            </>
          }
          lead="Malaky can prepare the work. Your team decides what goes live."
        />

        <ul className={styles.grid} ref={ref} data-reveal={reveal}>
          {TRUST_PILLARS.map((pillar, i) => {
            const Icon = ICONS[pillar.id] ?? MemoryIcon;
            const planned = pillar.state === "planned";
            return (
              <li
                key={pillar.id}
                className={styles.card}
                data-planned={planned || undefined}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className={styles.icon}>
                  <Icon size={18} />
                </span>
                <h3 className={styles.cardTitle}>{pillar.title}</h3>
                <p className={styles.cardBody}>{pillar.body}</p>
                <p className={styles.state}>
                  {planned ? "Planned — not built yet" : "Demonstrated in this concept"}
                </p>
              </li>
            );
          })}
        </ul>

        <p className={styles.disclosure}>
          These labels describe this concept, not a shipped product. &ldquo;Demonstrated&rdquo;
          means you can exercise the behaviour on this page; &ldquo;planned&rdquo; means it is
          described here and still to be built. Worth confirming against the real application
          before any of this copy goes live.
        </p>
      </div>
    </section>
  );
}
