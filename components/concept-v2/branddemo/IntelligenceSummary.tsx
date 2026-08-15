"use client";

import type { BrandAnalysis } from "@/lib/concept-v2/analysis";
import { BrandMark } from "../BrandMark";
import { SparkIcon } from "../icons";
import styles from "./brandDemo.module.css";

/**
 * What Malaky learned, shown before any output. This is the causal step —
 * business understood, then opportunity, then the marketing that follows.
 * Every value comes from the analysis result; nothing here is hardcoded.
 */
export function IntelligenceSummary({ analysis }: { analysis: BrandAnalysis }) {
  const { company, industry, location, audiences, markets, tone, products, palette, opportunities } =
    analysis;
  const opportunity = opportunities[0];

  const rows: { label: string; value: string }[] = [
    { label: "Audience", value: audiences.join(" · ") },
    { label: "Markets", value: markets.join(" · ") },
    { label: "Brand voice", value: tone.join(" · ") },
    { label: "Products / services", value: products.join(" · ") },
  ];

  return (
    <div className={styles.summary}>
      <div className={styles.company}>
        <BrandMark brand={company.logo} size={40} />
        <div>
          <p className={styles.companyName}>{company.name}</p>
          <p className={styles.companyMeta}>
            {industry} · {location}
          </p>
        </div>
      </div>

      <dl className={styles.learned}>
        {rows.map((row) => (
          <div key={row.label} className={styles.learnedRow}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        <div className={styles.learnedRow}>
          <dt>Brand colors</dt>
          <dd>
            <span className={styles.swatches}>
              {palette.map((c) => (
                <span key={c} style={{ background: c }} title={c} />
              ))}
            </span>
          </dd>
        </div>
      </dl>

      {opportunity && (
        <div className={styles.opportunity}>
          <p className={styles.opportunityLabel}>
            <SparkIcon size={13} />
            Opportunity detected
          </p>
          <p className={styles.opportunityTitle}>{opportunity.title}</p>
          <p className={styles.opportunityDetail}>{opportunity.detail}</p>
        </div>
      )}
    </div>
  );
}
