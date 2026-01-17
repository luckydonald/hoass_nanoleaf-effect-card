# ✅ init.sh Re-run Safety Complete!

## Summary

The `init.sh` script has been updated to be **completely safe to re-run** on already initialized plugins!

## 🎯 What Was Changed

### 1. Smart Detection
- ✅ Detects if running on fresh template or initialized plugin
- ✅ Shows different messages for first run vs re-run
- ✅ Reads existing plugin name from manifest.json

### 2. Safe Directory Operations
- ✅ New `safe_move_directory()` function
- ✅ Never overwrites existing directories
- ✅ Offers to merge new files into existing directories
- ✅ Interactive file-by-file selection (y/n/selective)

### 3. Intelligent File Processing
- ✅ Skips already processed files automatically
- ✅ Only processes files that still contain template patterns
- ✅ Detects target plugin name already in files
- ✅ Creates backups (.bak) before changes

### 4. Better User Experience
- ✅ Clear feedback about what's happening
- ✅ Different summaries for first run vs re-run
- ✅ Lists new files before copying
- ✅ Allows selective file copying

### 5. Backend Removal Safety
- ✅ Checks for both `plugin_template` and renamed directories
- ✅ Asks before removing existing backend
- ✅ Updates KEEP_BACKEND flag if user says no

### 6. Vue Component Handling
- ✅ Checks if component already renamed
- ✅ Asks before overwriting existing component
- ✅ Option to keep existing version

## 📁 New Files Created

1. **RERUN_GUIDE.md** - Complete guide for re-running the script
   - Overview and use cases
   - Safety features explained
   - Example scenarios
   - Troubleshooting
   - Best practices

2. **Updated scripts/README.md** - Now mentions re-run capability

## 🔧 Key Functions Added

### `safe_move_directory(src, dest, desc)`

```bash
# Safely moves or merges directories
# - If dest exists: offers to copy new files
# - If dest doesn't exist: simple rename
# - Interactive file selection (y/n/selective)
```

### Enhanced `replace_in_file(file)`

```bash
# Now includes smart detection:
# - Checks if file already has target name
# - Checks if file still has template patterns
# - Skips if already processed
# - Only replaces what needs replacing
```

## 🎭 Use Cases Now Supported

### 1. Update with New Template Files

```bash
# Template repo added new test files
./scripts/init.sh

# Output shows:
Found 5 new file(s) in template:
  - tests/test_new.py
  - frontend/tests/new.test.ts
  ...
Copy these files? (y/n/selective)
```

### 2. Add Backend to Frontend-Only Plugin

```bash
# Initially chose no backend
# Now want to add it
./scripts/init.sh
# Answer "yes" to Python backend
# New files offered automatically
```

### 3. Recover from Partial Init

```bash
# Init was interrupted
./scripts/init.sh
# Picks up where it left off
# Processes remaining files
```

### 4. Migrate Old Plugin

```bash
# Copy old plugin files
# Run init to adapt to new structure
./scripts/init.sh
# Choose which new files to add
```

## 🛡️ Safety Features

### Non-Destructive
- ❌ Never overwrites without asking
- ✅ Always creates .bak backups
- ✅ Preserves your custom code
- ✅ Skips already processed files

### Smart Detection
```bash
# Detects already processed files
if grep -q "$SNAKE_NAME" "$file"; then
    if ! grep -q "plugin_template" "$file"; then
        print_info "Skipped (already processed): $file"
        return
    fi
fi
```

### Interactive Control
- Choose to copy **all** new files: `y`
- Choose to skip **all** new files: `n`  
- Choose **per file**: `selective` or `s`

### Clear Feedback
- ℹ Info messages (blue)
- ✓ Success messages (green)
- ⚠ Warning messages (yellow)
- ✗ Error messages (red)

## 📊 Behavior Comparison

### First Run (Fresh Template)
```bash
./scripts/init.sh

Home Assistant Plugin Template Initializer
===========================================

Working directory: /path/to/template

Step 1: Plugin Display Name
Enter plugin display name: My Plugin

# ... full initialization process ...

✓ Your new Home Assistant plugin has been initialized!
```

### Re-run (Already Initialized)
```bash
./scripts/init.sh

Home Assistant Plugin Template Initializer
===========================================

⚠ This appears to be an already initialized plugin
ℹ Detected existing plugin: my_plugin
ℹ Existing display name: My Plugin

Step 1: Plugin Display Name
Enter plugin display name [My Plugin]: 

# ... only processes new/changed files ...

✓ Your Home Assistant plugin has been updated!
ℹ Re-run completed - template files updated
```

## 🧪 Testing the Re-run

### Test 1: Re-run Without Changes
```bash
./scripts/init.sh
# Should complete quickly
# Should show "already processed" for files
```

### Test 2: Add New Test File
```bash
# Add new file to template
touch tests/test_new.py

# Re-run
./scripts/init.sh
# Should offer to copy test_new.py
```

### Test 3: Partial Processing
```bash
# Manually add plugin_template pattern to a file
echo "plugin_template" >> custom_components/my_plugin/sensor.py

# Re-run
./scripts/init.sh
# Should process that file again
```

## 📚 Documentation

1. **RERUN_GUIDE.md** - Comprehensive re-run guide
   - When to re-run
   - What happens
   - Safety features
   - Examples
   - Troubleshooting

2. **scripts/README.md** - Updated with re-run info

3. **Script comments** - Improved inline documentation

## ✨ Benefits

### For Template Maintainers
- ✅ Can add new features to template
- ✅ Users can easily update existing plugins
- ✅ No manual merge conflicts

### For Plugin Developers
- ✅ Keep plugins up-to-date with template
- ✅ Add features incrementally
- ✅ No fear of breaking existing code
- ✅ Easy to experiment

### For Everyone
- ✅ Safe to run multiple times
- ✅ Clear feedback at every step
- ✅ No data loss
- ✅ Full control over changes

## 🎯 Next Steps

### For Users

1. **Try re-running on your plugin**:
   ```bash
   cd ~/my-ha-plugin
   ./scripts/init.sh
   ```

2. **Review the RERUN_GUIDE.md**:
   ```bash
   cat RERUN_GUIDE.md
   ```

3. **Update from template changes**:
   ```bash
   git remote add template https://github.com/...
   git fetch template
   ./scripts/init.sh
   ```

### For Template Development

1. **Add new files** - They'll be offered to existing users
2. **Update configs** - Safe to push updates
3. **Improve structure** - Users can adopt changes

## 🎉 Success!

The init.sh script is now:
- ✅ **Safe to re-run** any number of times
- ✅ **Smart** about detecting state
- ✅ **Interactive** with clear choices
- ✅ **Non-destructive** by default
- ✅ **Well-documented** with examples
- ✅ **Production-ready** for template evolution

**Your template can now evolve and users can keep up! 🚀**

---

**Created**: January 17, 2026
**Script**: scripts/init.sh
**Guide**: RERUN_GUIDE.md
**Status**: ✅ Complete and tested

