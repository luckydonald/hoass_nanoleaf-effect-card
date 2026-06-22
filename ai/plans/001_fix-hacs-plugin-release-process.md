# Fix HACS Plugin Release Process

## Summary
Make this repository release as a HACS Dashboard/plugin, not as a Home Assistant integration. Current HACS expects plugin `.js` files in `dist/`, a release asset, or repo root, and validation should use `category: plugin`, not Hassfest/integration checks.

## Key Changes
- Update `hacs.json` to target the actual plugin file: `filename: "nanoleaf-effect-card.js"` and remove the zip-release setup.
- Keep the Vite output as the root `nanoleaf-effect-card.js`, track it as the HACS-installable artifact, and make `scripts/release.sh` rebuild and commit it before tagging.
- Rewrite `.github/workflows/release.yml` to use Node 24 + Corepack/Yarn in `frontend/`, build once, and upload `nanoleaf-effect-card.js` directly as the GitHub release asset.
- Fix `.github/workflows/ci.yml` to run frontend commands from `frontend/` with Yarn, remove root `npm ci`/missing npm scripts, keep HACS validation as `category: plugin`, and remove Hassfest.
- Remove obsolete integration/legacy release assumptions: delete or disable `.github/workflows/release-legacy.yml`, stop using root `manifest.json`, and update README install instructions from `card.js`/`card-editor.js` to `nanoleaf-effect-card.js`.

## Test Plan
- Validate JSON for `hacs.json`, `frontend/package.json`, and workflow YAML parsing.
- Run `cd frontend && yarn install --immutable && yarn type-check && yarn lint && yarn test && yarn build`.
- Confirm build creates root `nanoleaf-effect-card.js`.
- Run the updated HACS validation workflow locally if feasible, otherwise rely on GitHub Actions after push.
- Dry-check release packaging: a tag build should produce one release asset named `nanoleaf-effect-card.js`.

## Assumptions
- This repo is plugin-only because `scripts/init.json` has `"keep_backend": false` and `custom_components/` is absent.
- HACS Dashboard/plugin validation is the correct target; HACS docs say Dashboard is still `plugin` internally and plugin files are discovered in `dist/`, release assets, or repo root.
- Sources used: https://www.hacs.xyz/docs/publish/plugin/ and https://www.hacs.xyz/docs/publish/action/.
