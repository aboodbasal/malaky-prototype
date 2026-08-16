import type { ReactNode } from "react";
import { getBrand, type Brand, type BrandId } from "@/lib/concept-v2/brands";
import type { DrawnPlatform, MarketingPiece } from "@/lib/concept-v2/content";
import {
  ArabicIcon,
  CommentIcon,
  HeartIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PlayIcon,
  ReelIcon,
  RepostIcon,
  MoreIcon,
} from "../icons";
import styles from "./posts.module.css";

export { styles as postStyles };

export function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

/**
 * The brand a post component draws.
 *
 * An explicit `brand` wins, so a generated (non-catalogue) company renders
 * through the same components. Every piece that reaches a post component has
 * one or the other — real screenshots carry their own branding inside the
 * image and never get here.
 */
export function pieceBrand(piece: MarketingPiece, brandId?: BrandId): Brand {
  const id = brandId ?? piece.brandId;
  const brand = piece.brand ?? (id ? getBrand(id) : undefined);
  if (!brand) {
    throw new Error(`Marketing piece "${piece.id}" has no brand to draw.`);
  }
  return brand;
}

const PLATFORM_META: Record<
  DrawnPlatform,
  { label: string; icon: ReactNode; tone: string }
> = {
  instagram: { label: "Instagram", icon: <InstagramIcon size={13} />, tone: "#e1568f" },
  "linkedin-company": { label: "LinkedIn Company", icon: <LinkedInIcon size={13} />, tone: "#4a9bd6" },
  "linkedin-executive": { label: "LinkedIn · Executive", icon: <LinkedInIcon size={13} />, tone: "#4a9bd6" },
  "arabic-social": { label: "Arabic Social", icon: <ArabicIcon size={13} />, tone: "#e0a866" },
  newsletter: { label: "Newsletter", icon: <MailIcon size={13} />, tone: "#7fbf9e" },
  reel: { label: "Reel / Video", icon: <ReelIcon size={13} />, tone: "#c08cd6" },
};

/** The thin platform bar every prepared piece carries. */
export function PlatformBar({
  platform,
  label,
  tone,
  onLight,
}: {
  platform: DrawnPlatform;
  label?: string;
  tone?: string;
  onLight?: boolean;
}) {
  const meta = PLATFORM_META[platform];
  return (
    <div className={[styles.platformBar, onLight ? styles.platformBarLight : ""].join(" ")}>
      <span className={styles.platformIcon} style={{ color: tone ?? meta.tone }}>
        {meta.icon}
      </span>
      <span className={styles.platformLabel}>{label ?? meta.label}</span>
      <MoreIcon size={14} className={styles.more} />
    </div>
  );
}

export function PostShell({
  children,
  variant = "dark",
  className,
  dir,
}: {
  children: ReactNode;
  variant?: "dark" | "paper";
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <article
      dir={dir}
      className={[
        styles.shell,
        variant === "paper" ? styles.shellPaper : styles.shellDark,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}

export function EngagementRow({
  likes,
  comments,
  reposts,
  views,
  style: rowStyle = "social",
}: {
  likes?: number;
  comments?: number;
  reposts?: number;
  views?: string;
  style?: "social" | "linkedin";
}) {
  if (rowStyle === "linkedin") {
    return (
      <div className={styles.engagementLinkedIn}>
        <span className={styles.reactionDots} aria-hidden="true">
          <i style={{ background: "#4a9bd6" }} />
          <i style={{ background: "#d64a4a" }} />
          <i style={{ background: "#4fb286" }} />
        </span>
        {likes != null && <span>{formatCount(likes)}</span>}
        <span className={styles.engSpacer} />
        {comments != null && <span>{comments} comments</span>}
        {reposts != null && <span>{reposts} reposts</span>}
      </div>
    );
  }

  return (
    <div className={styles.engagement}>
      {likes != null && (
        <span className={styles.engItem}>
          <HeartIcon size={14} /> {formatCount(likes)}
        </span>
      )}
      {comments != null && (
        <span className={styles.engItem}>
          <CommentIcon size={14} /> {comments}
        </span>
      )}
      {reposts != null && (
        <span className={styles.engItem}>
          <RepostIcon size={14} /> {reposts}
        </span>
      )}
      {views != null && (
        <span className={styles.engItem}>
          <PlayIcon size={12} /> {views}
        </span>
      )}
    </div>
  );
}
