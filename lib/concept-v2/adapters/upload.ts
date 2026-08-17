/**
 * FileUploadAdapter — the seam where brand documents would be stored.
 *
 * ## What the UI hands it
 *
 * A browser `File` chosen through the upload zone in the brand step.
 *
 * ## What the UI expects back
 *
 * `UploadResult` — the file's name and size, so the zone can list what was
 * chosen. That listing is the whole interface contract.
 *
 * ## What production must provide
 *
 * - Object storage, and a decision about where it lives, which matters in
 *   these markets and is not made here.
 * - Direct-to-storage upload so documents do not pass through the app server.
 * - Type and size limits enforced server-side; the zone's `accept` attribute
 *   is a convenience, not a control.
 * - Virus scanning before anything is handed to the team.
 * - Deletion, and a customer-visible way to ask for it.
 *
 * Nothing is uploaded by this module. The file never leaves the browser, and
 * the brand step says so on the page rather than only in this comment.
 */

export interface UploadResult {
  ok: boolean;
  demoMode: boolean;
  name: string;
  /** Bytes, as reported by the browser. */
  size: number;
  message?: string;
}

/** Reads nothing and transmits nothing — it records the choice for the list. */
export async function stageDocument(file: { name: string; size: number }): Promise<UploadResult> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { ok: true, demoMode: true, name: file.name, size: file.size };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
