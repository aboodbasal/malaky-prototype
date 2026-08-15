import { getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { PlayIcon } from "../icons";
import { PostShell, postStyles as s } from "./shared";

/**
 * Static poster frame with a play affordance — nothing autoplays, so a page
 * full of these costs nothing at runtime.
 */
export function ReelPreview({ piece }: { piece: MarketingPiece }) {
  const brand = getBrand(piece.brandId);
  return (
    <PostShell>
      <div className={s.reelWrap}>
        {piece.media && (
          <BrandMedia
            scene={piece.media.scene}
            alt={piece.media.alt}
            aspect={piece.media.aspect}
          />
        )}
        <div className={s.reelOverlay}>
          <div className={s.reelTop}>
            <BrandMark brand={brand} size={18} />
            {piece.label}
            {piece.duration && <span className={s.reelDuration}>{piece.duration}</span>}
          </div>
          <div className={s.reelFoot}>
            {piece.copy.headline && <p className={s.reelTitle}>{piece.copy.headline}</p>}
            <p className={s.reelSub}>{piece.copy.body}</p>
          </div>
        </div>
        <span className={s.reelPlay} aria-hidden="true">
          <PlayIcon size={16} />
        </span>
      </div>
    </PostShell>
  );
}
