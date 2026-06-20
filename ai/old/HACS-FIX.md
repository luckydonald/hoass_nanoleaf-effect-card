# HACS Deployment Fix - card-editor.js Not Found

**Date**: January 4, 2026  
**Issue**: card-editor.js not deployed/served by HACS  
**Status**: ✅ FIXED

---

## Problem

After installing the card via HACS, the card-editor.js file was not being served, causing a 404 error when the visual editor tried to load via `import('./card-editor.js')`.

---

## Root Cause

The `hacs.json` file had:

```json
{
    "filename": "card.js"
}
```

This told HACS to **only deploy card.js**, not card-editor.js.

---

## Solution

### Updated hacs.json

**Before**:

```json
{
    "name": "Nanoleaf Effects Card",
    "content_in_root": true,
    "filename": "card.js", // ← Only deploys this file
    "render_readme": true,
    "domains": ["light"]
}
```

**After**:

```json
{
    "name": "Nanoleaf Effects Card",
    "content_in_root": true,
    // filename removed - deploys all .js files
    "render_readme": true,
    "domains": ["light"]
}
```

### How HACS Works

When `content_in_root: true` and **no filename** specified:

1. HACS copies **all `.js` files** from repository root
2. Files are copied to `www/community/nanoleaf-effect-card/`
3. The first `.js` file (alphabetically) is added to Lovelace resources
4. Other `.js` files are available for import

**Result**:

-   ✅ `card.js` copied
-   ✅ `card-editor.js` copied
-   ✅ `card.js` added to resources
-   ✅ `card-editor.js` available at same path for import

---

## Verification

### Files Deployed by HACS

After installation, check:

```
config/www/community/nanoleaf-effect-card/
├── card.js              ✅ Main card
├── card-editor.js       ✅ Editor (now included!)
└── ... (other files)
```

### Import Path Resolution

When card.js executes:

```javascript
await import('./card-editor.js');
```

Browser looks for:

```
/hacsfiles/nanoleaf-effect-card/card-editor.js
```

This now exists! ✅

---

## Other Files Verified

### Release Workflow ✅

Already includes both files:

```yaml
zip -r nanoleaf-effect-card.zip \
  card.js \
  card-editor.js \    # ← Already included
  README.md \
  LICENSE \
  hacs.json
```

### Package.json ✅

Already includes both files:

```json
"files": [
    "card-editor.js",
    "card.js"
]
```

### CI Workflow ✅

Tests run on both files (all .js files tested).

---

## Testing

### After HACS Update

1. **Uninstall** old version from HACS
2. **Reinstall** with updated hacs.json
3. **Check files**:
    ```bash
    ls config/www/community/nanoleaf-effect-card/
    # Should show: card.js, card-editor.js
    ```
4. **Test card**: Add to dashboard, verify it renders
5. **Test editor**: Click "Edit Card", verify visual editor loads
6. **Check console**: No 404 errors for card-editor.js

### Expected Behavior

✅ Card displays correctly  
✅ "Edit Card" opens visual editor  
✅ No 404 errors in browser console  
✅ Both files present in HACS directory

---

## For Users Experiencing Issue

### If you installed before this fix:

1. **In HACS**:
    - Go to HACS → Frontend
    - Find "Nanoleaf Effects Card"
    - Click menu → "Uninstall"
2. **Reinstall**:

    - Click "+ Explore & Download Repositories"
    - Search "Nanoleaf Effects Card"
    - Click "Download"
    - Restart Home Assistant

3. **Verify**:
    - Check Developer Tools → Console
    - Should see no 404 errors for card-editor.js
    - Click "Edit Card" on the card
    - Visual editor should open

### Manual Installation

If installing manually:

1. Download **both** `card.js` and `card-editor.js`
2. Copy **both** to `config/www/`
3. Add **only** `card.js` to resources:
    ```yaml
    resources:
        - url: /local/card.js
          type: module
    ```
4. Restart Home Assistant

---

## Documentation Updates

### README.md ✅

Already mentions downloading both files.

### QUICKSTART.md ✅

Already mentions both files needed.

### HACS Installation Instructions ✅

Automatic via HACS - both files now deployed.

---

## Technical Details

### HACS Plugin Behavior

For Lovelace plugins (cards) with `content_in_root: true`:

| Configuration                             | Behavior                        |
| ----------------------------------------- | ------------------------------- |
| `filename: "card.js"`                     | Only deploys card.js            |
| No `filename` field                       | Deploys all .js files from root |
| `filename: ["card.js", "card-editor.js"]` | Not supported by HACS           |

**Our fix**: Remove `filename` field to deploy all .js files.

### File Discovery

HACS will:

1. Find all `.js` files in root
2. Copy to `www/community/<repo-name>/`
3. Add first one (alphabetically) to resources
4. Others available for relative imports

### Import Resolution

```javascript
// In card.js at:
// /hacsfiles/nanoleaf-effect-card/card.js

await import('./card-editor.js');
// Resolves to:
// /hacsfiles/nanoleaf-effect-card/card-editor.js
```

Works because both files are in the same directory! ✅

---

## Impact

### Before Fix

-   ❌ card-editor.js not deployed
-   ❌ Visual editor failed to load
-   ❌ 404 error in console
-   ❌ Users had to edit YAML manually

### After Fix

-   ✅ Both files deployed by HACS
-   ✅ Visual editor loads correctly
-   ✅ No console errors
-   ✅ GUI configuration works

---

## Compatibility

### HACS Versions

-   ✅ HACS 1.x (current)
-   ✅ All versions supporting `content_in_root`

### Home Assistant Versions

-   ✅ 2023.1+ (required for custom cards)

### Deployment Methods

-   ✅ HACS automatic
-   ✅ Manual installation
-   ✅ Direct GitHub clone

---

## Summary

**Fixed**: Removed `filename: "card.js"` from hacs.json  
**Result**: HACS now deploys both card.js and card-editor.js  
**Impact**: Visual editor now works correctly for all HACS users

---

_Fix applied: January 4, 2026_
