import { getBrand } from "@/lib/concept-v2/brands";
import type { MarketingPiece } from "@/lib/concept-v2/content";
import { BrandMedia } from "../BrandMedia";
import { BrandMark } from "../BrandMark";
import { ArrowRight } from "../icons";
import { PlatformBar, PostShell, postStyles as s } from "./shared";

/** Renders as paper rather than app chrome — an email is a different object. */
export function NewsletterPreview({ piece }: { piece: MarketingPiece }) {
  const brand = getBrand(piece.brandId);
  return (
    <PostShell variant="paper">
      <PlatformBar platform="newsletter" label={piece.label} onLight tone="#3f7d63" />
      <div className={s.mailHead}>
        <span className={s.mailFrom}>
          <BrandMark brand={brand} size={16} />
          {brand.name} · {piece.timestamp ?? "Draft"}
        </span>
        <h4 className={s.mailSubject}>{piece.copy.headline}</h4>
        {piece.copy.subhead && <span className={s.mailPreheader}>{piece.copy.subhead}</span>}
      </div>
      {piece.media && (
        <BrandMedia
          scene={piece.media.scene}
          alt={piece.media.alt}
          aspect={piece.media.aspect}
        />
      )}
      <p className={s.mailBody}>{piece.copy.body}</p>
      {piece.copy.cta && (
        <span className={s.mailCta} style={{ background: brand.palette.ink }}>
          {piece.copy.cta}
          <ArrowRight size={12} />
        </span>
      )}
    </PostShell>
  );
}
