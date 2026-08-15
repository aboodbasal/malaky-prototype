import { Button, Stop } from "../ui";
import styles from "./closingCta.module.css";

export function ClosingCta({
  id = "request-access",
  title,
  lead,
  cta,
  href = "#request-access",
}: {
  id?: string;
  title: string;
  lead: string;
  cta: string;
  href?: string;
}) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-title`}>
      <div className={`shell ${styles.inner}`}>
        <span className={styles.glow} aria-hidden="true" />
        <h2 className={styles.title} id={`${id}-title`}>
          {title}
          <Stop />
        </h2>
        <p className={styles.lead}>{lead}</p>
        <Button href={href} tone="primary" size="lg" arrow>
          {cta}
        </Button>
      </div>
    </section>
  );
}
