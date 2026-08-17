"use client";

import { useMemo, useState } from "react";
import {
  ANCHOR,
  DEFAULT_ENTRY_ID,
  STATUS,
  WEEKDAYS,
  buildMonth,
  monthName,
  resolveEntries,
  type ResolvedEntry,
} from "@/lib/concept-v2/operating-calendar";
import { formatObservanceDate } from "@/lib/concept-v2/calendar";
import { useReveal } from "@/hooks/useConceptHooks";
import { SectionHead, Stop } from "../ui";
import { ArrowRight, CheckIcon } from "../icons";
import styles from "./prompts.module.css";

/** The mark in a calendar cell. Four shapes, readable without a legend. */
function StatusGlyph({ glyph }: { glyph: "check" | "full" | "half" | "ring" }) {
  if (glyph === "check") return <CheckIcon size={11} />;
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      {glyph === "ring" && (
        <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      )}
      {glyph === "half" && (
        <>
          <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6 1.6a4.4 4.4 0 0 1 0 8.8Z" fill="currentColor" />
        </>
      )}
      {glyph === "full" && <circle cx="6" cy="6" r="5" fill="currentColor" />}
    </svg>
  );
}

/**
 * The operating calendar.
 *
 * A month of Malaky's work, laid out as a month: finished behind the reference
 * day, prepared or preparing ahead of it, and one thing waiting on a person.
 * The argument is meant to land before any copy is read — Malaky knows what is
 * coming, knows what happened, has already done the work, and the human
 * reviews.
 *
 * Real occasions carry no date here. They are resolved from the verified
 * calendar, and a countdown beside one is computed from the real clock after
 * mount. The grid itself is anchored so it renders identically on the server
 * and the client — see lib/concept-v2/operating-calendar.ts.
 */
export function Prompts() {
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.15 });
  const [selectedId, setSelectedId] = useState(DEFAULT_ENTRY_ID);

  const entries = useMemo(() => resolveEntries(), []);
  const cells = useMemo(() => buildMonth(entries), [entries]);
  const selected =
    entries.find((e) => e.id === selectedId) ?? (entries[0] as ResolvedEntry);

  /* A verified occasion shows its verified date, not a distance from the
     viewer's clock. The grid is an anchored illustration, so a live countdown
     would put two different timelines on the same card. daysUntil() and
     formatCountdown() remain in ./calendar for surfaces that are live. */
  const observedOn = selected.observance
    ? formatObservanceDate(selected.observance)
    : null;

  const status = STATUS[selected.status];
  const finished = status.tone === "done";

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

        <div className={styles.frame} ref={ref} data-reveal={reveal}>
          {/* --- the month --------------------------------------------- */}
          <div className={styles.calendar}>
            <div className={styles.calHead}>
              {/* The month is an anchored illustration, not the viewer's own
                  month — said quietly, next to the thing it qualifies. */}
              <div className={styles.monthBlock}>
                <h3 className={styles.month}>{monthName()}</h3>
                <p className={styles.calNote}>Illustrative operating calendar</p>
              </div>
              <ul className={styles.legend}>
                {[
                  ["check", "Done"],
                  ["full", "Needs you"],
                  ["half", "In progress"],
                  ["ring", "Noticed"],
                ].map(([glyph, label]) => (
                  <li key={label} data-tone={label.toLowerCase().replace(" ", "-")}>
                    <span className={styles.legendMark}>
                      <StatusGlyph glyph={glyph as "check"} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.weekdays} aria-hidden="true">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className={styles.grid} role="list" aria-label={`${monthName()} marketing calendar`}>
              {cells.map((cell, i) => {
                if (cell.day == null) {
                  return <span key={`pad-${i}`} className={styles.pad} aria-hidden="true" />;
                }

                const entry = cell.entry;
                const meta = entry ? STATUS[entry.status] : null;

                return (
                  <div
                    key={cell.day}
                    role="listitem"
                    className={styles.cell}
                    data-when={cell.when}
                    data-has-event={entry ? true : undefined}
                  >
                    {/* The mark sits beside the number rather than beside the
                        name: a seventh of the grid is too narrow to give up
                        16px of a two-word label to it. */}
                    <span className={styles.dayRow}>
                      <span className={styles.dayNum}>{cell.day}</span>
                      {meta && (
                        <span className={styles.cellMark} data-tone={meta.tone} aria-hidden="true">
                          <StatusGlyph glyph={meta.glyph} />
                        </span>
                      )}
                    </span>

                    {entry && meta && (
                      <button
                        type="button"
                        className={styles.event}
                        data-tone={meta.tone}
                        data-selected={entry.id === selectedId || undefined}
                        aria-pressed={entry.id === selectedId}
                        onClick={() => setSelectedId(entry.id)}
                      >
                        <span className={styles.eventName}>{entry.short}</span>
                        <span className="visually-hidden">
                          {" "}
                          — {meta.label},{" "}
                          {entry.kind === "observance"
                            ? "public holiday"
                            : "company event"}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- the selected event ------------------------------------ */}
          <div className={styles.detail} aria-live="polite">
            <p className={styles.detailKind}>
              {selected.kind === "observance" ? "Public holiday" : "Company event"}
            </p>
            <h3 className={styles.detailTitle}>{selected.title}</h3>

            <div className={styles.detailMeta}>
              {observedOn && <span className={styles.observedOn}>{observedOn}</span>}
              <span className={styles.statusPill} data-tone={status.tone}>
                <span className={styles.statusMark}>
                  <StatusGlyph glyph={status.glyph} />
                </span>
                {status.label}
              </span>
            </div>

            <p className={styles.workHead}>{finished ? "Completed" : "Prepared"}</p>
            <ul className={styles.work}>
              {selected.work.map((item) => (
                <li key={item.channel} data-done={item.done || undefined}>
                  <span className={styles.workMark}>
                    {item.done ? <CheckIcon size={11} /> : <StatusGlyph glyph="ring" />}
                  </span>
                  <span className={styles.workChannel}>{item.channel}</span>
                  <span className={styles.workState}>{item.state}</span>
                </li>
              ))}
            </ul>

            {selected.awaiting && (
              <div className={styles.awaiting}>
                <p className={styles.awaitingHead}>Awaiting</p>
                <p className={styles.awaitingBody}>{selected.awaiting}</p>
              </div>
            )}

            {/* Part of the depicted product surface, like the chrome inside
                the post cards elsewhere on this page — not a control on this
                website, so it is not focusable and leads nowhere. */}
            {!finished && (
              <span className={styles.review} aria-hidden="true">
                Review campaign
                <ArrowRight size={14} />
              </span>
            )}
          </div>
        </div>

        <p className={styles.frameNote}>
          A month of {monthName()} in a Malaky deployment. Public holidays come from
          verified calendar data; the business events are demo company context.
        </p>
      </div>
    </section>
  );
}
