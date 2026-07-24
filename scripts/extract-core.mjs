#!/usr/bin/env node
/**
 * Extract from ccvaa-web → packages/core templates.
 * Usage: node scripts/extract-core.mjs /path/to/ccvaa-web
 */
import fs from "node:fs";
import path from "node:path";

const ccvaaRoot = process.argv[2] || path.resolve(import.meta.dirname, "../../ccvaa-web");
const coreRoot = path.resolve(import.meta.dirname, "../packages/core");

const REPLACEMENTS = [
  [/https:\/\/ccvaa-web\.vercel\.app/g, "{{environments.production}}"],
  [/ccvaa-web\.vercel\.app/g, "{{environments.productionHost}}"],
  [/https:\/\/ccvaa\.ca/g, "{{environments.publicDomain}}"],
  [/\bccvaa\.ca\b/g, "{{environments.publicDomainHost}}"],
  [/info@ccvaa\.ca/g, "{{auth.qaAdmin.mailbox}}"],
  [/\/admin\/mail/g, "{{auth.qaAdmin.mailPath}}"],
  [/CCVAA Web/g, "{{project.title}}"],
  [/CCVAA multi-agent/g, "{{project.title}} multi-agent"],
  [/CCVAA QA/g, "{{project.title}} QA"],
  [/CCVAA Developer/g, "{{project.title}} Developer"],
  [/CCVAA Product Manager/g, "{{project.title}} Product Manager"],
  [/for `ccvaa-web`/g, "for `{{project.name}}`"],
  [/\bccvaa-web\b/g, "{{project.name}}"],
  [/CCVAA /g, "{{project.orgName}} "],
  [/Hover/g, "{{auth.qaAdmin.provider}}"],
  [/Edge Config/g, "{{goLive.systemName}}"],
  [/(?<!node_modules\/next\/dist\/)docs\//g, "{{docs.root}}/"],
  [/ccvaa-multi-agent/g, "multi-agent"],
  [/ccvaa-dev-memory/g, "{{client.devMemorySkill}}"],
];

function transform(content) {
  let out = content;
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  return out;
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn("skip missing:", src);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, transform(fs.readFileSync(src, "utf8")));
  console.log("wrote", path.relative(coreRoot, dest));
}

function copyTree(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyTree(src, dest);
    else copyFile(src, dest);
  }
}

fs.rmSync(coreRoot, { recursive: true, force: true });
fs.mkdirSync(coreRoot, { recursive: true });

copyFile(path.join(ccvaaRoot, "AGENTS.md"), path.join(coreRoot, "AGENTS.md.tpl"));
fs.writeFileSync(path.join(coreRoot, "CLAUDE.md"), "@AGENTS.md\n");

copyTree(path.join(ccvaaRoot, ".cursor/agents"), path.join(coreRoot, ".cursor/agents"));
copyFile(
  path.join(ccvaaRoot, ".cursor/rules/ccvaa-multi-agent.mdc"),
  path.join(coreRoot, ".cursor/rules/multi-agent.mdc")
);
for (const role of ["developer", "qa", "product-manager"]) {
  copyFile(
    path.join(ccvaaRoot, `.cursor/rules/${role}.mdc`),
    path.join(coreRoot, `.cursor/rules/${role}.mdc`)
  );
}
for (const skill of ["product-manager", "developer", "qa"]) {
  copyTree(
    path.join(ccvaaRoot, `.cursor/skills/${skill}`),
    path.join(coreRoot, `.cursor/skills/${skill}`)
  );
}

const docsRoot = path.join(coreRoot, "nextjs-agent-os-docs");
copyTree(path.join(ccvaaRoot, "docs/protocols"), path.join(docsRoot, "protocols"));
copyTree(path.join(ccvaaRoot, "docs/templates"), path.join(docsRoot, "templates"));
copyFile(path.join(ccvaaRoot, "docs/handoffs/README.md"), path.join(docsRoot, "handoffs/README.md"));
copyFile(path.join(ccvaaRoot, "docs/reports/README.md"), path.join(docsRoot, "reports/README.md"));
copyFile(path.join(ccvaaRoot, "docs/README.md"), path.join(docsRoot, "README.md"));
copyFile(path.join(ccvaaRoot, "docs/product/BACKLOG.md"), path.join(docsRoot, "product/BACKLOG.tpl.md"));

console.log("\nExtract complete.");
