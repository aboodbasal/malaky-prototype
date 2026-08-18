import type { MarketingPiece } from "@/lib/concept-v2/content";
import { CustomerLogo, isWordmark } from "../CustomerLogo";
import { EngagementRow, PlatformBar, PostShell, pieceCustomer, postStyles as s } from "./shared";

/**
 * Short-form. One line of text and, where the customer has something of their
 * own to point at, the link card that goes with it.
 *
 * No image, and that is the design rather than a gap: X is the one channel
 * here whose native post is text, so a card without artwork reads as the
 * format rather than as a missing asset.
 *
 * No handle either. Every customer's `handle` is null, because none of them
 * has published one to this repository — and an @name we made up is an
 * invented identity, which is the whole thing this concept refuses to do.
 * The account line carries what we do know: their name and their sector.
 */
export function XPost({ piece }: { piece: MarketingPiece }) {
  const customer = pieceCustomer(piece);
  return (
    <PostShell>
      <PlatformBar platform="x" label={piece.label} />
      <div className={s.account}>
        <CustomerLogo customer={customer} size={30} />
        <div className={s.accountText}>
          {!isWordmark(customer) && <span className={s.accountName}>{customer.name}</span>}
          {/* Just Malaky's own state. The sector belongs here too, but the
              two together overrun the account line at card width and truncate,
              and a clipped line reads as broken chrome rather than as a real
              account. */}
          <span className={s.accountMeta}>{piece.timestamp}</span>
        </div>
      </div>

      <p className={s.xBody}>{piece.copy.body}</p>

      {/* The link preview. Everything in it is what the customer publishes
          about itself — the domain is theirs and the service is one they
          list. Nothing here is a claim we made on their behalf. */}
      {piece.link && (
        <div className={s.linkCard}>
          <span className={s.linkDomain}>{piece.link.domain}</span>
          <span className={s.linkTitle}>{piece.link.title}</span>
          <span className={s.linkDetail}>{piece.link.detail}</span>
        </div>
      )}

      <EngagementRow {...piece.engagement} />
    </PostShell>
  );
}
