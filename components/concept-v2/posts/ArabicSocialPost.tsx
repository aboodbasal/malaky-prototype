import { getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { EngagementRow, PlatformBar, PostShell, postStyles as s } from "./shared";

/**
 * Arabic social. Composed right-to-left with Arabic typography — the copy in
 * the data layer is written natively, not translated from the English piece.
 */
export function ArabicSocialPost({ piece }: { piece: MarketingPiece }) {
  const brand = piece.brand ?? getBrand(piece.brandId);
  return (
    <PostShell dir="rtl">
      <PlatformBar platform="arabic-social" label={piece.label} />
      <div className={s.account}>
        <BrandMark brand={brand} size={26} />
        <div className={s.accountText}>
          <span className={`${s.accountName} ${s.arabic}`}>
            {brand.nameAr ?? brand.name}
          </span>
          <span className={`${s.accountMeta} ${s.arabic}`}>{piece.timestamp}</span>
        </div>
      </div>
      {piece.copy.headline && <p className={s.arabicHeadline}>{piece.copy.headline}</p>}
      <p className={s.arabicBody}>{piece.copy.body}</p>
      {piece.media && (
        <BrandMedia {...piece.media} />
      )}
      {piece.copy.cta && (
        <span className={s.arabicCta} style={{ color: brand.palette.accent }}>
          {piece.copy.cta}
        </span>
      )}
      <EngagementRow {...piece.engagement} />
    </PostShell>
  );
}
