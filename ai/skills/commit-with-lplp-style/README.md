# Project-local commit style

This README extends the [lplp commit style](SKILL.md) with conventions specific to
this project.

## Emoji prefix

Prepend one emoji to every commit summary, matching the `make commit` convention:

| Emoji | When |
|---|---|
| `✨` | AI work — all regular commits produced by Claude/Codex |
| `🤌` | Changes to `ai/query.md` only |
| `🐞` | Changes to `ai/errors*.md` only |
| `🔏` | Lock-file-only commits (`yarn.lock`, `uv.lock`, `package-lock.json`) |
| `👩‍💻` | Human-authored fixes (not used for AI commits) |

Full format for AI work:

```
✨ [where] topic: ai: Run: Short summary.

Body with details.
```

## `[where]` tags for this project

| Tag | Covers |
|---|---|
| `[frontend]` | `frontend/` — Vue.js Lovelace card (TypeScript, Vite, vitest) |
| `[integration]` | `custom_components/nanoleaf_effect_card/` — Python HA integration |
| `[github]` | `.github/` — CI workflows, issue templates, Actions |
| `[hacs]` | `hacs.json`, HACS-specific configuration |
| `[scripts]` | `scripts/`, `Makefile` — dev helper scripts |
| `[git]` | `.gitignore`, `.gitattributes`, git config |
| `[docs]` | `README.md`, `DEVELOPMENT.md`, `CONTRIBUTING.md`, `QUICKSTART.md`, `examples.md` |
| `[ai]` | `ai/` — AI workflow files, skills, references, plans |

Combine multiple scopes with a pipe when a commit touches more than one area,
e.g. `✨ [github|integration] HACS release: ai: Run: Fixed validation.`

For commits from the upstream template repo, use `[base]` as usual, e.g.
`[base] [AllMyStorage] ai/hooks: ai: Run: …` (no leading emoji for template merges).
