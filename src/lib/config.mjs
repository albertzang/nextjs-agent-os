import fs from "node:fs";
import path from "node:path";

/** Flatten config object to dot keys for {{a.b.c}} replacement */
export function flattenConfig(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenConfig(v, key));
    } else if (Array.isArray(v)) {
      out[key] = v.join(", ");
    } else {
      out[key] = String(v ?? "");
    }
  }
  return out;
}

export function renderTemplate(content, vars) {
  return content.replace(/\{\{([\w.]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function renderFile(srcPath, destPath, vars) {
  const raw = fs.readFileSync(srcPath, "utf8");
  const rendered = srcPath.endsWith(".tpl") || srcPath.endsWith(".tpl.md")
    ? renderTemplate(raw, vars)
    : raw.includes("{{")
      ? renderTemplate(raw, vars)
      : raw;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, rendered);
}

export function defaultConfig(projectName = "my-next-app") {
  return {
    project: {
      name: projectName,
      title: projectName,
      slug: projectName,
      orgName: projectName,
    },
    docs: { root: "nextjs-agent-os-docs" },
    environments: {
      dev: "http://localhost:3000",
      production: `https://${projectName}.vercel.app`,
      productionHost: `${projectName}.vercel.app`,
      publicDomain: "",
      publicDomainHost: "",
    },
    deploy: { platform: "vercel", previewProtection: true },
    goLive: { mode: "none", systemName: "feature flags" },
    auth: {
      qaAdmin: {
        mode: "none",
        provider: "none",
        mailbox: "",
        mailPath: "/admin",
        envVars: ["ADMIN_EMAIL", "ADMIN_PASS"],
      },
    },
    client: { devMemorySkill: "client-dev-memory" },
  };
}

export function loadYamlSimple(text) {
  const out = {};
  let current = out;
  const stack = [];
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.search(/\S/);
    const m = line.trim().match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, val] = m;
    while (stack.length && indent <= stack[stack.length - 1].indent) {
      current = stack.pop().ref;
    }
    if (val === "") {
      const obj = {};
      current[key] = obj;
      stack.push({ indent, ref: current });
      current = obj;
    } else {
      let v = val.replace(/^["']|["']$/g, "");
      if (v === "true") v = true;
      if (v === "false") v = false;
      current[key] = v;
    }
  }
  return out;
}

export function dumpYamlSimple(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      lines.push(`${pad}${k}:`);
      lines.push(dumpYamlSimple(v, indent + 1));
    } else if (Array.isArray(v)) {
      lines.push(`${pad}${k}: [${v.join(", ")}]`);
    } else {
      lines.push(`${pad}${k}: ${v}`);
    }
  }
  return lines.filter(Boolean).join("\n");
}
