import Link from "next/link";
import { Wordmark } from "./BrandMark";
import styles from "./Footer.module.css";

/**
 * Deliberately minimal — only links that correspond to something real in the
 * concept. No careers, press, status or certification claims.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/concept-v2#product" },
      { label: "How it works", href: "/concept-v2#how-it-works" },
      { label: "Arabic", href: "/concept-v2#arabic" },
      { label: "Pricing", href: "/concept-v2/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/concept-v2#about" },
      { label: "Contact", href: "/concept-v2#request-access" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/concept-v2#privacy" },
      { label: "Terms", href: "/concept-v2#terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.brand}>
          <Wordmark size={30} />
          <p className={styles.tagline}>
            A proactive marketing operating system.
            <br />
            Arabic and English, natively.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} className={styles.col} aria-label={col.title}>
            <h2 className={styles.colTitle}>{col.title}</h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={`shell ${styles.base}`}>
        <p>© 2026 Malaky</p>
        <p className={styles.baseEnd}>
          <span>Made in Saudi Arabia</span>
          <span className={styles.ar} lang="ar" dir="rtl">
            العربية
          </span>
        </p>
      </div>
    </footer>
  );
}
