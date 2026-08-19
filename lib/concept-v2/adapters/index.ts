/**
 * Integration seams.
 *
 * The website designs the whole customer journey; engineering makes it real.
 * Every point where the journey would touch a real system lives in this
 * directory as an adapter with three things stated explicitly:
 *
 *   1. the input the UI hands it,
 *   2. the result shape the UI is written against,
 *   3. what a production implementation must actually do.
 *
 * The mocks here move UI state and nothing else. No provider is chosen, no
 * request leaves the browser, nothing is stored. Replacing a mock with a real
 * implementation should require no change to any page — that is the test each
 * of these files is written to pass.
 *
 * Because nothing is connected, every adapter also carries `demoMode: true` in
 * its result, and the surfaces that call it say so in the interface rather
 * than claiming an outcome that did not happen.
 */

export * from "./payment";
export * from "./account";
export * from "./onboarding";
export * from "./upload";
export * from "./scheduling";

/**
 * The demo-request seam predates this directory and stays where the form
 * lives; it is re-exported here so the whole integration surface can be found
 * in one place.
 */
export { submitDemoRequest, type SubmitResult } from "../demo-request";

/** Common shape: nothing in this concept may report a real-world outcome. */
export interface AdapterResult {
  ok: boolean;
  /** Always true here. A production adapter sets this false. */
  demoMode: boolean;
  message?: string;
}
