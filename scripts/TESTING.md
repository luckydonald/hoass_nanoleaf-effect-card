# init.sh Testing Checklist

## Pre-Test Setup

- [ ] Clone/copy the hoass_template repository to a test location
- [ ] Ensure both `frontend_vue/` and `custom_components/template/` exist
- [ ] Make sure the script is executable: `chmod +x scripts/init.sh`

## Test Cases

### Test 1: Full Stack (Python Backend + Vue Frontend)
- [ ] Run: `./scripts/init.sh`
- [ ] Enter display name: "Test Widget"
- [ ] Accept default lowercase-dash: "test-widget"
- [ ] Accept default snake_case: "test_widget"
- [ ] Keep Python backend: "y"
- [ ] Choose Vue frontend: "vue"
- [ ] Confirm initialization
- [ ] Confirm file replacements

**Expected Results:**
- [ ] `custom_components/test_widget/` directory exists
- [ ] `frontend/` directory exists (Vue-based)
- [ ] `pyproject.toml` exists and contains "test_widget"
- [ ] `hacs.json` contains "Test Widget" and "test-widget.zip"
- [ ] `frontend/package.json` contains "test-widget-card"
- [ ] `frontend/src/TestWidgetCard.vue` exists
- [ ] `frontend/vite.config.ts` references `test_widget`
- [ ] No `.bak` files remain
- [ ] No `template` references in modified files

### Test 2: Frontend Only (No Python Backend)
- [ ] Fresh copy of template
- [ ] Run: `./scripts/init.sh`
- [ ] Enter display name: "Simple Card"
- [ ] Accept defaults
- [ ] Remove Python backend: "n"
- [ ] Choose Vue frontend: "vue"
- [ ] Confirm

**Expected Results:**
- [ ] `custom_components/` directory removed or empty
- [ ] `pyproject.toml` removed
- [ ] `frontend/` directory exists
- [ ] `hacs.json` updated correctly

### Test 3: Custom Names (Non-default)
- [ ] Fresh copy of template
- [ ] Run: `./scripts/init.sh`
- [ ] Enter display name: "My Great Plugin"
- [ ] Override dash name: "great-plugin"
- [ ] Override snake name: "great_plugin"
- [ ] Keep backend
- [ ] Choose Vue frontend

**Expected Results:**
- [ ] All files use "great-plugin" and "great_plugin" appropriately
- [ ] GitHub URL: `https://github.com/luckydonald/hoass_great-plugin.git`

### Test 4: Cancellation Tests
- [ ] Fresh copy of template
- [ ] Run: `./scripts/init.sh`
- [ ] Go through prompts
- [ ] Cancel at configuration summary: "n"

**Expected Results:**
- [ ] No files modified
- [ ] Script exits cleanly

- [ ] Run again, proceed to file replacement confirmation
- [ ] Cancel at file replacement: "n"

**Expected Results:**
- [ ] Directories renamed (frontend, custom_components)
- [ ] Files not yet modified
- [ ] Can continue manually if needed

### Test 5: Edge Cases
- [ ] Test with plugin name containing special characters: "My-Cool_Plugin!"
- [ ] Test with single-word name: "Widget"
- [ ] Test with all lowercase name: "mywidget"
- [ ] Test with numeric characters: "Widget2000"

### Test 6: macOS vs Linux
- [ ] Run on macOS (if available)
- [ ] Verify sed commands work correctly
- [ ] Run on Linux (if available)
- [ ] Verify sed commands work correctly

## Post-Test Verification

### File Content Checks
- [ ] Check `custom_components/{name}/manifest.json` - domain field updated
- [ ] Check `custom_components/{name}/const.py` - domain read from manifest
- [ ] Check `frontend/package.json` - name, main, and repository fields
- [ ] Check `frontend/vite.config.ts` - build output path and component name
- [ ] Check `frontend/src/main.ts` - import statement for renamed component
- [ ] Check `hacs.json` - name and filename fields
- [ ] Check `Makefile` - references updated (if template specific)

### String Presence Checks
Run grep to ensure no unwanted strings remain:
```bash
# Should return minimal results in modified files:
grep -r "plugin_template" custom_components/{name}/ 2>/dev/null  # Should be replaced
grep -r "PluginTemplate" custom_components/{name}/ 2>/dev/null  # Should be replaced
grep -r "plugin-template" . 2>/dev/null  # Should be replaced
```

### Build Tests
- [ ] `cd frontend && npm install` (if Vue)
- [ ] `npm run build`
- [ ] Verify output in `custom_components/{name}/www/`
- [ ] Check generated filename matches `{name}-card.js`

## Known Issues / Notes

- Word boundary `\b` in sed may not work on all systems
- `frontend_plain` directory doesn't exist yet in template
- Script assumes specific file structure
- Some hardcoded patterns may need adjustment based on template evolution

## Cleanup After Testing

```bash
# Remove test directories
rm -rf /path/to/test-copies

# If testing in original repo, restore from git
git reset --hard HEAD
git clean -fd
```

