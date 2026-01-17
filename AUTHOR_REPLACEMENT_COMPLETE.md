# ✅ Author Name Replacement Complete!

## Summary

The `init.sh` script now automatically replaces author names (luckydonald/luckylucy) with your GitHub username when it differs from the defaults.

## 🎯 How It Works

### Detection Logic
```bash
if [ "$GITHUB_USER" != "luckydonald" ] && [ "$GITHUB_USER" != "luckylucy" ]; then
    # Replace author names
fi
```

- If GitHub username is `luckydonald` → **No replacement** (keep as-is)
- If GitHub username is `luckylucy` → **No replacement** (keep as-is)
- If GitHub username is anything else → **Replace both names**

### Replacement Patterns

The script handles various combinations and formats:

#### 1. Combined Attribution
```
# LICENSE file
"lucky lucy (aka. luckydonald)" → "your_username"
```

#### 2. JSON Arrays (Codeowners)
```json
// manifest.json
"codeowners": ["@luckydonald", "@luckylucy"]
↓
"codeowners": ["@your_username"]
```

#### 3. TOML Arrays (Authors)
```toml
# pyproject.toml
authors = [{ name = "luckydonald" }, { name = "luckylucy" }]
↓
authors = [{ name = "your_username" }]
```

#### 4. Simple Text
```
"author": "luckydonald"
↓
"author": "your_username"
```

#### 5. GitHub Handles
```
@luckydonald
↓
@your_username
```

## 📋 Files Affected

### 1. LICENSE
```
# Before
Copyright (c) 2026 lucky lucy (aka. luckydonald)

# After (with username "johndoe")
Copyright (c) 2026 johndoe
```

### 2. pyproject.toml
```toml
# Before
authors = [{ name = "luckydonald" }, { name = "luckylucy" }]

# After
authors = [{ name = "johndoe" }]
```

### 3. manifest.json
```json
// Before
"codeowners": ["@luckydonald", "@luckylucy"]

// After
"codeowners": ["@johndoe"]
```

### 4. package.json
```json
// Before
"author": "luckydonald"

// After
"author": "johndoe"
```

### 5. README.md
```markdown
<!-- Before -->
Created for the Home Assistant community by [@luckydonald](https://github.com/luckydonald)

<!-- After -->
Created for the Home Assistant community by [@johndoe](https://github.com/johndoe)
```

## 🔧 Sed Patterns Used

### Pattern Order (Most Specific First)
```bash
# 1. Combined attribution
-e "s/lucky lucy (aka\. luckydonald)/$GITHUB_USER/g"

# 2. JSON codeowners array
-e "s/@luckydonald\", \"@luckylucy/@$GITHUB_USER/g"

# 3. TOML authors array
-e "s/{ name = \"luckydonald\" }, { name = \"luckylucy\" }/{ name = \"$GITHUB_USER\" }/g"

# 4. GitHub handle with @
-e "s/@luckydonald/@$GITHUB_USER/g"

# 5. Quoted username
-e "s/\"luckydonald\"/\"$GITHUB_USER\"/g"

# 6. Bare username
-e "s/luckydonald/$GITHUB_USER/g"
-e "s/luckylucy/$GITHUB_USER/g"
```

### Why This Order?
- **Specific patterns first** prevent partial replacements
- **Combined patterns** before individual ones
- **Quoted patterns** before bare words
- Ensures clean, complete replacements

## 💡 Examples

### Example 1: Custom GitHub User
```bash
./scripts/init.sh

Enter plugin display name: My Plugin
Enter GitHub username [luckydonald]: johndoe

# Display shows:
ℹ Author name replacements:
  'luckydonald'            → 'johndoe'
  'luckylucy'              → 'johndoe'
  '@luckydonald'           → '@johndoe'
  'lucky lucy (aka. luckydonald)' → 'johndoe'

# Files updated:
LICENSE:        "Copyright (c) 2026 johndoe"
pyproject.toml: authors = [{ name = "johndoe" }]
manifest.json:  "codeowners": ["@johndoe"]
```

### Example 2: Keep Default (luckydonald)
```bash
./scripts/init.sh

Enter plugin display name: My Plugin
Enter GitHub username [luckydonald]: luckydonald

# No author replacement shown
# Files keep original:
LICENSE:        "Copyright (c) 2026 lucky lucy (aka. luckydonald)"
pyproject.toml: authors = [{ name = "luckydonald" }, { name = "luckylucy" }]
```

### Example 3: Use luckylucy
```bash
./scripts/init.sh

Enter plugin display name: My Plugin
Enter GitHub username [luckydonald]: luckylucy

# No author replacement shown
# Files keep original (luckylucy is a default)
```

### Example 4: Organization Account
```bash
./scripts/init.sh

Enter plugin display name: Company Widget
Enter GitHub username [luckydonald]: acme-corp

# Results:
LICENSE:        "Copyright (c) 2026 acme-corp"
pyproject.toml: authors = [{ name = "acme-corp" }]
manifest.json:  "codeowners": ["@acme-corp"]
GitHub URL:     https://github.com/acme-corp/hoass_company-widget.git
```

## 📊 Display Output

### When Replacements Happen
```
==================================================
File Replacement Configuration
==================================================

ℹ The following replacements will be made:
  'plugin_template'        → 'my_plugin'
  'PluginTemplate'         → 'MyPlugin'
  'PLUGIN_TEMPLATE'        → 'MY_PLUGIN'
  'plugin-template'        → 'my-plugin'
  'plugin-template-card'   → 'my-plugin-card'
  'Plugin Template'        → 'My Plugin'
  'hoass_plugin-template'  → 'hoass_my-plugin'
  GitHub URL               → 'https://github.com/johndoe/hoass_my-plugin.git'

ℹ Author name replacements:
  'luckydonald'            → 'johndoe'
  'luckylucy'              → 'johndoe'
  '@luckydonald'           → '@johndoe'
  'lucky lucy (aka. luckydonald)' → 'johndoe'

⚠ Ready to perform replacements in all files.
⚠ This operation will modify files in place!
```

### When No Replacements (Using Default)
```
==================================================
File Replacement Configuration
==================================================

ℹ The following replacements will be made:
  'plugin_template'        → 'my_plugin'
  ...
  GitHub URL               → 'https://github.com/luckydonald/hoass_my-plugin.git'

⚠ Ready to perform replacements in all files.
⚠ This operation will modify files in place!
```

## 🎯 Use Cases

### Personal Projects
```bash
# Your personal GitHub account
Enter GitHub username: johndoe

# Results in your name everywhere:
- LICENSE with your name
- Authors attributed to you
- Codeowners set to you
- GitHub URLs point to your repos
```

### Organization Projects
```bash
# Company/organization account
Enter GitHub username: acme-corp

# Results in org name:
- LICENSE with org name
- Authors attributed to org
- Codeowners set to org
- GitHub URLs point to org repos
```

### Contributing Back
```bash
# Keep template authors for contributions
Enter GitHub username: luckydonald

# Results:
- Original authors preserved
- Can contribute back to template
- Credits remain intact
```

### Forking Template
```bash
# Fork under your name
Enter GitHub username: yourname

# Results:
- Your name in all files
- Your GitHub URLs
- Your codeowners
- Ready to publish as yours
```

## ✨ Benefits

### For Users
- ✅ **Automatic attribution** - Your name everywhere
- ✅ **Correct URLs** - GitHub points to your repos
- ✅ **Professional** - Proper copyright notices
- ✅ **Complete** - All files updated

### For Template
- ✅ **Flexible** - Works with any username
- ✅ **Smart** - Keeps defaults when appropriate
- ✅ **Clean** - No manual find/replace needed
- ✅ **Comprehensive** - Catches all patterns

### For Attribution
- ✅ **Clear ownership** - Your name in LICENSE
- ✅ **HACS compatible** - Correct codeowners
- ✅ **Package metadata** - Correct authors in pyproject.toml
- ✅ **NPM compatible** - Correct author in package.json

## 🔍 Verification

After initialization with custom username:

```bash
# Check LICENSE
cat LICENSE
# Should show: Copyright (c) 2026 your_username

# Check pyproject.toml
grep authors pyproject.toml
# Should show: authors = [{ name = "your_username" }]

# Check manifest.json
grep codeowners custom_components/your_plugin/manifest.json
# Should show: "codeowners": ["@your_username"]

# Check package.json
grep author frontend/package.json
# Should show: "author": "your_username"

# Check README
grep Created README.md
# Should show: Created for the Home Assistant community by [@your_username]
```

## 🚫 What's NOT Replaced

### Template-Specific References
These remain as documentation/examples:
```markdown
# In documentation about the template
"This template was created by @luckydonald"
↓
(Kept as-is - refers to template origin)
```

Actually, with current implementation, ALL instances are replaced. If you want to keep template attribution in docs, you would need to manually add it back or exclude documentation files from processing.

## 💡 Best Practices

### 1. Use Your Real GitHub Username
```bash
# Good
Enter GitHub username: johndoe  # Your actual GitHub account

# Not ideal
Enter GitHub username: my-cool-name  # Doesn't match GitHub
```

### 2. For Organizations
```bash
# Use the organization username
Enter GitHub username: my-company

# Not individual account if publishing as org
```

### 3. For Contributions
```bash
# Keep defaults when contributing back
Enter GitHub username: luckydonald

# Or use luckylucy if preferred
```

### 4. Consistency
Make sure the GitHub username matches:
- Your actual GitHub account
- Where you'll publish the plugin
- HACS repository owner

## 🎉 Success!

The init.sh script now:
- ✅ **Detects** when GitHub user differs from defaults
- ✅ **Replaces** all instances of luckydonald/luckylucy
- ✅ **Handles** complex patterns (aka., arrays, etc.)
- ✅ **Preserves** defaults when appropriate
- ✅ **Shows** what will be replaced
- ✅ **Complete** coverage across all file types

**Your plugin will have the correct author attribution everywhere! 🚀**

---

**Implementation Date**: January 18, 2026
**Script**: scripts/init.sh
**Feature**: Automatic author name replacement
**Status**: ✅ Complete and tested

