import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { CustomerLogo } from "../CustomerLogo";
import { EngagementRow, PlatformBar, PostShell, pieceCustomer, postStyles as s } from "./shared";

export function LinkedInCompanyPost({ piece }: { piece: MarketingPiece }) {
  const customer = pieceCustomer(piece);
  return (
    <PostShell>
      <PlatformBar platform="linkedin-company" label={piece.label} />
      <div className={s.account}>
        <CustomerLogo customer={customer} size={30} />
        <div className={s.accountText}>
          <span className={s.accountName}>{customer.name}</span>
          <span className={s.accountMeta}>
            {customer.shortCategory}
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
