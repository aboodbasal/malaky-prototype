"use client";

import Link from "next/link";
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

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          <Button href="/concept-v2#request-demo" tone="primary" arrow className={styles.cta}>
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
      </div>

      <div className={styles.panel} id="mobile-nav" data-open={open || undefined} hidden={!open}>
        <ul>
          {NAV.map((item) => (
            <li key={item.label}>
              <Link href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button href="/concept-v2#request-demo" tone="primary" full arrow>
          Request a private demo
        </Button>
      </div>
    </header>
  );
}
