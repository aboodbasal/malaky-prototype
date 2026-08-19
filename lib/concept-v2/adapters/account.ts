/**
 * AccountAdapter — the seam where a customer account would come into being.
 *
 * ## What the UI hands it
 *
 * The billing identity from checkout plus the plan that was bought. That is
 * everything the flow knows at the moment an account would be created.
 *
 * ## What the UI expects back
 *
 * `AccountResult`. The onboarding pages read `accountId` only to label the
 * session; nothing branches on it.
 *
 * ## What production must provide
 *
 * - An identity provider and a decision about how a customer signs in
 *   afterwards — none is chosen here.
 * - Account creation triggered by the confirmed payment webhook rather than by
 *   the browser, so an account cannot exist without a payment or the reverse.
 * - The workspace/tenant record the deployment will hang off.
 * - Invitations, if more than one person from a company will have access.
 *
 * This concept creates nothing. The onboarding screens are honest about that:
 * they describe what Malaky will be given, not what has been saved.
 */

import type { BillingIdentity } from "./payment";

export interface AccountRequest {
  planId: string;
  managed: boolean;
  billing: BillingIdentity;
}

export interface AccountResult {
  ok: boolean;
  demoMode: boolean;
  /** A local label for the session. Not a real account identifier. */
  accountId?: string;
  message?: string;
}

export async function createAccount(request: AccountRequest): Promise<AccountResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const handle = request.billing.company.trim().toLowerCase().replace(/\s+/g, "-");
  return { ok: true, demoMode: true, accountId: `demo-${handle || "account"}` };
}
