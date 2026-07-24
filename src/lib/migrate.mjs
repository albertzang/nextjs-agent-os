import fs from "node:fs";
import path from "node:path";

/** ccvaa-web 0.0.16 migration: docs/* OS tree → nextjs-agent-os-docs/ */
export function runDocMigration016(clientRoot, { dryRun = false } = {}) {
  const moves = [
    ["docs/protocols", "nextjs-agent-os-docs/protocols"],
    ["docs/templates", "nextjs-agent-os-docs/templates"],
    ["docs/handoffs", "nextjs-agent-os-docs/handoffs"],
    ["docs/reports", "nextjs-agent-os-docs/reports"],
    ["docs/product", "nextjs-agent-os-docs/product"],
  ];
  const pruned = [];
  const moved = [];

  for (const [from, to] of moves) {
    const fromPath = path.join(clientRoot, from);
    const toPath = path.join(clientRoot, to);
    if (!fs.existsSync(fromPath)) continue;
    if (dryRun) {
      moved.push(`${from} → ${to}`);
      continue;
    }
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    if (fs.existsSync(toPath)) {
      mergeDir(fromPath, toPath);
      fs.rmSync(fromPath, { recursive: true, force: true });
    } else {
      fs.renameSync(fromPath, toPath);
    }
    moved.push(`${from} → ${to}`);
  }

  const docsReadme = path.join(clientRoot, "docs/README.md");
  if (fs.existsSync(docsReadme)) {
    if (!dryRun) fs.rmSync(docsReadme, { force: true });
    pruned.push("docs/README.md");
  }

  rewriteReferences(clientRoot, dryRun);
  return { moved, pruned };
}

function mergeDir(src, dest) {
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      mergeDir(s, d);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function rewriteReferences(clientRoot, dryRun) {
  const replacements = [
    [/(?<![\w-])docs\/protocols/g, "nextjs-agent-os-docs/protocols"],
    [/(?<![\w-])docs\/templates/g, "nextjs-agent-os-docs/templates"],
    [/(?<![\w-])docs\/handoffs/g, "nextjs-agent-os-docs/handoffs"],
    [/(?<![\w-])docs\/reports/g, "nextjs-agent-os-docs/reports"],
    [/(?<![\w-])docs\/product/g, "nextjs-agent-os-docs/product"],
    [/(?<![\w-])docs\/README\.md/g, "nextjs-agent-os-docs/README.md"],
  ];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) {
        if (name === "node_modules" || name === ".git") continue;
        walk(full);
      } else if (/\.(md|mdc|json|yaml|yml|mjs|ts|tsx)$/.test(name)) {
        let text = fs.readFileSync(full, "utf8");
        let changed = false;
        for (const [re, rep] of replacements) {
          if (text.match(re)) {
            text = text.replace(re, rep);
            changed = true;
          }
        }
        if (changed && !dryRun) fs.writeFileSync(full, text);
      }
    }
  }

  walk(clientRoot);
}

export function backupClient(clientRoot) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(clientRoot, ".agent-os/backup", stamp);
  fs.mkdirSync(backupDir, { recursive: true });
  return backupDir;
}
