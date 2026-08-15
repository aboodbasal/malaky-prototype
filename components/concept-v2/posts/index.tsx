import type { MarketingPiece } from "@/lib/concept-v2/content";
import { ArabicSocialPost } from "./ArabicSocialPost";
import { InstagramPost } from "./InstagramPost";
import { LinkedInCompanyPost } from "./LinkedInCompanyPost";
import { LinkedInExecutivePost } from "./LinkedInExecutivePost";
import { NewsletterPreview } from "./NewsletterPreview";
import { ReelPreview } from "./ReelPreview";

export {
  ArabicSocialPost,
  InstagramPost,
  LinkedInCompanyPost,
  LinkedInExecutivePost,
  NewsletterPreview,
  ReelPreview,
};

/**
 * Renders whichever component a piece's platform calls for. Every surface on
 * the concept — orbit, mobile stack, fan-out, brand demo — goes through here,
 * so a piece looks identical wherever it appears.
 */
export function PostCard({ piece }: { piece: MarketingPiece }) {
  switch (piece.platform) {
    case "instagram":
      return <InstagramPost piece={piece} />;
    case "linkedin-company":
      return <LinkedInCompanyPost piece={piece} />;
    case "linkedin-executive":
      return <LinkedInExecutivePost piece={piece} />;
    case "arabic-social":
      return <ArabicSocialPost piece={piece} />;
    case "newsletter":
      return <NewsletterPreview piece={piece} />;
    case "reel":
      return <ReelPreview piece={piece} />;
  }
}
