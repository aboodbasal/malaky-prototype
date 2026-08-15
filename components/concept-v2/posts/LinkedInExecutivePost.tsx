import { EXECUTIVES, getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { Portrait } from "../BrandMark";
import { EngagementRow, PlatformBar, PostShell, postStyles as s } from "./shared";

export function LinkedInExecutivePost({ piece }: { piece: MarketingPiece }) {
  const exec = EXECUTIVES[piece.executiveKey ?? "ahmed"];
  const brand = getBrand(exec.brandId);
  return (
    <PostShell>
      <PlatformBar platform="linkedin-executive" label={piece.label} />
      <div className={s.account}>
        <Portrait brand={brand} initials={exec.initials} size={32} />
        <div className={s.accountText}>
          <span className={s.accountName}>{exec.name}</span>
          <span className={s.accountMeta}>
            {exec.role}
            {piece.timestamp ? ` · ${piece.timestamp}` : ""}
          </span>
        </div>
      </div>
      <p className={`${s.body} ${s.bodyStrong}`}>{piece.copy.body}</p>
      {piece.media && (
        <BrandMedia
          scene={piece.media.scene}
          alt={piece.media.alt}
          aspect={piece.media.aspect}
        />
      )}
      <EngagementRow {...piece.engagement} style="linkedin" />
    </PostShell>
  );
}
