import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { CustomerLogo } from "../CustomerLogo";
import { EngagementRow, PlatformBar, PostShell, pieceCustomer, postStyles as s } from "./shared";

/**
 * Arabic social. Composed right-to-left with Arabic typography — the copy in
 * the data layer is written natively, not translated from the English piece.
 */
export function ArabicSocialPost({ piece }: { piece: MarketingPiece }) {
  const customer = pieceCustomer(piece);
  return (
    <PostShell dir="rtl">
      <PlatformBar platform="arabic-social" label={piece.label} />
      <div className={s.account}>
        <CustomerLogo customer={customer} size={26} />
        <div className={s.accountText}>
          {/* Not translated: no customer here has supplied an official Arabic
              name, and inventing one would be inventing an identity. */}
          <span className={s.accountName}>{customer.name}</span>
          <span className={`${s.accountMeta} ${s.arabic}`}>{piece.timestamp}</span>
        </div>
      </div>
      {piece.copy.headline && <p className={s.arabicHeadline}>{piece.copy.headline}</p>}
      <p className={s.arabicBody}>{piece.copy.body}</p>
      {piece.media && (
        <BrandMedia {...piece.media} />
      )}
      {/* Neutral. We hold no customer's brand colour, so the call to action
          takes the card's own type colour rather than one we chose for
          somebody else's brand. */}
      {piece.copy.cta && <span className={s.arabicCta}>{piece.copy.cta}</span>}
      <EngagementRow {...piece.engagement} />
    </PostShell>
  );
}
