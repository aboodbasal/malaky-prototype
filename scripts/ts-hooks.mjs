/**
 * Node's ESM resolver demands an explicit extension on a relative import; the
 * app's modules are written for the bundler, which does not. This hook fills
 * the extension back in, so a test running under --experimental-strip-types
 * can import the real source instead of a copy of it that could drift.
 *
 * Paired with ./ts-resolve.mjs, which registers it:
 *   node --experimental-strip-types --import ./scripts/ts-resolve.mjs <script>
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\.[mc]?[jt]sx?$/.test(specifier)) {
    for (const ext of [".ts", ".mjs", ".js"]) {
      const url = new URL(specifier + ext, context.parentURL);
      if (existsSync(fileURLToPath(url))) return next(url.href, context);
    }
  }
  return next(specifier, context);
}
