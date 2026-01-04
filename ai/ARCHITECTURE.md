# Architecture Documentation

**Project**: Nanoleaf Effect Card  
**Date**: January 4, 2026  
**Architecture**: Two-file with dynamic import

---

## File Structure

```
nanoleaf-effect-card/
├── card.js                    # Main card (330 lines)
└── card-editor.js             # Visual editor (500 lines)
```

---

## card.js

**Purpose**: Main custom card implementation  
**Size**: ~330 lines  
**Loaded**: On dashboard load  
**Dependencies**: None (standalone)

### Responsibilities

-   Render card UI (buttons or dropdown)
-   Handle user interactions
-   Call Home Assistant services
-   Display effect colors and animations
-   Manage card state

### Key Classes

-   `NanoleafEffectCard extends HTMLElement`

### Loading

```javascript
// In Lovelace resources:
resources:
  - url: /local/card.js
    type: module
```

### Editor Integration

```javascript
static async getConfigElement() {
    await import('./card-editor.js');  // Load editor on-demand
    return document.createElement('nanoleaf-effect-card-editor');
}
```

---

## card-editor.js

**Purpose**: Visual configuration editor  
**Size**: ~500 lines  
**Loaded**: On-demand (when user clicks "Edit Card")  
**Dependencies**: Native HA components

### Responsibilities

-   Provide visual configuration UI
-   Use native HA components
-   Handle config changes
-   Emit config-changed events
-   Support drag-and-drop reordering

### Key Classes

-   `NanoleafEffectCardEditor extends HTMLElement`

### Native HA Components Used

-   `ha-entity-picker` - Entity selection with autocomplete
-   `ha-formfield` - Form field wrapper
-   `ha-radio` - Radio button options
-   `ha-switch` - Toggle switches
-   `ha-icon-picker` - Icon selection with search
-   `ha-sortable` - Drag-and-drop list
-   `ha-button` - Standard buttons
-   `ha-svg-icon` - SVG icons

### Loading

```javascript
// Loaded dynamically by card.js:
await import('./card-editor.js');
```

**Not added to Lovelace resources** - Loaded automatically when needed.

---

## Loading Flow

### Initial Load (Dashboard)

1. User opens Home Assistant dashboard
2. Browser loads Lovelace
3. Lovelace processes resources
4. **card.js is loaded** (330 lines)
5. `NanoleafEffectCard` class defined
6. `customElements.define('nanoleaf-effect-card', ...)` registered
7. Card appears in dashboard ✅

**Editor is NOT loaded at this point** - Saves bandwidth and memory.

### Opening Visual Editor

1. User clicks "Edit" on card
2. Home Assistant calls `NanoleafEffectCard.getConfigElement()`
3. **Method is async** and awaits import
4. `await import('./card-editor.js')` executes
5. Browser fetches card-editor.js (500 lines)
6. `NanoleafEffectCardEditor` class defined
7. `customElements.define('nanoleaf-effect-card-editor', ...)` registered
8. Element created: `document.createElement('nanoleaf-effect-card-editor')`
9. HA calls `setConfig(config)` on editor
10. Editor renders in UI ✅

### Subsequent Edits

1. User clicks "Edit" again
2. Home Assistant calls `getConfigElement()`
3. **Browser cache has card-editor.js** ⚡
4. Import is instant (cached)
5. Element created immediately
6. Editor appears ✅

**Result**: First edit has small delay (500 lines download), subsequent edits are instant.

---

## Benefits of Two-File Architecture

### Performance ✅

-   **Smaller initial load**: 330 lines vs 830 lines (60% reduction)
-   **Lazy loading**: Editor only loaded when needed
-   **Caching**: Editor cached after first use
-   **Bandwidth**: Save ~500 lines on every dashboard load

### Maintainability ✅

-   **Separation of concerns**: Card and editor are independent
-   **Easier to edit**: Smaller files, clearer purpose
-   **Less merge conflicts**: Changes don't affect both
-   **Clear boundaries**: Each file has one job

### Development ✅

-   **Parallel development**: Work on card and editor separately
-   **Easier testing**: Test files independently
-   **Clearer diffs**: Changes show in relevant file only
-   **Better organization**: Logical file structure

---

## Deployment

### HACS Installation

**hacs.json**:

```json
{
    "name": "Nanoleaf Effects Card",
    "content_in_root": true,
    "filename": "card.js",
    "render_readme": true,
    "domains": ["light"]
}
```

**What HACS does**:

1. Clones repository
2. Copies `card.js` to `www/community/nanoleaf-effect-card/card.js`
3. Copies `card-editor.js` to `www/community/nanoleaf-effect-card/card-editor.js`
4. Adds `card.js` to Lovelace resources
5. Editor loaded automatically via relative import

**Files deployed**: Both card.js and card-editor.js  
**Files in resources**: Only card.js  
**Editor loading**: Automatic via `import('./card-editor.js')`

### Manual Installation

**Steps**:

1. Download `card.js` and `card-editor.js`
2. Copy both to `config/www/`
3. Add only `card.js` to resources:
    ```yaml
    resources:
        - url: /local/card.js
          type: module
    ```
4. Restart Home Assistant

**Why only card.js in resources?**  
Because card.js dynamically imports card-editor.js when needed.

---

## Build Pipeline

### No Build Step Required ✅

Both files are **vanilla JavaScript ES6 modules** - no build process needed.

### CI/CD Pipeline

**.github/workflows/ci.yml**:

```yaml
- name: Check code formatting
  run: npm run check-prettier # Both files

- name: Run tests
  run: npm test # Tests card functionality
```

**.github/workflows/release.yml**:

```yaml
- name: Create release artifact
  run: |
      zip -r nanoleaf-effect-card-$VERSION.zip \
        card.js \           # Main card
        card-editor.js \    # Editor (included)
        README.md \
        LICENSE \
        hacs.json
```

**Both files included in release** ✅

---

## Code Organization

### card.js Structure

```javascript
/**
 * Main card documentation
 */
class NanoleafEffectCard extends HTMLElement {
    constructor() {}
    setConfig(config) {} // Set configuration
    set hass(hass) {} // Receive HA updates
    render() {} // Render card UI
    renderButtons() {} // Button display mode
    renderDropdown() {} // Dropdown display mode
    getEffectColors() {} // Get effect colors
    getContrastColor() {} // Calculate text color
    attachEventListeners() {} // Setup interactions
    handleEffectSelect() {} // Handle selection

    static async getConfigElement() {
        await import('./card-editor.js'); // ← Load editor
        return document.createElement('nanoleaf-effect-card-editor');
    }

    static getStubConfig() {} // Default config
}

customElements.define('nanoleaf-effect-card', NanoleafEffectCard);
// Registration code
```

### card-editor.js Structure

```javascript
/**
 * Editor documentation
 */
class NanoleafEffectCardEditor extends HTMLElement {
    constructor() {}
    set hass(hass) {} // Receive HA updates
    setConfig(config) {} // Set configuration
    configChanged(newConfig) {} // Emit changes
    render() {} // Render editor UI
    renderEffectsList() {} // Effects list
    renderColorInputs() {} // Color pickers
    attachEventListeners() {} // Setup interactions
}

customElements.define('nanoleaf-effect-card-editor', NanoleafEffectCardEditor);
```

---

## Import Mechanism

### Dynamic Import Explained

```javascript
static async getConfigElement() {
    await import('./card-editor.js');  // ← This line
    return document.createElement('nanoleaf-effect-card-editor');
}
```

**What happens**:

1. `import('./card-editor.js')` returns a Promise
2. Browser fetches the file (if not cached)
3. File is parsed and executed
4. Custom element is defined
5. Promise resolves
6. `await` completes
7. Element can be created

**Why await?**  
Without `await`, the element might not be defined yet when we try to create it.

### Relative Path

`'./card-editor.js'` is relative to card.js location:

-   If card.js is at `/local/card.js`
-   Then editor is at `/local/card-editor.js`
-   Import resolves correctly ✅

Works for:

-   Local files: `/local/card.js` → `/local/card-editor.js`
-   HACS: `/hacsfiles/nanoleaf/card.js` → `/hacsfiles/nanoleaf/card-editor.js`
-   Dev server: `http://localhost:3000/card.js` → `http://localhost:3000/card-editor.js`

---

## Browser Compatibility

### ES6 Modules Support

Required features:

-   ✅ ES6 Classes
-   ✅ Dynamic import()
-   ✅ async/await
-   ✅ Custom Elements v1
-   ✅ Shadow DOM

Supported browsers:

-   ✅ Chrome/Edge 63+
-   ✅ Firefox 67+
-   ✅ Safari 11.1+
-   ✅ All modern browsers

---

## Testing Strategy

### Unit Tests

**card.test.js**:

```javascript
import { NanoleafEffectCard } from './card.js';

describe('NanoleafEffectCard', () => {
    it('should render correctly', () => {});
    it('should handle config changes', () => {});
    // Tests card functionality
});
```

**Editor testing**:

-   Loaded via dynamic import in tests
-   Test configuration changes
-   Test UI interactions
-   Test event emission

### Manual Testing

**Card**:

1. Load in Home Assistant
2. Verify display modes
3. Test effect selection
4. Check animations

**Editor**:

1. Click "Edit Card"
2. Verify all fields appear
3. Test entity picker
4. Test drag-and-drop
5. Verify config saves

---

## Troubleshooting

### Editor doesn't load

**Symptom**: "setConfig is not a function" error

**Possible causes**:

1. card-editor.js not found (404 error)
2. Import path incorrect
3. Browser doesn't support dynamic import

**Solution**:

1. Check browser console for 404 errors
2. Verify both files copied correctly
3. Check file names match exactly
4. Ensure modern browser (Chrome 63+, Firefox 67+, Safari 11.1+)

### Editor loads slowly first time

**Symptom**: Delay when clicking "Edit" for first time

**This is normal!**

-   Editor is ~500 lines
-   First load downloads the file
-   Subsequent loads use cache
-   Expected behavior ✅

**To verify caching works**:

1. Click "Edit" (slow first time)
2. Close editor
3. Click "Edit" again (instant!)

---

## Performance Metrics

### Initial Load

**Without editor bundled**:

-   card.js: 330 lines (~10KB)
-   Total: 10KB

**With editor bundled**:

-   card.js: 830 lines (~25KB)
-   Total: 25KB

**Savings**: 60% smaller initial load ✅

### With Editor

**First editor open**:

-   card.js: 10KB (already loaded)
-   card-editor.js: 15KB (download)
-   Total: 25KB

**Subsequent opens**:

-   card-editor.js: 0KB (cached) ✅
-   Instant load!

---

## Future Considerations

### Potential Optimizations

1. **Code splitting**: Split editor into sub-modules
2. **Preloading**: Preload editor on hover
3. **Service worker**: Cache both files
4. **Compression**: Serve gzip/brotli

### Maintaining Separation

When making changes:

-   ✅ Card changes → Edit card.js only
-   ✅ Editor changes → Edit card-editor.js only
-   ✅ Keep files independent
-   ✅ Don't create cross-dependencies

---

## Conclusion

The two-file architecture with dynamic import provides:

-   ✅ **Better performance** (60% smaller initial load)
-   ✅ **Better organization** (clear separation)
-   ✅ **Better maintainability** (easier to edit)
-   ✅ **No build step** (vanilla ES6 modules)
-   ✅ **Automatic loading** (via dynamic import)
-   ✅ **Browser caching** (editor cached after first use)

**Status**: Production ready ✅  
**Compatibility**: Home Assistant 2023.1+  
**Browser Support**: All modern browsers  
**Deployment**: HACS and manual

---

_Last updated: January 4, 2026_
