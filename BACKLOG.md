# Backlog: nextjs-agent-os

**Owner:** Product Manager (upstream)  
**Next ID:** `0017`

Work IDs: **`NNNN`** (descending in file). Schema matches client [`nextjs-agent-os-docs/product/BACKLOG.md`](packages/core/nextjs-agent-os-docs/product/BACKLOG.tpl.md) Verifier rules for upstream items: **`n/a` / `n/a`**, Ship path **`direct-to-main`** except **self-evolve** (`feature-branch`).

---

## 0016 — npm package + nextjs-agent-os-docs root

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Extract 3-agent OS from ccvaa-web into **`@albertzang/nextjs-agent-os-cli@0.0.16`**. OS-managed docs under **`nextjs-agent-os-docs/`**; CLI doctor/install/upgrade/diff; ccvaa-web first client.

**Acceptance:**
- [x] `packages/core` templates parameterized
- [x] CLI: doctor, init, install, upgrade, diff, dry-run
- [x] Release `0.0.16` / tag `v0.0.16`
- [x] ccvaa-web dogfood migration
- [x] Upstream BACKLOG + CHANGELOG

### Overall

- Shipped 2026-07-24. Baseline release through ccvaa-web OS at main-safe increments (legacy ccvaa `agent-os-0016`).

---

## 0017 — (stub) next release template

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `n/a` |
| **Verify passes** | `n/a` |
| **Ship path** | `direct-to-main` |

### Description

Template for next patch release (`0.0.17`). Add `RELEASE_NOTES/0.0.17.yaml` + optional `migrations/0.0.17/` hook.
