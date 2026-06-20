# Visual Editor - Separate File with Async Import

**Date**: January 4, 2026  
**Status**: ✅ EXTRACTED TO SEPARATE FILE

---

## Current Implementation

The editor code has been **extracted into a separate file** (`card-editor.js`) and is loaded using dynamic async import.

### Implementation

```javascript
// In card.js
static async getConfigElement() {
  await import('./card-editor.js');
  return document.createElement('nanoleaf-effect-card-editor');
}
```

This ensures the editor module is loaded before the element is created.

### File Structure

1. **card.js** - Main card implementation (~330 lines)

    - Contains `NanoleafEffectCard` class
    - Uses async import to load editor

2. **card-editor.js** - Visual editor (~500 lines)
    - Contains `NanoleafEffectCardEditor` class
    - Loaded dynamically when needed
    - Uses native HA components:
        - `ha-entity-picker`
        - `ha-formfield` + `ha-radio`
        - `ha-switch`
        - `ha-icon-picker`
        - `ha-sortable`
        - `ha-button`

---

## How It Works

When Home Assistant needs the editor:

1. ✅ User clicks "Edit Card"
2. ✅ HA calls `getConfigElement()` (async)
3. ✅ card.js imports card-editor.js dynamically
4. ✅ `NanoleafEffectCardEditor` is defined
5. ✅ Element is created and returned
6. ✅ `setConfig()` method is available
7. ✅ Editor renders in the UI

---

## Benefits

### Separate Files ✅

-   **Cleaner code organization** - Card and editor separated
-   **Smaller card.js** - Only ~330 lines for the card
-   **Easier maintenance** - Edit editor without touching card
-   **Development clarity** - Clear separation of concerns

### Async Import ✅

-   **Lazy loading** - Editor only loaded when needed
-   **Smaller initial bundle** - Card loads faster
-   **On-demand** - Editor loaded on first use
-   **Cached** - Subsequent uses are instant

---

## File Sizes

-   **card.js**: ~330 lines (card only)
-   **card-editor.js**: ~500 lines (complete editor)
-   **Total**: ~830 lines (vs 830 lines bundled)

**Loading**:

-   Initial: Only card.js loaded
-   On edit: card-editor.js loaded dynamically
-   Cached: Future edits use cached editor

---

## Previous Approach

Earlier, we bundled the editor into card.js to avoid timing issues. However, with proper async/await handling, the separate file approach works reliably.

---

## Compatibility

-   ✅ Works with Home Assistant 2023.1+
-   ✅ Works in visual card editor
-   ✅ Works in YAML mode
-   ✅ No build step required
-   ✅ Two-file deployment (card.js + card-editor.js)

---

**Status**: ✅ WORKING
**Date**: January 4, 2026  
**Architecture**: Separate files with async import
