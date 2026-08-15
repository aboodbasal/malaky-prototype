import { getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "../icons";
import { PlatformBar, PostShell, formatCount, postStyles as s } from "./shared";

export function InstagramPost({ piece }: { piece: MarketingPiece }) {
  const brand = getBrand(piece.brandId);
  return (
    <PostShell>
      <PlatformBar platform="instagram" label={piece.label} />
      <div className={s.account}>
        <BrandMark brand={brand} size={26} />
        <div className={s.accountText}>
          <span className={s.accountName}>{brand.name}</span>
          <span className={s.accountMeta}>@{brand.handle}</span>
        </div>
      </div>
      {piece.media && (
        <BrandMedia
          scene={piece.media.scene}
          alt={piece.media.alt}
          aspect={piece.media.aspect}
          overline={piece.media.overline}
        />
      )}
      <div className={s.igActions}>
        <HeartIcon size={16} />
        <CommentIcon size={16} />
        <ShareIcon size={16} />
        <span className={s.igActionsEnd}>
          <BookmarkIcon size={16} />
        </span>
      </div>
      {piece.engagement?.likes != null && (
        <p className={s.igLikes}>{formatCount(piece.engagement.likes)} likes</p>
      )}
      <p className={s.caption} style={{ paddingBottom: "0.75rem" }}>
        <span className={s.captionName}>{brand.handle}</span>
        {piece.copy.body}
      </p>
    </PostShell>
  );
}
