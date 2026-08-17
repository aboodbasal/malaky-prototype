import styles from "./checkout.module.css";

/*
 * This payment surface is visual only. Engineering will replace/connect this
 * module to the production payment provider.
 *
 * No provider has been chosen and none is named here. The elements below are
 * inert shapes — they are not inputs, they are not focusable, and they accept
 * no keystrokes, so no card detail can be entered, held in state, logged or
 * transmitted by this application. When a provider is contracted, its hosted
 * element mounts in place of `.ghostFields` and the rest of the checkout is
 * unchanged; the order it needs is assembled by lib/concept-v2/adapters/payment.
 */

const GHOST_FIELDS = [
  { label: "Card number", wide: true },
  { label: "Expiry" },
  { label: "Security code" },
  { label: "Name on card" },
];

export function PaymentSurface({ method }: { method: "card" | "invoice" }) {
  if (method === "invoice") {
    return (
      <div className={styles.surface}>
        <div className={styles.surfaceHead}>
          <p className={styles.surfaceTitle}>Invoice</p>
          <p className={styles.surfaceTag}>Placeholder</p>
        </div>
        <div className={styles.invoiceNote}>
          <p>
            An invoice would be raised against the details above and sent to your finance
            contact, with your deployment starting once it is settled.
          </p>
          <p>No invoice is raised in this preview, and nothing is sent.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.surface}>
      <div className={styles.surfaceHead}>
        <p className={styles.surfaceTitle}>Card details</p>
        <p className={styles.surfaceTag}>Placeholder</p>
      </div>

      {/* Shapes, not fields. aria-hidden because a screen reader announcing
          "card number" here would be describing something that does not
          exist; the sentence below is the accessible truth. */}
      <div className={styles.ghostFields} aria-hidden="true">
        {GHOST_FIELDS.map((field) => (
          <div
            key={field.label}
            className={`${styles.ghost} ${field.wide ? styles.ghostWide : ""}`}
          >
            <span className={styles.ghostLabel}>{field.label}</span>
            <span className={styles.ghostBox} />
          </div>
        ))}
      </div>

      <p className={styles.surfaceNote}>
        Card details are never handled by this website. In production this area is replaced by
        the payment provider&rsquo;s own secure fields. This preview accepts no card details and
        takes no payment.
      </p>
    </div>
  );
}
