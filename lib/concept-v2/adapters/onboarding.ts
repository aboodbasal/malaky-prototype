/**
 * OnboardingAdapter — the seam where the answers a customer gives would be
 * kept.
 *
 * ## What the UI hands it
 *
 * `OnboardingDraft`, the whole shape below. The onboarding screens hold it in
 * component state and pass it here once, at the end. There is deliberately no
 * per-step save: a partial save implies a server that can be resumed from, and
 * this repository has neither.
 *
 * ## What the UI expects back
 *
 * `OnboardingResult`. The flow moves to the walkthrough on `ok`.
 *
 * ## What production must provide
 *
 * - Storage for the draft, and a decision about whether steps save as the
 *   customer goes. If they do, the pages need a resume path, which is a design
 *   change and not only an engineering one.
 * - Validation the server trusts, rather than the browser-side checks here.
 * - Handoff into Intelligence Setup for the team who configure the deployment.
 * - Retention and deletion behaviour, which the privacy policy will have to
 *   describe once it exists.
 */

export interface ExecutiveVoiceDraft {
  name: string;
  title: string;
  linkedin: string;
  language: string;
  tone: string;
  topics: string;
  avoid: string;
  samples: string;
}

export interface OnboardingDraft {
  business: {
    company: string;
    website: string;
    industry: string;
    description: string;
  };
  brand: {
    colours: string;
    products: string;
    audience: string;
    personality: string;
    never: string;
    /** Names of files chosen in the browser. No file leaves the page. */
    documents: string[];
  };
  voices: ExecutiveVoiceDraft[];
  markets: { primary: string; also: string[] };
  languages: string[];
  channels: string[];
  calendar: { dates: string; notes: string };
  approvals: { model: string; approver: string };
}

export interface OnboardingResult {
  ok: boolean;
  demoMode: boolean;
  message?: string;
}

export async function saveOnboarding(draft: OnboardingDraft): Promise<OnboardingResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  void draft;
  return { ok: true, demoMode: true };
}
