"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./BrandMark";
import { Button } from "./ui";
import styles from "./Header.module.css";

const NAV = [
  { label: "Product", href: "/concept-v2#product" },
  { label: "How it works", href: "/concept-v2#how-it-works" },
  { label: "Why Malaky", href: "/concept-v2#why-malaky" },
  { label: "Arabic", href: "/concept-v2#arabic" },
  { label: "Pricing", href: "/concept-v2/pricing" },
  { label: "About", href: "/concept-v2#about" },
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
          <Wordmark size={26} />
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
          <Button href="/concept-v2#request-access" tone="primary" arrow className={styles.cta}>
            Request access
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
        <Button href="/concept-v2#request-access" tone="primary" full arrow>
          Request access
        </Button>
      </div>
    </header>
  );
}
