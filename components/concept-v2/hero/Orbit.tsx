"use client";

import { useEffect, useRef } from "react";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { PostCard } from "../posts";
import { usePrefersReducedMotion, useIsVisible } from "@/hooks/useConceptHooks";
import styles from "./orbit.module.css";

/**
 * Six finished marketing pieces on one shared orbit.
 *
 * Everything is driven by a single requestAnimationFrame loop writing
 * transforms straight to the DOM — no per-frame React state, no layout reads.
 * Each card sits on the same tilted ellipse around one invisible centre, so
 * they genuinely pass in front of and behind each other rather than floating
 * independently.
 */

/** One full revolution, in milliseconds. */
const REVOLUTION_MS = 29_000;
/** Orbit speed while a card is hovered, as a fraction of normal. */
const HOVER_SPEED = 0.16;
/** How quickly the speed eases between normal and slowed. */
const SPEED_EASE = 0.055;

/** Horizontal radius of the ellipse, in px, at stage scale 1. */
const RADIUS_X = 244;
/** Depth radius — how far cards travel toward and away from the viewer. */
const RADIUS_Z = 232;
/** Vertical rise and fall that gives the ring its tilt. */
const TILT_Y = 60;

const SCALE_MIN = 0.78;
const SCALE_MAX = 1.02;
const OPACITY_MIN = 0.44;
const OPACITY_MAX = 1;

/**
 * Composition of the orbit, keyed by piece id rather than array index.
 *
 * Four primary outputs carry the hero. The remaining two ride a tighter,
 * dimmer inner path so the cross-channel story stays legible instead of all
 * six competing at once — same shared centre, same revolution.
 */
const BACKGROUND_RADIUS = 0.7;
const BACKGROUND_SCALE = 0.82;
const BACKGROUND_OPACITY = 0.5;

interface OrbitSlot {
  /** Position on the ring, in turns (0–1). */
  phase: number;
  width: number;
  y: number;
  roll: number;
  background?: boolean;
}

const LAYOUT: Record<string, OrbitSlot> = {
  "hero-instagram": { phase: 0, width: 186, y: -16, roll: -1.2 },
  "hero-linkedin-executive": { phase: 0.25, width: 202, y: 34, roll: 1.4 },
  "hero-arabic-social": { phase: 0.5, width: 178, y: -44, roll: -1 },
  "hero-newsletter": { phase: 0.75, width: 196, y: 20, roll: 0.6 },
  "hero-linkedin-company": { phase: 0.125, width: 150, y: -30, roll: 0.8, background: true },
  "hero-reel": { phase: 0.625, width: 118, y: 28, roll: -1.6, background: true },
};

const FALLBACK_SLOT: OrbitSlot = { phase: 0, width: 180, y: 0, roll: 0 };

interface CardState extends OrbitSlot {
  outer: HTMLDivElement;
  radiusScale: number;
  scaleMul: number;
  opacityMul: number;
}

export function Orbit({
  pieces,
  active = true,
}: {
  pieces: MarketingPiece[];
  active?: boolean;
}) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stageRef, isVisible] = useIsVisible<HTMLDivElement>();
  const hoverCount = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const cards: CardState[] = [];
    cardRefs.current.forEach((outer, i) => {
      if (!outer) return;
      const slot = LAYOUT[pieces[i]?.id ?? ""] ?? FALLBACK_SLOT;
      cards.push({
        ...slot,
        outer,
        phase: slot.phase * Math.PI * 2,
        radiusScale: slot.background ? BACKGROUND_RADIUS : 1,
        scaleMul: slot.background ? BACKGROUND_SCALE : 1,
        opacityMul: slot.background ? BACKGROUND_OPACITY : 1,
      });
    });
    if (!cards.length) return;

    const place = (theta: number) => {
      for (const c of cards) {
        const a = theta + c.phase;
        const sin = Math.sin(a);
        const cos = Math.cos(a);

        const x = RADIUS_X * c.radiusScale * sin;
        const z = RADIUS_Z * c.radiusScale * cos;
        const y = c.y + TILT_Y * c.radiusScale * cos;

        // 0 at the far side, 1 nearest the viewer.
        const depth = (cos + 1) / 2;
        const scale = (SCALE_MIN + (SCALE_MAX - SCALE_MIN) * depth) * c.scaleMul;
        const opacity =
          (OPACITY_MIN + (OPACITY_MAX - OPACITY_MIN) * depth) * c.opacityMul;

        // Cards stay mostly square to the viewer — just enough yaw to read
        // as dimensional.
        const rotY = -sin * 11;
        const rotX = cos * 3.5;

        c.outer.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) ` +
          `rotateZ(${c.roll}deg) scale(${scale.toFixed(3)}) translate(-50%, -50%)`;
        c.outer.style.opacity = opacity.toFixed(3);
        c.outer.style.zIndex = String(
          Math.round(depth * 1000) - (c.background ? 1200 : 0),
        );
      }
    };

    if (reducedMotion || !active) {
      // A composed, readable still — no motion at all.
      place(-0.55);
      return;
    }

    let raf = 0;
    let last = performance.now();
    let theta = -0.55;
    let speed = 1;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Clamp so a backgrounded tab doesn't jump the orbit on return.
      const dt = Math.min(now - last, 64);
      last = now;

      if (!isVisible.current || document.hidden) return;

      const target = hoverCount.current > 0 ? HOVER_SPEED : 1;
      speed += (target - speed) * SPEED_EASE;

      theta += (dt / REVOLUTION_MS) * Math.PI * 2 * speed;
      place(theta);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pieces, reducedMotion, active, isVisible]);

  const onEnter = () => {
    hoverCount.current += 1;
  };
  const onLeave = () => {
    hoverCount.current = Math.max(0, hoverCount.current - 1);
  };

  return (
    <div className={styles.viewport}>
      <div className={styles.stage} ref={stageRef}>
        {/* Orbit trails — they share the cards' 3D space, so cards pass
            in front of and behind them. */}
        <span className={`${styles.ring} ${styles.ringOuter}`} aria-hidden="true" />
        <span className={`${styles.ring} ${styles.ringInner}`} aria-hidden="true" />
        <span className={styles.core} aria-hidden="true" />

        <div
          className={styles.cards}
          role="group"
          aria-label="Marketing Malaky prepared across six channels"
        >
          {pieces.map((piece, i) => (
            <div
              key={piece.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={styles.card}
              data-background={LAYOUT[piece.id]?.background || undefined}
              style={{ width: (LAYOUT[piece.id] ?? FALLBACK_SLOT).width }}
              onPointerEnter={onEnter}
              onPointerLeave={onLeave}
            >
              <div className={styles.cardInner}>
                <PostCard piece={piece} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className={styles.plinth} aria-hidden="true" />
    </div>
  );
}
