#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultConfig,
  loadYamlSimple,
  dumpYamlSimple,
} from "../src/lib/config.mjs";
import { runDoctor } from "../src/lib/doctor.mjs";
import {
  installCore,
  writeManifest,
  readManifest,
  OS_VERSION,
  PACKAGE_NAME,
  CORE_ROOT,
} from "../src/lib/install.mjs";
import { runDocMigration016, backupClient } from "../src/lib/migrate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const cmd = args[0];
const flags = {
  force: args.includes("--force"),
  dryRun: args.includes("--dry-run"),
  config: getFlag("--config"),
  cwd: getFlag("--cwd") || process.cwd(),
};

function getFlag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

function loadClientConfig(clientRoot) {
  const cfgPath = path.join(clientRoot, ".agent-os/config.yaml");
  if (fs.existsSync(cfgPath)) {
    return loadYamlSimple(fs.readFileSync(cfgPath, "utf8"));
  }
  const name = path.basename(clientRoot);
  return defaultConfig(name);
}

function ensureConfig(clientRoot, config) {
  const dir = path.join(clientRoot, ".agent-os");
  fs.mkdirSync(dir, { recursive: true });
  const cfgPath = path.join(dir, "config.yaml");
  if (!fs.existsSync(cfgPath)) {
    fs.writeFileSync(cfgPath, dumpYamlSimple(config) + "\n");
  }
}

function footerAgents(clientRoot) {
  const p = path.join(clientRoot, "AGENTS.md");
  if (!fs.existsSync(p)) return;
  const marker = "<!-- BEGIN:agent-os-managed -->";
  let text = fs.readFileSync(p, "utf8");
  if (text.includes(marker)) return;
  text +=
    `\n${marker}\n` +
    `> OS managed by \`${PACKAGE_NAME}@${OS_VERSION}\`. Do not edit protocols/skills/rules in place — contribute upstream at https://github.com/albertzang/nextjs-agent-os\n` +
    `<!-- END:agent-os-managed -->\n`;
  fs.writeFileSync(p, text);
}

async function main() {
  const clientRoot = path.resolve(flags.cwd);

  if (cmd === "doctor") {
    const { results, failed } = runDoctor(clientRoot);
    for (const r of results) {
      const icon = r.ok ? "✓" : r.level === "warn" ? "!" : "✗";
      console.log(`${icon} ${r.name}${r.ok ? "" : ` — ${r.hint}`}`);
    }
    process.exit(failed ? 1 : 0);
  }

  if (cmd === "diff") {
    const summary = installCore(clientRoot, loadClientConfig(clientRoot), { dryRun: true });
    console.log("Would update:", summary.updated.join(", ") || "(none)");
    console.log("Would skip (merge):", summary.skipped.concat(summary.merged).join(", ") || "(none)");
    return;
  }

  if (cmd === "init" || cmd === "install" || cmd === "upgrade") {
    const existing = readManifest(clientRoot);
    if (cmd === "install" && existing && !flags.force) {
      console.error("Manifest exists. Use `agent-os upgrade` or --force.");
      process.exit(1);
    }

    let config = flags.config
      ? loadYamlSimple(fs.readFileSync(path.resolve(flags.config), "utf8"))
      : loadClientConfig(clientRoot);
    ensureConfig(clientRoot, config);

    if (!flags.dryRun) backupClient(clientRoot);

    const migration = runDocMigration016(clientRoot, { dryRun: flags.dryRun });
    console.log("Doc migration:", migration.moved.join("; ") || "(none)");
    if (migration.pruned.length) console.log("Pruned:", migration.pruned.join(", "));

    const summary = installCore(clientRoot, config, {
      force: flags.force || cmd === "upgrade",
      dryRun: flags.dryRun,
    });
    console.log("Updated:", summary.updated.length, "files");
    if (summary.merged.length) console.log("Merge preserved:", summary.merged.join(", "));

    if (!flags.dryRun) {
      writeManifest(clientRoot, config);
      footerAgents(clientRoot);
      if (!fs.existsSync(path.join(clientRoot, "CLAUDE.md"))) {
        fs.writeFileSync(path.join(clientRoot, "CLAUDE.md"), "@AGENTS.md\n");
      }
    }
    console.log(`Done. ${PACKAGE_NAME}@${OS_VERSION}`);
    return;
  }

  console.log(`@albertzang/nextjs-agent-os-cli ${OS_VERSION}

Usage:
  agent-os doctor [--cwd <path>]
  agent-os init|install [--cwd <path>] [--config <yaml>] [--force] [--dry-run]
  agent-os upgrade [--cwd <path>] [--force] [--dry-run]
  agent-os diff [--cwd <path>]

Core package: ${CORE_ROOT}
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
