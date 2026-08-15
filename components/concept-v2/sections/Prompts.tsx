"use client";

import { INTELLIGENCE_STATES } from "@/lib/concept-v2/content";
import { useReveal } from "@/hooks/useConceptHooks";
import { SectionHead, Stop } from "../ui";
import {
  ArabicIcon,
  CalendarIcon,
  CheckIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MemoryIcon,
  ReelIcon,
  VoiceIcon,
} from "../icons";
import styles from "./prompts.module.css";

const ICONS = [MemoryIcon, VoiceIcon, CalendarIcon];

const PREPARED_CHANNELS = [
  { Icon: InstagramIcon, label: "Instagram" },
  { Icon: LinkedInIcon, label: "LinkedIn" },
  { Icon: LinkedInIcon, label: "Executive LinkedIn" },
  { Icon: ArabicIcon, label: "Arabic social" },
  { Icon: MailIcon, label: "Newsletter" },
  { Icon: ReelIcon, label: "Reel" },
];

/**
 * Three states of what Malaky is holding. The third is live — it shows work
 * already done for a date nobody asked about yet.
 */
export function Prompts() {
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.15 });

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
          lead="Malaky is always watching what's coming, so you're always ready. It holds your brand between conversations instead of starting from nothing each time."
        />

        <div className={styles.grid} ref={ref} data-reveal={reveal}>
          {INTELLIGENCE_STATES.map((state, i) => {
            const Icon = ICONS[i];
            return (
              <article
                key={state.id}
                className={styles.card}
                data-active={state.active || undefined}
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className={styles.cardTop}>
                  <span className={styles.icon}>
                    <Icon size={18} />
                  </span>
                  {state.active && (
                    <span className={styles.live}>
                      <span className={styles.liveDot} aria-hidden="true" />
                      Prepared
                    </span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{state.title}</h3>
                <p className={styles.cardBody}>{state.body}</p>

                {state.id === "founder-voice" && (
                  <span className={styles.wave} aria-hidden="true">
                    {Array.from({ length: 22 }).map((_, b) => (
                      <i key={b} style={{ "--b": b } as React.CSSProperties} />
                    ))}
                  </span>
                )}

                {state.active && (
                  <ul className={styles.channels} aria-label="Channels already prepared">
                    {PREPARED_CHANNELS.map(({ Icon: ChIcon, label }, c) => (
                      <li
                        key={label}
                        className={styles.channel}
                        style={{ "--c": c } as React.CSSProperties}
                      >
                        <ChIcon size={12} />
                        <span className="visually-hidden">{label}</span>
                        <CheckIcon size={9} className={styles.channelCheck} />
                      </li>
                    ))}
                  </ul>
                )}

                <dl className={styles.proof}>
                  {state.proof?.map((row) => (
                    <div key={row.label} className={styles.proofRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                {state.meta && <p className={styles.meta}>{state.meta}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
