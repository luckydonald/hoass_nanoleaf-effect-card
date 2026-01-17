### "Cannot find module 'homeassistant'"
→ Expected in dev environment, will work in Home Assistant

### "Cannot find module 'vue'"
→ Run `cd frontend_vue && npm install`

### Init script fails with "template not found"
→ Script now looks for `plugin_template`, not `template`

### Files still reference "alarm"
→ Run the grep commands above to find remaining references

## 📞 Need Help?

- Check TRANSFORMATION_COMPLETE.md for overview
- Check CLEANUP_SUMMARY.md for detailed changes
- Check scripts/README.md for init.sh documentation
- Look at the example files for correct patterns

## 🎉 When Complete

Mark this date: **{{ date }}**

Your Home Assistant Plugin Template is now:
- ✨ Generic and reusable
- 🧹 Clean of specific implementation code
- 📦 Ready to be cloned for new projects
- 🚀 Easy to initialize with `init.sh`

**You can now use this template to create unlimited HA plugins!**

---

Last updated: {{ date }}
# 📋 Post-Transformation Checklist

Use this checklist to verify everything is working correctly after the transformation.

## ✅ Immediate Actions Required

### 1. Replace alarm-specific Python files
```bash
cd /Users/user/Documents/programming/Python/HomeAssistant/hoass_template

# Replace models.py
mv custom_components/plugin_template/models_new.py custom_components/plugin_template/models.py

# Replace services.py
mv custom_components/plugin_template/services_new.py custom_components/plugin_template/services.py
```

### 2. Delete old/temporary files
```bash
# Delete old Vue component
rm frontend_vue/src/AlarmClockCard.vue

# Delete temporary files
rm -f custom_components/plugin_template/sensor_clean.py
rm -f custom_components/plugin_template/sensor_new.py
```

### 3. Verify file renames
- [x] Directory renamed: `custom_components/plugin_template/` ✅ (already done)
- [ ] Old AlarmClockCard.vue deleted
- [ ] New PluginTemplateCard.vue exists

## 🧪 Verification Steps

### Check File Contents

#### Python Backend
```bash
# Check manifest uses plugin_template
cat custom_components/plugin_template/manifest.json | grep '"domain"'
# Should show: "domain": "plugin_template"

# Check sensor.py is clean
grep -c "alarm" custom_components/plugin_template/sensor.py
# Should be 0

# Check models.py is clean (after replacement)
grep -c "Alarm" custom_components/plugin_template/models.py
# Should be 0 or 1 (only in docstring)

# Check services.py is clean (after replacement)
grep -c "alarm" custom_components/plugin_template/services.py
# Should be 0
```

#### Frontend
```bash
# Check package.json
cat frontend_vue/package.json | grep '"name"'
# Should show: "name": "plugin-template-card"

# Check vite.config.ts output
cat frontend_vue/vite.config.ts | grep "outDir"
# Should show: custom_components/plugin_template/www

# Check main.ts registrations
cat frontend_vue/src/main.ts | grep "customElements.define"
# Should show: plugin-template-card (not alarm-clock)

# Check Vue component exists
ls frontend_vue/src/PluginTemplateCard.vue
# Should exist

# Check old component is gone
ls frontend_vue/src/AlarmClockCard.vue 2>/dev/null
# Should not exist
```

#### Root Files
```bash
# Check HACS
cat hacs.json | grep '"name"'
# Should show: "name": "Plugin template"

# Check pyproject.toml
cat pyproject.toml | grep '^name'
# Should show: name = "hoass-plugin-template"
```

### Test Init Script
```bash
# Create a test directory
mkdir -p /tmp/test-init
cp -r . /tmp/test-init/
cd /tmp/test-init

# Run init script (dry run by canceling at confirmation)
./scripts/init.sh
# Enter "Test Plugin" as name
# Check auto-generated names look correct
# Cancel at confirmation (answer 'n')
# Verify no files were changed

cd - # Return to original directory
rm -rf /tmp/test-init
```

## 📝 Final Checks

### Code Quality
- [ ] No TypeScript errors in frontend (except missing dependencies warning)
- [ ] No Python import errors in backend (except missing homeassistant warning)
- [ ] All files use consistent naming (plugin_template, plugin-template, PluginTemplate)

### Documentation
- [ ] scripts/README.md uses correct examples
- [ ] scripts/TESTING.md has updated grep commands
- [ ] TRANSFORMATION_COMPLETE.md exists
- [ ] CLEANUP_SUMMARY.md exists

### Git Status
```bash
# Check what changed
git status

# Review changes
git diff

# See new files
git ls-files --others --exclude-standard
```

### Optional: Commit Changes
```bash
# Stage all changes
git add -A

# Commit with message
git commit -m "Transform template: Remove alarm-specific code, use generic plugin_template naming"

# Or use the commit script
./scripts/commit.sh
```

## 🎯 Quick Verification Commands

Run this one-liner to check everything:

```bash
echo "=== Checking Files ===" && \
  echo "Manifest domain:" && grep '"domain"' custom_components/plugin_template/manifest.json && \
  echo "\nPackage name:" && grep '"name"' frontend_vue/package.json | head -1 && \
  echo "\nHACS name:" && grep '"name"' hacs.json && \
  echo "\nVue component:" && ls -1 frontend_vue/src/*Card.vue && \
  echo "\nCustom element:" && grep "customElements.define" frontend_vue/src/main.ts && \
  echo "\n=== Verification Complete ==="
```

Expected output:
```
=== Checking Files ===
Manifest domain:
  "domain": "plugin_template",

Package name:
  "name": "plugin-template-card",

HACS name:
  "name": "Plugin template",

Vue component:
frontend_vue/src/PluginTemplateCard.vue

Custom element:
customElements.define('plugin-template-card', PluginTemplateCardElement);
customElements.define('plugin-template-card-editor', PluginTemplateCardEditor);

=== Verification Complete ===
```

## ✨ Success Criteria

Your template is ready when:
- ✅ All "alarm" references are removed
- ✅ All "calendar" references (except in old git history) are removed
- ✅ All files use `plugin_template` / `plugin-template` / `PluginTemplate`
- ✅ Frontend builds successfully
- ✅ Python imports resolve (in proper HA environment)
- ✅ Init script can be run on a copy
- ✅ No AlarmClockCard.vue exists
- ✅ PluginTemplateCard.vue exists and is used

## 🐛 Troubleshooting

### "AlarmClockCard is not defined"
→ You forgot to delete AlarmClockCard.vue or there's a stray import


