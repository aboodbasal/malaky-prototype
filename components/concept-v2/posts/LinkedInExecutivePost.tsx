import { EXECUTIVES } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { Portrait } from "../BrandMark";
import { EngagementRow, PlatformBar, PostShell, pieceBrand, postStyles as s } from "./shared";

export function LinkedInExecutivePost({ piece }: { piece: MarketingPiece }) {
  const exec = piece.executive ?? EXECUTIVES[piece.executiveKey ?? "ahmed"];
  const brand = pieceBrand(piece, exec.brandId);
  return (
    <PostShell>
      <PlatformBar platform="linkedin-executive" label={piece.label} />
      <div className={s.account}>
        <Portrait
          brand={brand}
          initials={exec.initials}
          size={32}
          src={exec.portrait?.src}
          alt={exec.portrait?.alt ?? exec.name}
        />
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
        <BrandMedia {...piece.media} />
      )}
      <EngagementRow {...piece.engagement} style="linkedin" />
    </PostShell>
  );
}
