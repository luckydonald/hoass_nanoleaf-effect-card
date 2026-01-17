# Re-running init.sh

## Overview

The `init.sh` script is now **safe to re-run** on an already initialized plugin. This is useful when:
- The template repository has been updated with new features
- You want to add new template files to your existing plugin
- You need to update configuration files

## What Happens on Re-run

### Detection

The script automatically detects if it's being run on:
1. **Fresh template** - First time initialization
2. **Already initialized plugin** - Re-run on existing plugin

### Safe Operations

When re-running on an initialized plugin:

1. **Existing files are preserved**
   - Files that have already been processed are skipped
   - No existing code is overwritten without permission

2. **New files are offered**
   - Any new files from template updates are detected
   - You're asked whether to copy each new file

3. **Directory merging**
   - If directories already exist, they're merged (not replaced)
   - You choose which new files to add

4. **Name replacements**
   - Only processes files that still contain template patterns
   - Already processed files are automatically skipped

## Example Re-run Scenarios

### Scenario 1: Template Added New Test Files

```bash
$ ./scripts/init.sh

# Output:
⚠ This appears to be an already initialized plugin
ℹ Detected existing plugin: my_plugin
ℹ Re-running will update files and add any new template files

# ... prompts for confirmation ...

ℹ Found 3 new file(s) in template:
  - tests/test_new_feature.py
  - frontend/tests/new.test.ts
  - docs/NEWFILE.md

Copy these files to your plugin? (y/n/selective) [y]: s

Copy tests/test_new_feature.py? (y/n) [y]: y
✓ Copied: tests/test_new_feature.py

Copy frontend/tests/new.test.ts? (y/n) [y]: y
✓ Copied: frontend/tests/new.test.ts

Copy docs/NEWFILE.md? (y/n) [y]: n
ℹ Skipped: docs/NEWFILE.md
```

### Scenario 2: Re-running Without Changes

```bash
$ ./scripts/init.sh

# If no new files:
ℹ No new files to copy from template
✓ Re-run completed - template files updated and new files added
```

### Scenario 3: Adding Backend to Frontend-Only Plugin

```bash
$ ./scripts/init.sh

# When asked about Python backend:
Do you need a Python backend? (y/n) [y]: y

ℹ Found 15 new file(s) in template:
  - custom_components/plugin_template/__init__.py
  - custom_components/plugin_template/sensor.py
  - tests/test_init.py
  ...

Copy these files to your plugin? (y/n/selective) [y]: y
```

## Safety Features

### 1. Non-Destructive

- **Never overwrites** existing files without asking
- **Preserves your changes** in existing files
- **Backs up files** before making changes (`.bak` files)

### 2. Smart Detection

```bash
# Checks for already processed files
if grep -q "$SNAKE_NAME" "$file"; then
    if ! grep -q "plugin_template" "$file"; then
        print_info "Skipped (already processed): $file"
        return
    fi
fi
```

### 3. Interactive Choices

- **Copy all new files**: `y`
- **Skip all new files**: `n`
- **Choose per file**: `selective` or `s`

### 4. Directory Handling

When a directory already exists:
```bash
if [ -d "$dest" ]; then
    print_warning "Directory already exists"
    print_info "Will copy any new files from template..."
    # Lists new files
    # Asks what to do
fi
```

## Common Use Cases

### Update Template Files

```bash
# In your plugin directory
cd ~/my-ha-plugin

# Pull latest template
git remote add template https://github.com/luckydonald/hoass_plugin-template.git
git fetch template
git checkout template/main -- scripts/ tests/ frontend_vue/tests/

# Re-run init
./scripts/init.sh
```

### Add Missing Test Files

```bash
# Copy test structure from template
cp -r /path/to/template/tests ./
cp -r /path/to/template/frontend_vue/tests ./frontend/tests/

# Run init to adapt them
./scripts/init.sh
# Choose to process the test files
```

### Migrate Old Plugin

```bash
# Copy your old plugin files
cp -r ~/old-plugin/custom_components/my_plugin ./custom_components/
cp -r ~/old-plugin/frontend ./

# Run init to get new template features
./scripts/init.sh
# Select which new files to add
```

## What Gets Updated

### Always Updated (if present)
- Configuration files (`pyproject.toml`, `package.json`, etc.)
- Manifest files with correct domain
- Build configurations

### Selectively Updated
- Test files (asks per file)
- Documentation (asks per file)
- Source files (only if they still have template patterns)

### Never Updated Without Permission
- Your custom component code
- Your Vue components (except PluginTemplateCard.vue)
- Your tests
- README.md (if customized)

## Troubleshooting

### "File not found" warnings

**Cause**: File doesn't exist in your plugin
**Solution**: This is normal - the file was removed or never existed

### Script wants to overwrite my changes

**Cause**: File still contains template patterns
**Solution**: 
1. Review the file
2. Manually remove any `plugin_template` references
3. Re-run script (it will skip the file)

### Too many prompts

**Cause**: Many new files in template
**Solution**: Use `y` to copy all, or `n` to skip all

### Directory merge conflicts

**Cause**: File exists with different content
**Solution**: Script will ask - review both versions before deciding

## Best Practices

### 1. Review Before Running

```bash
# Check what's different in template
git diff template/main scripts/init.sh
```

### 2. Backup First

```bash
# Create a branch
git checkout -b before-template-update

# Or commit your changes
git add -A
git commit -m "Before template update"
```

### 3. Test After Re-run

```bash
# After re-running
make test
make lint
```

### 4. Review Changes

```bash
# See what changed
git diff

# Review specific files
git diff custom_components/
```

## Configuration Files

These are safe to update on re-run:
- `pyproject.toml` - Python dependencies
- `package.json` - Node dependencies  
- `Makefile` - Build commands
- `vitest.config.ts` - Test config
- `.gitignore` - Git ignores

These require review:
- `README.md` - Often customized
- `LICENSE` - If changed
- `manifest.json` - If customized

## Exit Codes

- `0` - Success
- `1` - Error or user cancellation
- `2` - Invalid state (shouldn't happen)

## Logging

The script provides clear feedback:
- ℹ Info (blue)
- ✓ Success (green)
- ⚠ Warning (yellow)
- ✗ Error (red)

Watch for warnings about:
- Already initialized
- Files already exist
- Skipped operations

## Summary

The re-run capability makes it safe to:
- ✅ Update your plugin with new template features
- ✅ Add test infrastructure to existing plugins
- ✅ Merge template improvements
- ✅ Recover from partial initializations
- ✅ Experiment without risk

**The init script is now a maintenance tool, not just a one-time setup!**

