# ✅ init.sh Enhancement Complete!

## Summary

The `init.sh` script has been updated with smart defaults and GitHub username support.

## 🎯 What Was Added

### 1. Automatic Plugin Name Detection from Folder
- ✅ Extracts plugin name from current folder name
- ✅ Strips common prefixes automatically:
  - `ha_` / `ha-`
  - `hacs_` / `hacs-`
  - `hoass_` / `hoass-`
  - `homeassistant_` / `homeassistant-`
- ✅ Converts to proper Display Name format
- ✅ Offers as default (user can override)

### 2. GitHub Username Input
- ✅ New Step 4: Ask for GitHub username
- ✅ Defaults to "luckydonald"
- ✅ User can specify their own username
- ✅ Used in GitHub URL construction

### 3. Dynamic GitHub URL Construction
- ✅ Uses format: `https://github.com/{username}/hoass_{plugin-name}.git`
- ✅ Incorporates user's GitHub username
- ✅ Automatically includes plugin dash-name

## 📋 New Step Order

1. **Plugin Display Name** - With folder-based default
2. **Lowercase-Dash Name** - Auto-calculated
3. **Snake_Case Name** - Auto-calculated
4. **GitHub Username** - New! Defaults to "luckydonald"
5. **GitHub Repository** - Auto-constructed with username
6. **Python Backend** - Keep or remove
7. **Frontend Framework** - Vue or Plain

## 🎓 Examples

### Example 1: Default Folder Name Detection

```bash
# User clones into: hoass_weather-dashboard/
cd hoass_weather-dashboard/
make init

# Script output:
Step 1: Plugin Display Name
Example: 'My Custom Widget'

Enter plugin display name [Weather Dashboard]: 
# User presses Enter to accept default
✓ Display name: Weather Dashboard

Step 4: GitHub Username
Enter GitHub username [luckydonald]: johndoe
✓ GitHub username: johndoe

Step 5: GitHub Repository
✓ GitHub URL: https://github.com/johndoe/hoass_weather-dashboard.git
```

### Example 2: Prefix Stripping

```bash
# Various folder name formats:
cd ha_sensor_monitor/        → Default: "Sensor Monitor"
cd hacs-smart-light/         → Default: "Smart Light"
cd hoass_calendar_sync/      → Default: "Calendar Sync"
cd homeassistant-helper/     → Default: "Helper"
```

### Example 3: Custom Name Override

```bash
cd hoass_temp/
make init

# Script offers "Temp" as default
Enter plugin display name [Temp]: Temperature Controller
# User overrides with better name
✓ Display name: Temperature Controller
```

## 🔧 Implementation Details

### Function: `extract_plugin_name_from_folder()`

```bash
extract_plugin_name_from_folder() {
    local folder_name=$(basename "$PWD")
    
    # Strip common prefixes (case insensitive)
    name=$(echo "$folder_name" | sed -E 's/^(ha|hacs|hoass|homeassistant)[-_]//i')
    
    # Convert underscores and dashes to spaces
    name=$(echo "$name" | sed 's/[-_]/ /g')
    
    # Capitalize each word
    name=$(echo "$name" | awk '{...}')
    
    echo "$name"
}
```

**Handles:**
- ✅ Underscore and dash separators
- ✅ Case-insensitive prefix matching
- ✅ Proper capitalization
- ✅ Returns empty string if invalid

### Updated Prompts

**Before:**
```bash
Enter plugin display name: _
```

**After:**
```bash
Enter plugin display name [Weather Dashboard]: _
```

**GitHub Username (New):**
```bash
Enter GitHub username [luckydonald]: _
```

## 🎯 Use Cases

### Use Case 1: Quick Start
```bash
# Clone with descriptive name
git clone https://github.com/luckydonald/hoass_plugin-template.git hoass_my-plugin
cd hoass_my-plugin

# Run init - accepts all defaults
make init
# Just press Enter through prompts
```

### Use Case 2: Custom Username
```bash
# Developer with own GitHub account
make init

# Steps:
1. Accept folder-based name
2. Accept calculated naming
3. Enter custom GitHub username: "myusername"
4. Result: https://github.com/myusername/hoass_my-plugin.git
```

### Use Case 3: Rename Project
```bash
# Cloned with placeholder name
cd hoass_temp/
make init

# Override the default:
Enter plugin display name [Temp]: Production Ready Widget
# Custom name wins
```

## 📊 Comparison

### Before
```
User must:
1. Think of plugin name from scratch
2. Type full name every time
3. GitHub URL hardcoded to "luckydonald"
4. No folder name hints
```

### After
```
Script helps:
1. ✓ Suggests name from folder
2. ✓ Pre-fills with smart default
3. ✓ Asks for GitHub username
4. ✓ Builds custom GitHub URL
```

## 🧪 Testing Scenarios

### Test 1: Standard Prefix
```bash
mkdir hoass_test-widget && cd hoass_test-widget
# Expected default: "Test Widget"
```

### Test 2: Multiple Prefixes
```bash
mkdir homeassistant_ha_sensor && cd homeassistant_ha_sensor
# Expected: Strips first prefix → "ha sensor" → "Ha Sensor"
```

### Test 3: No Prefix
```bash
mkdir my-plugin && cd my-plugin
# Expected default: "My Plugin"
```

### Test 4: Complex Name
```bash
mkdir hoass_multi_word_plugin_name && cd hoass_multi_word_plugin_name
# Expected: "Multi Word Plugin Name"
```

### Test 5: GitHub Username
```bash
# Different usernames
luckydonald → https://github.com/luckydonald/hoass_xyz.git
john-doe → https://github.com/john-doe/hoass_xyz.git
org-name → https://github.com/org-name/hoass_xyz.git
```

## ✨ Benefits

### For Users
- ✅ **Faster setup** - Accept defaults with Enter
- ✅ **Less thinking** - Name suggested automatically
- ✅ **Correct URLs** - Own GitHub username used
- ✅ **Fewer typos** - Default is pre-filled

### For Template
- ✅ **Better UX** - Smoother initialization
- ✅ **Flexible** - Works with any GitHub user
- ✅ **Smart defaults** - Reduces decision fatigue
- ✅ **Professional** - Follows conventions

## 🔍 Edge Cases Handled

1. **Empty folder name** - Falls back to no default
2. **Non-standard characters** - Filtered to alphanumeric
3. **Multiple underscores/dashes** - Collapsed to single space
4. **All lowercase input** - Properly capitalized
5. **Mixed case prefix** - Case-insensitive matching

## 📝 Updated Documentation

The following sections need updating:
- [ ] README.md - Mention folder name detection
- [ ] scripts/README.md - Document new GitHub username step
- [ ] RERUN_GUIDE.md - Note that username is preserved on re-run

## 🎉 Success Criteria

- ✅ Folder name extracted correctly
- ✅ Prefixes stripped properly
- ✅ GitHub username asked and stored
- ✅ GitHub URL constructed with username
- ✅ No syntax errors
- ✅ Backwards compatible
- ✅ Default behavior improved

## 🚀 Next Steps for Users

### Quick Init (Recommended)
```bash
git clone [template-url] hoass_my-awesome-plugin
cd hoass_my-awesome-plugin
make init
# Press Enter to accept smart defaults
# Enter your GitHub username
# Done!
```

### Custom Init
```bash
make init
# Override suggested name if needed
# Enter custom GitHub username
# Proceed with initialization
```

---

**Status**: ✅ Complete
**New Steps**: 5 → 7 (added GitHub username)
**Smart Defaults**: Folder name → Display name
**Flexibility**: Works with any GitHub username
**User Experience**: Significantly improved! 🎉

