# Contributing

1. Work from [BACKLOG.md](BACKLOG.md) — IDs **`NNNN`**, descending in file.
2. Change **`packages/core`** templates and **`src/lib`** CLI as needed.
3. Add **`RELEASE_NOTES/0.0.N.yaml`** with `docMigrations` / `prune` lists.
4. Bump **`package.json`** patch version; update **`BACKLOG.md`** and **CHANGELOG.md**.
5. Tag **`v0.0.N`** on merge to `main`.
6. Publish **`@albertzang/nextjs-agent-os-cli@0.0.N`** to npm.

**Self-evolve:** CEO kickoff → `feature-branch` loop on this repo only; clients consume via `npx @albertzang/nextjs-agent-os-cli upgrade`.

**Do not** edit managed OS files in client repos — dogfood fixes go here, then release.
