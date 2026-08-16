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

/** Where the primary CTA goes, everywhere it appears. */
export const DEMO_HREF = "/concept-v2/request-demo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  /* The request page has one job. Section links and a CTA pointing at the
     page you are already on would only compete with the form. */
  const simple = usePathname() === DEMO_HREF;

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

        {simple ? (
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
              <Button href={DEMO_HREF} tone="primary" arrow className={styles.cta}>
                Request a private demo
              </Button>
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
        data-open={(!simple && open) || undefined}
        hidden={simple || !open}
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
        <Button href={DEMO_HREF} tone="primary" full arrow>
          Request a private demo
        </Button>
      </div>
    </header>
  );
}
