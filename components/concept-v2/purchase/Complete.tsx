"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { COMPLETE_NEXT, COMPLETE_TITLE } from "@/lib/concept-v2/onboarding-steps";
import { MANAGED, formatUsd, priceOrder } from "@/lib/concept-v2/commerce";
import { readFlow, readSelection, type FlowRecord } from "@/lib/concept-v2/flow-state";
import { track } from "@/lib/concept-v2/analytics";
import { Button, Stop } from "../ui";
import { CheckIcon } from "../icons";
import { DemoNotice } from "./FlowChrome";
import styles from "./complete.module.css";

/**
 * The end of the journey.
 *
 * Every sentence here is in the future or the conditional. Setup is
 * *underway*, the walkthrough *will be confirmed*, the first calendar *will
 * be prepared* — because none of it has happened. There is no dashboard to
 * send anyone to, so the only action is back to the site, and no receipt is
 * shown because no payment was taken.
 *
 * The company name and chosen window come from the tab's own record if it is
 * there; the screen reads correctly when it is not, which is the case for
 * anyone who opens this URL directly.
 */
export function Complete() {
  const params = useSearchParams();
  const selection = readSelection(params);
  const order = priceOrder(selection);

  /* sessionStorage is read after mount so the server-rendered markup and the
     first client render agree. */
  const [record, setRecord] = useState<FlowRecord | null>(null);
  useEffect(() => {
    setRecord(readFlow());
    track("onboarding_complete_view", { plan: selection.planId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const company = record?.company;

  return (
    <section className={`shell ${styles.wrap}`} aria-labelledby="complete-title">
      <div className={styles.head}>
        <span className={styles.mark} aria-hidden="true">
          <CheckIcon size={22} />
        </span>
        <h1 className={styles.title} id="complete-title">
          {COMPLETE_TITLE}
          <Stop />
        </h1>
        <p className={styles.lead}>
          {company
            ? `Malaky now has what it needs to start learning ${company}. Intelligence Setup begins from here.`
            : "Malaky now has what it needs to start learning your business. Intelligence Setup begins from here."}
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Deployment</p>
          <p className={styles.cardTitle}>{order.plan.name}</p>
          <dl className={styles.cardRows}>
            <div className={styles.cardRow}>
              <dt>Billing</dt>
              <dd>{order.term === "annual" ? "Annual, prepaid" : "Monthly"}</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>{MANAGED.name}</dt>
              <dd>{order.managed ? "Included" : "Not added"}</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>{order.plan.setup.label}</dt>
              <dd>{order.plan.setup.includedLabel}</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>Total</dt>
              <dd>
                {formatUsd(order.total)} {order.cadence}
              </dd>
            </div>
          </dl>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Intelligence Setup</p>
          <p className={styles.cardTitle}>Your business, in Malaky</p>
          <dl className={styles.cardRows}>
            <div className={styles.cardRow}>
              <dt>Business & brand</dt>
              <dd>Given</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>Voices</dt>
              <dd>Given</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>Markets & channels</dt>
              <dd>Given</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>Calendar & approvals</dt>
              <dd>Given</dd>
            </div>
          </dl>
        </div>

        <div className={styles.card}>
          <p className={styles.cardLabel}>Walkthrough</p>
          <p className={styles.cardTitle}>To be confirmed</p>
          <dl className={styles.cardRows}>
            <div className={styles.cardRow}>
              <dt>You asked for</dt>
              <dd>{record?.walkthroughWindow ?? "A time that suits you"}</dd>
            </div>
            <div className={styles.cardRow}>
              <dt>Confirmation</dt>
              <dd>By email</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className={styles.next}>
        {COMPLETE_NEXT.map((item, i) => (
          <div key={item.title} className={styles.nextItem}>
            <span className={styles.nextNum}>{String(i + 1).padStart(2, "0")}</span>
            <p className={styles.nextTitle}>{item.title}</p>
            <p className={styles.nextBody}>{item.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.close}>
        <div className={styles.noticeWrap}>
          <DemoNotice text="Concept preview. No payment was taken, no account was created, no files were stored, no channel was connected and no meeting was booked." />
        </div>
        <Button href="/concept-v2" tone="primary" size="lg" arrow>
          Back to Malaky
        </Button>
      </div>
    </section>
  );
}
