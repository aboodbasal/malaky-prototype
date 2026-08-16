"use client";

import { EVENT_FANOUT, SOURCE_EVENT, type DrawnPlatform } from "@/lib/concept-v2/content";
import { getBrand } from "@/lib/concept-v2/brands";
import { useReveal } from "@/hooks/useConceptHooks";
import { BrandMark } from "../BrandMark";
import { PostCard } from "../posts";
import { SectionHead, Stop } from "../ui";
import {
  ArabicIcon,
  CalendarIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  ReelIcon,
} from "../icons";
import styles from "./oneEvent.module.css";

/* Every fan-out output is a piece this concept draws itself, so the map is
   over DrawnPlatform — a real screenshot has no channel icon to add. */
const CHANNEL_ICON: Record<DrawnPlatform, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  "linkedin-company": LinkedInIcon,
  "linkedin-executive": LinkedInIcon,
  "arabic-social": ArabicIcon,
  newsletter: MailIcon,
  reel: ReelIcon,
} as const;

/**
 * One business event, adapted six ways. Each output is written for its own
 * channel in the data layer — the point of the section is that the copy is
 * genuinely different, so the cards are sized to be read.
 */
export function OneEvent() {
  const brand = getBrand(SOURCE_EVENT.brandId);
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="one-event-title">
      <div className="shell">
        <SectionHead
          id="one-event-title"
          title={
            <>
              One event becomes everything
              <Stop />
            </>
          }
          lead="Malaky turns one business moment into the right message for every channel — not the same sentence reformatted four times."
        >
          <article className={styles.event}>
            <div className={styles.eventTop}>
              <BrandMark brand={brand} size={26} />
              <div>
                <span className={styles.eventBrand}>{brand.name}</span>
                <span className={styles.eventKind}>
                  <CalendarIcon size={11} /> {SOURCE_EVENT.kind}
                </span>
              </div>
            </div>
            <h3 className={styles.eventTitle}>{SOURCE_EVENT.title}</h3>
            <p className={styles.eventDetail}>{SOURCE_EVENT.detail}</p>
          </article>
        </SectionHead>

        <div className={styles.fan} ref={ref} data-reveal={reveal}>
          <span className={styles.stem} aria-hidden="true" />

          <ol className={styles.grid}>
            {EVENT_FANOUT.map((piece, i) => {
              const Icon = CHANNEL_ICON[piece.platform];
              return (
                <li
                  key={piece.id}
                  className={styles.col}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className={styles.tick} aria-hidden="true" />
                  <p className={styles.channel}>
                    <Icon size={13} />
                    {piece.label}
                  </p>
                  <PostCard piece={piece} />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
