"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_LIST, type BrandId, getBrand } from "@/lib/concept-v2/brands";
import { INGEST_RESULTS, INGEST_STEPS, getPiece } from "@/lib/concept-v2/content";
import { usePrefersReducedMotion } from "@/hooks/useConceptHooks";
import { BrandMark } from "../BrandMark";
import { PostCard } from "../posts";
import { Button, SectionHead, Stop } from "../ui";
import { CheckIcon } from "../icons";
import styles from "./brandDemo.module.css";

type Phase = "idle" | "learning" | "ready";

/**
 * The conversion moment, simulated.
 *
 * Nothing is fetched — no URL is read and no request leaves the page. Results
 * come from INGEST_RESULTS, so swapping in a real ingestion response later is
 * a data change rather than a rewrite of this component.
 */
export function BrandDemo() {
  const [url, setUrl] = useState("");
  const [brandId, setBrandId] = useState<BrandId>("nura");
  const [phase, setPhase] = useState<Phase>("idle");
  const [checked, setChecked] = useState(0);
  const timers = useRef<number[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const start = (id: BrandId) => {
    clear();
    setBrandId(id);
    setChecked(0);
    setPhase("learning");

    if (reducedMotion) {
      setChecked(INGEST_STEPS.length);
      setPhase("ready");
      return;
    }

    INGEST_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setChecked(i + 1), 600 + i * 520));
    });
    timers.current.push(
      window.setTimeout(() => setPhase("ready"), 600 + INGEST_STEPS.length * 520 + 350),
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // A typed domain maps to a demo brand — the concept never reads the site.
    const typed = url.trim().toLowerCase();
    const matched = BRAND_LIST.find((b) => typed && b.website.startsWith(typed.split(".")[0]));
    start(matched?.id ?? BRAND_LIST[typed.length % BRAND_LIST.length].id);
  };

  const brand = getBrand(brandId);
  const pieces = INGEST_RESULTS[brandId].map(getPiece).filter(Boolean);

  return (
    <section className={styles.section} id="brand-demo" aria-labelledby="demo-title">
      <div className="shell">
        <SectionHead
          id="demo-title"
          title={
            <>
              See Malaky with your brand
              <Stop />
            </>
          }
          lead="Enter your company website and see what Malaky would prepare for you — your logo, your colours, your products, your audience."
        />

        <form className={styles.form} onSubmit={onSubmit}>
          <label className="visually-hidden" htmlFor="company-url">
            Your company website
          </label>
          <input
            id="company-url"
            className={styles.input}
            type="text"
            inputMode="url"
            placeholder="yourcompany.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" tone="primary" size="lg">
            Show me
          </Button>
        </form>

        <div className={styles.brands}>
          <span className={styles.brandsLabel}>Or open a prepared example</span>
          <ul className={styles.brandList}>
            {BRAND_LIST.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  className={styles.brandChip}
                  data-on={phase !== "idle" && b.id === brandId ? true : undefined}
                  onClick={() => start(b.id)}
                >
                  <BrandMark brand={b} size={26} />
                  <span>
                    <span className={styles.brandName}>{b.name}</span>
                    <span className={styles.brandCat}>{b.shortCategory}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {phase !== "idle" && (
          <div className={styles.result}>
            <div className={styles.learning}>
              <div className={styles.learningHead}>
                <BrandMark brand={brand} size={34} />
                <div>
                  <p className={styles.learningTitle}>
                    {phase === "learning" ? "Learning your brand…" : `${brand.name} is set up`}
                  </p>
                  <p className={styles.learningSub}>{brand.website}</p>
                </div>
                <ul className={styles.swatches} aria-label="Colours recognised">
                  {[brand.palette.primary, brand.palette.secondary, brand.palette.accent, brand.palette.paper].map(
                    (c, i) => (
                      <li
                        key={c}
                        style={
                          {
                            background: c,
                            "--i": i,
                            opacity: checked >= 2 ? 1 : 0,
                          } as React.CSSProperties
                        }
                      />
                    ),
                  )}
                </ul>
              </div>

              <ul className={styles.steps} aria-live="polite">
                {INGEST_STEPS.map((step, i) => (
                  <li key={step} className={styles.step} data-on={i < checked || undefined}>
                    <span className={styles.stepMark}>
                      <CheckIcon size={11} />
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.pieces} data-on={phase === "ready" || undefined}>
              {pieces.map((piece, i) =>
                piece ? (
                  <div
                    key={piece.id}
                    className={styles.piece}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <PostCard piece={piece} />
                  </div>
                ) : null,
              )}
            </div>

            <p className={styles.disclosure}>
              Demo data. This concept doesn&rsquo;t read the address you enter — every result here
              comes from the built-in example brands.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
