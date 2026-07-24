import assert from "node:assert/strict";
import fs from "node:fs";
import { loadYamlSimple, flattenConfig, renderTemplate } from "../src/lib/config.mjs";

const yaml = fs.readFileSync(new URL("../packages/core/.agent-os/config.example.yaml", import.meta.url), "utf8");
const cfg = loadYamlSimple(yaml);
assert.equal(cfg.project.name, "my-app");
assert.equal(cfg.environments.production, "https://my-app.vercel.app");
assert.equal(cfg.auth.qaAdmin.mode, "none");

const flat = flattenConfig(cfg);
assert.equal(flat["project.name"], "my-app");
assert.equal(renderTemplate("Hello {{project.title}}", flat), "Hello My App");

console.log("config smoke ok");
