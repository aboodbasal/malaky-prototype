import type { ReactNode } from "react";
import Link from "next/link";
import { MANAGED, formatUsd, priceOrder, type OrderSelection } from "@/lib/concept-v2/commerce";
import { withSelection } from "@/lib/concept-v2/flow-state";
import styles from "./summary.module.css";

/**
 * What the customer is agreeing to, itemised.
 *
 * Every figure comes from `priceOrder`, which derives all of them from the
 * pricing page's own numbers and rounds the discount before subtracting it —
 * so subtotal, saving and total always reconcile on screen. Nothing is
 * computed here.
 *
 * Deliberately not a shopping cart: no quantities, no remove buttons, no
 * running badge. A Malaky deployment is one decision with one option attached
 * to it, and the summary is a statement of that decision.
 */
export function OrderSummary({
  selection,
  children,
  editHref,
}: {
  selection: OrderSelection;
  /** The CTA, when this summary is the one being acted on. */
  children?: ReactNode;
  /** Shown on checkout so the choice can be changed without going back blind. */
  editHref?: string;
}) {
  const order = priceOrder(selection);
  const annual = order.term === "annual";

  return (
    <div className={styles.summary}>
      <div className={styles.head}>
        <h2 className={styles.title}>Your deployment</h2>
        <span className={styles.termTag}>{annual ? "Annual" : "Monthly"}</span>
      </div>

      <ul className={styles.lines}>
        {order.lines.map((line) => (
          <li key={line.label} className={styles.line}>
            <span className={styles.lineLabel}>
              {line.label}
              {line.detail && <span className={styles.lineDetail}>{line.detail}</span>}
            </span>
            {line.amount != null ? (
              <span className={styles.lineAmount}>{formatUsd(line.amount)}</span>
            ) : (
              <span className={styles.lineIncluded}>{line.amountLabel}</span>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.totals}>
        {annual && (
          <>
            <p className={styles.row}>
              <span>Subtotal</span>
              <span className={styles.rowAmount}>{formatUsd(order.subtotal)}</span>
            </p>
            <p className={`${styles.row} ${styles.discount}`}>
              <span>Annual prepayment saving</span>
              <span className={styles.rowAmount}>−{formatUsd(order.discount)}</span>
            </p>
          </>
        )}

        <p className={styles.total}>
          <span className={styles.totalLabel}>Due today</span>
          <span className={styles.totalAmount}>
            {formatUsd(order.total)}
            <span className={styles.cadence}>{order.cadence}</span>
          </span>
        </p>
      </div>

      <div className={styles.notes}>
        <p>
          {annual
            ? "Prepaid for twelve months of operation."
            : "Billed for one month of operation."}
        </p>
        {order.managed && <p>{MANAGED.clarification}</p>}
        <p>Prices are in US dollars. Any tax applicable in your market is handled separately.</p>
      </div>

      {children && <div className={styles.cta}>{children}</div>}

      {editHref && (
        <p className={styles.edit}>
          <Link href={withSelection(editHref, selection)} className={styles.editLink}>
            Change plan or term
          </Link>
        </p>
      )}
    </div>
  );
}
