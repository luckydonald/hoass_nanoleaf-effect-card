Summary: Name-based merging and chooser fixes

What I implemented

-   Name-based merging in `card-editor.js` (`setConfig`):

    -   When merging an incoming config with the editor's existing `_config`, effects are now merged primarily by name (if present). If no matching name exists, we fall back to index-based merging.
    -   Per-effect `button_style` is merged rather than replaced. `button_style.color_display` from the previous state is preserved when the incoming config doesn't provide it.

-   Chooser (per-effect `nanoleaf-effect-card-card-editor-button-style-chooser`) improvements:
    -   Internal state merging: the chooser now merges incoming `value` with its existing internal `_value` so transient toggles are preserved across re-renders.
    -   Event payloads are deep-cloned before dispatching to avoid shared object mutation bugs.
    -   Per-button event listeners are attached after render (guarded) to ensure reliable event delivery in JSDOM and browsers.
    -   Keyboard activation (Enter/Space) supported; click toggles active state immediately (fixes the double-click requirement).

Why

-   Previously, the editor could overwrite per-effect chooser state when `setConfig` was called (for example when the visual editor re-applies config or effects are reordered). That made chooser state fragile and easily lost.
-   Shared object references between chooser instances caused toggling one chooser to sometimes reset others.
-   The browser/test event handling differences made the first click sometimes not take effect.

Key files changed

-   `card-editor.js`

    -   `setConfig` now merges effects name-based and preserves `button_style.color_display`.
    -   Per-effect chooser `value-changed` handler now tries to match the target effect by name (fall back to index) before writing into `_config.effects[targetIndex].button_style.color_display`.

-   `card-editor-button-style-chooser.js`
    -   Chooser `set value(v)` merges incoming values with existing chooser state.
    -   Chooser attaches per-button listeners in `render()` and dispatches deep-cloned `value-changed` events.

How to verify (recommended test commands)

-   Run chooser-focused tests:

    yarn test -- card-editor-button-style-chooser.test.js
    yarn test -- card-editor-button-style-chooser.multi.test.js

-   Run merge-preservation test:

    yarn test -- card-editor-chooser-preserve.test.js

-   Run the whole test suite:

    yarn test

Manual verification in Home Assistant

1. Open the card visual editor with an initial config that defines multiple effects with names.
2. Toggle an option in a per-effect chooser (e.g. Full Background active) for effect "A".
3. Reorder effects in the editor so "A" moves to a different slot.
4. The chooser state for effect "A" should remain with the chosen toggles preserved.

Notes and possible follow-ups

-   If effects don't include unique names, index-based fallback is used — making effect names in the editor recommended for robust merging.
-   If you prefer merging by an ID instead of by name, we can add an optional hidden id field per effect.
-   We preserved other `button_style` fields when storing chooser data under `button_style.color_display`. If you want the chooser to adjust other button_style values, add explicit controls and wire them similarly.

If a test still fails

-   Paste the failing Vitest output and I'll iterate further.
-   Edge cases: if an external caller replaces effects with completely new objects lacking names, we do index fallback; consider adding heuristics (match by icon + color) if needed.

Done by: automated refactor
Date: 2026-01-05
