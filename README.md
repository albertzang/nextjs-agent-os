# nextjs-agent-os

npm package **`@nextjs-agent-os/cli`** — install and upgrade the 3-agent Product OS for Next.js + TypeScript projects on GitHub/Vercel.

## Quick start

```bash
npx @nextjs-agent-os/cli@0.0.16 doctor --cwd /path/to/your-next-app
npx @nextjs-agent-os/cli@0.0.16 install --cwd /path/to/your-next-app --config .agent-os/config.yaml
```

## Client requirements

### Required (hard fail)

1. Git repo with GitHub `origin`
2. TypeScript (`tsconfig.json`)
3. Next.js App Router (`next` >= 16; `src/app/` or `app/`)
4. Node.js >= 20
5. Writable `.cursor/`, repo root (`AGENTS.md`)
6. Vercel link (`.vercel/project.json`, `vercel.json`, or `deploy.platform: vercel` in config)

### Warn if missing

- `lint`, `typecheck`, `build` scripts
- `environments.production` in `.agent-os/config.yaml`

## Versioning

| Field | Example |
|-------|---------|
| npm semver | `0.0.16` |
| git tag | `v0.0.16` |
| `manifest.osRelease` | `"0.0.16"` |
| upstream `BACKLOG.md` ID | `0016` |

Patch bumps only: `0.0.17` ↔ backlog `0017`.

## OS docs layout (client)

All OS-managed docs live under **`nextjs-agent-os-docs/`**:

- `protocols/`, `templates/`, `handoffs/`, `reports/`, `product/`
- Client domain docs (e.g. `docs/members/`) stay outside this tree

## Commands

| Command | Purpose |
|---------|---------|
| `doctor` | Validate client repo |
| `init` / `install` | First install |
| `upgrade` | Apply latest release + migrations |
| `diff` | Preview changes (`--dry-run` on install/upgrade) |

## Contributing

OS evolution happens in this repo (`BACKLOG.md` IDs `0016+`). Client repos run `agent-os upgrade` — do not edit managed files in place.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SIGNOFF.md](SIGNOFF.md).
