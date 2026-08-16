import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { EngagementRow, PlatformBar, PostShell, pieceBrand, postStyles as s } from "./shared";

export function LinkedInCompanyPost({ piece }: { piece: MarketingPiece }) {
  const brand = pieceBrand(piece);
  return (
    <PostShell>
      <PlatformBar platform="linkedin-company" label={piece.label} />
      <div className={s.account}>
        <BrandMark brand={brand} size={30} />
        <div className={s.accountText}>
          <span className={s.accountName}>{brand.name}</span>
          <span className={s.accountMeta}>
            {brand.shortCategory}
            {piece.timestamp ? ` · ${piece.timestamp}` : ""}
          </span>
        </div>
      </div>
      <p className={s.body}>{piece.copy.body}</p>
      {piece.media && (
        <BrandMedia {...piece.media} />
      )}
      <EngagementRow {...piece.engagement} style="linkedin" />
    </PostShell>
  );
}
