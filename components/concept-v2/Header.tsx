"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MalakyLogo } from "./MalakyLogo";
import { Button } from "./ui";
import styles from "./Header.module.css";

/**
 * Every entry resolves to something that exists.
 *
 * "About" pointed at a section that was never built, and "Why Malaky" pointed
 * at the approval section, which is about control rather than why. Both are
 * gone. "Real brands" replaces them because the proof is worth reaching
 * directly and the anchor is accurate.
 */
const NAV = [
  { label: "Product", href: "/concept-v2#product" },
  { label: "How it works", href: "/concept-v2#how-it-works" },
  { label: "Real brands", href: "/concept-v2#real-brands" },
  { label: "Arabic", href: "/concept-v2#arabic" },
  { label: "Pricing", href: "/concept-v2/pricing" },
];

/** Where the sales-led route goes, everywhere it appears. */
export const DEMO_HREF = "/concept-v2/request-demo";

/** Where the self-serve route starts, everywhere it appears. */
export const START_HREF = "/concept-v2/get-started";

/**
 * Screens with one job. The header collapses to a logo and a way out: a
 * customer who is filling in Intelligence Setup should not be offered five
 * section anchors and two competing calls to action.
 */
const FOCUSED = [DEMO_HREF, "/concept-v2/checkout", "/concept-v2/onboarding"];

/**
 * Two routes to becoming a customer, so the header states which one is the
 * default.
 *
 * The hierarchy is: navigation, then the quiet sales-led route as a text link,
 * then one filled orange button. Two buttons side by side would make the
 * visitor choose between them before they have chosen anything else, and the
 * orange fill is the site's single signal for "this is the action". The demo
 * route keeps the name it has everywhere else on the site — it is typography
 * here, not a button.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const focused = FOCUSED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  /* The CTA never points at the page it is on. */
  const onStart = pathname === START_HREF;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={`shell ${styles.bar}`}>
        <Link href="/concept-v2" className={styles.logo} aria-label="Malaky — home">
          <MalakyLogo size="nav" />
        </Link>

        {focused ? (
          <Link href="/concept-v2" className={styles.back}>
            Back to Malaky
          </Link>
        ) : (
          <>
            <nav className={styles.nav} aria-label="Primary">
              <ul className={styles.navList}>
                {NAV.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={styles.navLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.actions}>
              {/* The site has one name for this action and keeps it, even
                  though a shorter label would fit more easily beside the
                  button. Two names for one route is how CTA vocabulary drifts. */}
              <Link href={DEMO_HREF} className={styles.demoLink}>
                Request a private demo
              </Link>
              {!onStart && (
                <Button href={START_HREF} tone="primary" arrow className={styles.cta}>
                  Get started
                </Button>
              )}
              <button
                type="button"
                className={styles.burger}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span data-open={open || undefined} />
              </button>
            </div>
          </>
        )}
      </div>

      <div
        className={styles.panel}
        id="mobile-nav"
        data-open={(!focused && open) || undefined}
        hidden={focused || !open}
      >
        <ul>
          {NAV.map((item) => (
            <li key={item.label}>
              <Link href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.panelActions}>
          <Button href={START_HREF} tone="primary" full arrow>
            Get started
          </Button>
          <Button href={DEMO_HREF} tone="secondary" full>
            Request a private demo
          </Button>
        </div>
      </div>
    </header>
  );
}
