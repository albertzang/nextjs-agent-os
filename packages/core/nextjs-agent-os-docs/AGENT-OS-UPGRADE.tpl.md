# Agent OS upgrades ({{project.name}})

OS protocols, skills, and role rules are **managed** by [`@nextjs-agent-os/cli`](https://www.npmjs.com/package/@nextjs-agent-os/cli). Do not edit managed files in place — contribute upstream at [github.com/albertzang/nextjs-agent-os](https://github.com/albertzang/nextjs-agent-os).

## Current install

| Field | Value |
|-------|--------|
| Package | `@nextjs-agent-os/cli@{{manifest.version}}` |
| Manifest | [`.agent-os/manifest.json`](../.agent-os/manifest.json) |
| Config | [`.agent-os/config.yaml`](../.agent-os/config.yaml) |
| Docs root | `{{docs.root}}/` |

## Upgrade

```bash
npx @nextjs-agent-os/cli doctor --cwd .
npx @nextjs-agent-os/cli diff --cwd .
npx @nextjs-agent-os/cli upgrade --cwd .
```

Review the diff. PM commits: `chore: upgrade agent-os to 0.0.N`.

## Client-owned (never overwritten)

- `{{docs.root}}/product/FEATURES.md` and `backlogs/*` (merge on upgrade)
- Client domain docs outside `{{docs.root}}/`
- Optional client skill overlay: `{{client.devMemorySkill}}`

See upstream [CONTRIBUTING.md](https://github.com/albertzang/nextjs-agent-os/blob/main/CONTRIBUTING.md).
