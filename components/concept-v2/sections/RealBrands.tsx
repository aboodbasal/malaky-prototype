"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_POSTS } from "@/lib/concept-v2/real-posts";
import { useReveal } from "@/hooks/useConceptHooks";
import { RealPostCard } from "../RealPost";
import { SectionHead, Stop } from "../ui";
import { ArrowRight } from "../icons";
import styles from "./realBrands.module.css";

/**
 * Real marketing from real companies, at a size where it can actually be read.
 *
 * Everything else on this page is demo content, so this section is the one
 * place the work is not ours to compose — each item is a published screenshot
 * shown whole, at its own aspect ratio, with no chrome drawn around it. The
 * caption underneath carries the company, channel and industry so the rail
 * reads as range rather than as a logo wall.
 *
 * The rail is a native horizontal scroller: it works with a trackpad, a
 * touch drag, the arrow keys and the buttons, and needs no JavaScript to be
 * usable at all.
 */
export function RealBrands() {
  const railRef = useRef<HTMLUListElement>(null);
  const [ref, reveal] = useReveal<HTMLDivElement>({ threshold: 0.08 });
  const [edge, setEdge] = useState<"start" | "middle" | "end">("start");

  const syncEdge = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    // Left-to-right and right-to-left both report distance travelled; the
    // sign differs, so compare on magnitude.
    const x = Math.abs(rail.scrollLeft);
    setEdge(max <= 1 ? "start" : x < 8 ? "start" : x > max - 8 ? "end" : "middle");
  }, []);

  useEffect(() => {
    syncEdge();
    window.addEventListener("resize", syncEdge);
    return () => window.removeEventListener("resize", syncEdge);
  }, [syncEdge]);

  const nudge = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = rail.firstElementChild?.clientWidth ?? rail.clientWidth * 0.7;
    rail.scrollBy({ left: (step + 24) * direction, behavior: "smooth" });
  };

  return (
    <section
      className={styles.section}
      id="real-brands"
      aria-labelledby="real-brands-title"
    >
      <div className="shell">
        <SectionHead
          id="real-brands-title"
          title={
            <>
              See Malaky across real brands
              <Stop />
            </>
          }
          lead="Different industries. Different channels. One system that adapts to the brand."
        >
          <div className={styles.controls}>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => nudge(-1)}
              disabled={edge === "start"}
              aria-label="Show previous brands"
            >
              <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              type="button"
              className={styles.arrow}
              onClick={() => nudge(1)}
              disabled={edge === "end"}
              aria-label="Show more brands"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </SectionHead>
      </div>

      <div className={styles.railWrap} ref={ref} data-reveal={reveal} data-edge={edge}>
        <ul
          className={styles.rail}
          ref={railRef}
          onScroll={syncEdge}
          tabIndex={0}
          role="group"
          aria-label="Marketing published by real companies"
        >
          {GALLERY_POSTS.map((post, i) => (
            <li
              key={post.id}
              className={styles.item}
              /* The column is sized from the screenshot's own ratio, so every
                 card lands on one shared height without anything being
                 scaled non-uniformly. */
              style={
                {
                  "--i": i,
                  "--ratio": post.width / post.height,
                } as React.CSSProperties
              }
            >
              <RealPostCard
                post={post}
                sizes="(max-width: 700px) 78vw, (max-width: 1100px) 46vw, 360px"
              />
              <div className={styles.meta}>
                <p className={styles.company}>{post.company}</p>
                <p className={styles.channel}>
                  {post.platform}
                  <span aria-hidden="true"> · </span>
                  {post.industry}
                </p>
                <p className={styles.summary}>{post.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="shell">
        <p className={styles.note}>
          Published marketing from Alpha Pro MENA, Inception DAP, Baker Tilly Saudi Arabia,
          Shrimp Joint and Ataccama.
        </p>
      </div>
    </section>
  );
}
