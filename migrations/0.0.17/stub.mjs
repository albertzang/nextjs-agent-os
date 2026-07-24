/** Stub migration for 0.0.17 — copy when cutting next release */
export function migrate(_clientRoot, { dryRun = false } = {}) {
  if (dryRun) console.log("0.0.17 migration: (no-op stub)");
  return { ok: true };
}
