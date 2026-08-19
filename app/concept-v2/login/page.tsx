import type { Metadata } from "next";
import { LOGIN_IS_PLACEHOLDER } from "@/lib/site";
import { MalakyLogo } from "@/components/concept-v2/MalakyLogo";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in — Malaky",
  description: "Sign in to continue to your Malaky workspace.",
};

/**
 * The way back in, before there is anything to go back into.
 *
 * This page exists for one reason: Login has to lead somewhere, and the
 * alternatives were all worse. An invented /dashboard would be a lie, a named
 * authentication vendor would be a decision that is not ours to make, and a
 * dead link in the header would be the worst of the three.
 *
 * So there is no form here. No email field, no password field, no provider
 * buttons, no "forgot your password", no session, no storage — none of which
 * could be honest without a backend, and every one of which would look like
 * the real thing to somebody who tried it. What the page has is a statement of
 * where you are and a note saying who is building the rest.
 *
 * When NEXT_PUBLIC_DASHBOARD_URL is set, nobody arrives here at all: Login
 * points straight at the dashboard and this page stops being reachable from
 * the header. It is a placeholder that removes itself.
 */
export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <MalakyLogo size="footer" />

        <h1 className={styles.title}>Welcome back.</h1>
        <p className={styles.lead}>Sign in to continue to your Malaky workspace.</p>

        {/* Deliberately not a link and not a form control. It shows what the
            step will look like without pretending the step works — an inert
            control that announces itself as unavailable rather than one that
            silently does nothing when pressed. */}
        <span className={styles.action} role="button" aria-disabled="true" tabIndex={-1}>
          Continue to Malaky
        </span>

        {LOGIN_IS_PLACEHOLDER && (
          <p className={styles.note}>
            Dashboard sign-in will be connected by the product team.
          </p>
        )}
      </div>
    </main>
  );
}
