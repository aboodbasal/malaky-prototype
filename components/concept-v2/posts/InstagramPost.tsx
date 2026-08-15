import { getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { BookmarkIcon, CommentIcon, HeartIcon, ShareIcon } from "../icons";
import { PlatformBar, PostShell, formatCount, postStyles as s } from "./shared";

export function InstagramPost({ piece }: { piece: MarketingPiece }) {
  const brand = piece.brand ?? getBrand(piece.brandId);
  const rtl = piece.dir === "rtl";
  return (
    <PostShell dir={piece.dir}>
      <PlatformBar platform="instagram" label={piece.label} />
      <div className={s.account}>
        <BrandMark brand={brand} size={26} />
        <div className={s.accountText}>
          <span className={`${s.accountName} ${rtl ? s.arabic : ""}`}>
            {rtl ? (brand.nameAr ?? brand.name) : brand.name}
          </span>
          {/* Latin handles and English UI strings stay LTR inside an RTL post. */}
          <span className={s.accountMeta} dir="ltr">
            @{brand.handle}
          </span>
        </div>
      </div>
      {piece.media && (
        <BrandMedia {...piece.media} />
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
        <p className={s.igLikes} dir="ltr">
          {formatCount(piece.engagement.likes)} likes
        </p>
      )}
      <p
        className={`${s.caption} ${rtl ? s.arabic : ""}`}
        style={piece.postedAt ? undefined : { paddingBottom: "0.75rem" }}
      >
        <span className={s.captionName}>{brand.handle}</span>
        {piece.copy.body}
      </p>

      {piece.postedAt && (
        <>
          {piece.engagement?.comments != null && (
            <p className={s.igComments}>
              View all {piece.engagement.comments} comments
            </p>
          )}
          <p className={s.igTime} dir="ltr">
            {piece.postedAt}
          </p>
        </>
      )}
    </PostShell>
  );
}
