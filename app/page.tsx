import Link from "next/link";

/**
 * Placeholder root. The repository had no production site when this concept
 * was built, so nothing here is overwritten — the concept lives entirely
 * under /concept-v2.
 */
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeContent: "center",
        gap: "1.25rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <p
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--c-text-3)",
        }}
      >
        Malaky prototype
      </p>
      <h1 style={{ fontFamily: "var(--f-display)", fontSize: "2.5rem", fontWeight: 400 }}>
        Concept builds
      </h1>
      <ul style={{ display: "grid", gap: "0.5rem", color: "var(--c-accent)" }}>
        <li>
          <Link href="/concept-v2">/concept-v2</Link>
        </li>
        <li>
          <Link href="/concept-v2/pricing">/concept-v2/pricing</Link>
        </li>
      </ul>
    </main>
  );
}
