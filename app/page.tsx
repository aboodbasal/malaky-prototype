import { redirect } from "next/navigation";

/**
 * The base URL is Malaky.
 *
 * The concept still lives under /concept-v2 and keeps every route it has —
 * moving the directory would rewrite every internal link for no benefit at
 * this stage. This is the entry point only: anyone who opens the deployment
 * hostname lands on the site rather than on a list of builds.
 *
 * A redirect rather than a second copy of the homepage. Duplicating it here
 * would give the same page two addresses, and the two would drift.
 */
export default function RootPage() {
  redirect("/concept-v2");
}
