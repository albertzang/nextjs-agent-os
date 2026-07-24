import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export function runDoctor(clientRoot) {
  const results = [];
  let failed = false;

  function check(name, ok, hint, level = "fail") {
    results.push({ name, ok, hint, level });
    if (!ok && level === "fail") failed = true;
  }

  check("git repo", fs.existsSync(path.join(clientRoot, ".git")), "Run git init");
  try {
    const origin = execSync("git remote get-url origin", { cwd: clientRoot, encoding: "utf8" }).trim();
    check("github origin", /github\.com/i.test(origin), "Set origin to GitHub remote");
  } catch {
    check("github origin", false, "git remote add origin <github-url>");
  }

  const pkgPath = path.join(clientRoot, "package.json");
  check("package.json", fs.existsSync(pkgPath), "Missing package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const nextVer = pkg.dependencies?.next || pkg.devDependencies?.next;
    check("next >= 16", nextVer && parseInt(String(nextVer).replace(/\D/g, ""), 10) >= 16, "Add next@>=16");
    check("typescript", fs.existsSync(path.join(clientRoot, "tsconfig.json")), "Add tsconfig.json");
    check("lint script", !!pkg.scripts?.lint, "Add npm run lint", "warn");
    check("typecheck script", !!pkg.scripts?.typecheck, "Add npm run typecheck", "warn");
    check("build script", !!pkg.scripts?.build, "Add npm run build", "warn");
  }

  check(
    "app router",
    fs.existsSync(path.join(clientRoot, "src/app")) || fs.existsSync(path.join(clientRoot, "app")),
    "Need src/app or app/"
  );

  const vercel =
    fs.existsSync(path.join(clientRoot, ".vercel/project.json")) ||
    fs.existsSync(path.join(clientRoot, "vercel.json"));
  const cfgPath = path.join(clientRoot, ".agent-os/config.yaml");
  const hasCfg = fs.existsSync(cfgPath);
  check(
    "vercel deploy",
    vercel || hasCfg,
    "Link Vercel or add .agent-os/config.yaml with deploy.platform: vercel"
  );

  check("writable .cursor", canWrite(path.join(clientRoot, ".cursor")), "Fix .cursor permissions");
  check(
    "config production url",
    hasCfg && fs.readFileSync(cfgPath, "utf8").includes("production:"),
    "Set environments.production in .agent-os/config.yaml",
    "warn"
  );

  check("node >= 20", parseInt(process.version.slice(1), 10) >= 20, "Upgrade Node.js");

  return { results, failed };
}

function canWrite(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
