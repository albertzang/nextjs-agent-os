import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { flattenConfig, renderFile } from "./config.mjs";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CORE_ROOT = path.join(PKG_ROOT, "packages/core");
export const OS_VERSION = "0.0.16";
export const PACKAGE_NAME = "@nextjs-agent-os/cli";

/** OS-managed paths relative to client repo root (allowlist) */
export function getManagedGlobs() {
  return [
    "AGENTS.md",
    "CLAUDE.md",
    ".cursor/agents/**",
    ".cursor/rules/multi-agent.mdc",
    ".cursor/rules/developer.mdc",
    ".cursor/rules/product-manager.mdc",
    ".cursor/rules/qa.mdc",
    ".cursor/skills/product-manager/**",
    ".cursor/skills/developer/**",
    ".cursor/skills/qa/**",
    "nextjs-agent-os-docs/protocols/**",
    "nextjs-agent-os-docs/templates/**",
    "nextjs-agent-os-docs/handoffs/README.md",
    "nextjs-agent-os-docs/reports/README.md",
    "nextjs-agent-os-docs/README.md",
  ];
}

export function listCoreFiles(coreRoot = CORE_ROOT) {
  const files = [];
  function walk(dir, base = "") {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const rel = base ? `${base}/${name}` : name;
      if (fs.statSync(full).isDirectory()) walk(full, rel);
      else files.push(rel);
    }
  }
  walk(coreRoot);
  return files;
}

/** Map core package path → client repo path */
export function coreToClientPath(coreRel, docsRoot = "nextjs-agent-os-docs") {
  if (coreRel === "AGENTS.md.tpl") return "AGENTS.md";
  if (coreRel === "CLAUDE.md") return "CLAUDE.md";
  if (coreRel.startsWith("nextjs-agent-os-docs/")) return coreRel;
  return coreRel;
}

export function installCore(clientRoot, config, { force = false, dryRun = false } = {}) {
  const vars = flattenConfig(config);
  vars["docs.root"] = config.docs?.root ?? "nextjs-agent-os-docs";
  const summary = { updated: [], skipped: [], merged: [] };

  for (const coreRel of listCoreFiles()) {
    const src = path.join(CORE_ROOT, coreRel);
    let destRel = coreToClientPath(coreRel, vars["docs.root"]);
    if (destRel.endsWith(".tpl") || destRel.endsWith(".tpl.md")) {
      destRel = destRel.replace(/\.tpl(\.md)?$/, "$1");
    }
    const dest = path.join(clientRoot, destRel);

    if (destRel.includes("BACKLOG.tpl")) {
      if (fs.existsSync(dest) && !force) {
        summary.skipped.push(destRel);
        continue;
      }
    }

    if (fs.existsSync(dest) && !force && !coreRel.endsWith(".tpl")) {
      const mode = getFileMode(destRel);
      if (mode === "merge") {
        summary.merged.push(destRel);
        continue;
      }
    }

    if (dryRun) {
      summary.updated.push(destRel);
      continue;
    }

    if (coreRel.endsWith(".tpl") || coreRel.endsWith(".tpl.md") || fs.readFileSync(src, "utf8").includes("{{")) {
      renderFile(src, dest, vars);
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    summary.updated.push(destRel);
  }

  return summary;
}

function getFileMode(rel) {
  if (rel.endsWith("product/FEATURES.md")) return "merge";
  if (rel.includes("product/backlogs/")) return "merge";
  if (rel.endsWith("product/BACKLOG.md")) return "merge";
  return "replace";
}

export function checksumManaged(clientRoot) {
  const h = crypto.createHash("sha256");
  for (const coreRel of listCoreFiles()) {
    const destRel = coreToClientPath(coreRel).replace(/\.tpl(\.md)?$/, "$1");
    const dest = path.join(clientRoot, destRel);
    if (fs.existsSync(dest)) {
      h.update(destRel);
      h.update(fs.readFileSync(dest));
    }
  }
  return `sha256:${h.digest("hex")}`;
}

export function writeManifest(clientRoot, config) {
  const dir = path.join(clientRoot, ".agent-os");
  fs.mkdirSync(dir, { recursive: true });
  const manifest = {
    osRelease: OS_VERSION,
    packageVersion: OS_VERSION,
    packageName: PACKAGE_NAME,
    installedAt: new Date().toISOString(),
    managedFilesChecksum: checksumManaged(clientRoot),
    docsRoot: config.docs?.root ?? "nextjs-agent-os-docs",
  };
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  return manifest;
}

export function readManifest(clientRoot) {
  const p = path.join(clientRoot, ".agent-os/manifest.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
