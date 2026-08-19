import Link from "next/link";
import { LOGIN_HREF } from "@/lib/site";
import { MalakyLogo } from "./MalakyLogo";
import styles from "./Footer.module.css";

/**
 * Deliberately minimal — only links that correspond to something real in the
 * concept. No careers, press, status or certification claims.
 *
 * About, Privacy and Terms used to sit here pointing at anchors that did not
 * exist. A link to a page we have not built is worse than no link, so they
 * were removed rather than stubbed. Privacy and Terms are back because both
 * pages now exist; Cookie Policy, DPA and Security stay out until they do.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/concept-v2#product" },
      { label: "How it works", href: "/concept-v2#how-it-works" },
      { label: "Real brands", href: "/concept-v2#real-brands" },
      { label: "Arabic", href: "/concept-v2#arabic" },
      { label: "Pricing", href: "/concept-v2/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/concept-v2/request-demo" },
      /* Existing customers, in the group that already holds the ways to
         reach us — not a column of its own for one link. */
      { label: "Client login", href: LOGIN_HREF },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/concept-v2/privacy" },
      { label: "Terms", href: "/concept-v2/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.grid}`}>
        <div className={styles.brand}>
          <MalakyLogo size="footer" />
          {/* A hand's width of gold under the wordmark, so the logo reads as
              part of the page rather than the only gold on it. */}
          <span className={styles.brandRule} aria-hidden="true" />
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
          <span>Built for businesses across the region</span>
          <span className={styles.ar} lang="ar" dir="rtl">
            العربية
          </span>
        </p>
      </div>
    </footer>
  );
}
