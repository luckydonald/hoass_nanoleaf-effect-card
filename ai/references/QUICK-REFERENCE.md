# Quick Reference - Nanoleaf Effect Card

Quick reference for developers and maintainers.

## 📁 File Locations

### Core Files

-   `card.js` - Main implementation (540 lines, includes editor)
-   `demo.html` - Standalone demo with ha-icon polyfill
-   `card-editor.js` - Reference only (editor bundled in card.js)

### User Documentation (Root)

-   `README.md` - Full documentation
-   `QUICKSTART.md` - Setup guide
-   `examples.md` - Configuration examples
-   `CONTRIBUTING.md` - Contribution guide
-   `DEVELOPMENT.md` - Developer guide
-   `CHANGELOG.md` - Version history
-   `info.md` - HACS info page

### AI Documentation (ai/)

-   `ai/STATUS.md` - Final status report
-   `ai/COMPLETE.md` - Completion summary
-   `ai/PROJECT.md` - Project structure
-   `ai/EDITOR-FIX.md` - Visual editor fix
-   `ai/EDITOR-VERIFICATION.md` - Testing checklist
-   `ai/prompt.md` - Original requirements

## 🚀 Common Tasks

### Development

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (port 3000)
npm test                # Run tests
npm run prettier        # Format code
npm run check-prettier  # Check formatting
```

### Testing Locally

```bash
npm run dev
# Open http://localhost:3000/demo.html
```

### Testing in Home Assistant

Add to Lovelace resources:

```yaml
resources:
    - url: http://YOUR_IP:3000/card.js
      type: module
```

### Making Changes

1. Edit `card.js`
2. Run `npm test`
3. Run `npm run prettier`
4. Test in demo.html or Home Assistant
5. Update CHANGELOG.md
6. Commit and push

## 🐛 Common Issues

### Visual Editor Not Working

**Symptom**: "setConfig is not a function" error  
**Solution**: Editor is now bundled in card.js (fixed!)  
**Details**: See `ai/EDITOR-FIX.md`

### Icons Not Showing in Demo

**Symptom**: No icons in demo.html  
**Solution**: ha-icon polyfill already added  
**Details**: Uses https://mdi.bessarabov.com CDN

### HACS Installation Fails

**Symptom**: Can't find category  
**Solution**: Use "Dashboard" not "Lovelace"  
**Details**: Updated in README.md and QUICKSTART.md

## 📝 Configuration Quick Copy

### Basic Button Layout

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
effects:
    - name: 'Rainbow'
      icon: 'mdi:rainbow'
      color: '#FF00FF'
```

### Dropdown Layout

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: dropdown
effects:
    - name: 'Rainbow'
      icon: 'mdi:rainbow'
      color: '#FF00FF'
```

### Multi-Color Effect

```yaml
effects:
    - name: 'Sunrise'
      icon: 'mdi:weather-sunset-up'
      colors:
          - '#FFA500'
          - '#FFFF00'
          - '#FF4500'
```

## 🔍 Code Structure

### card.js Structure

```
Lines 1-27:   Class definition & constructor
Lines 28-32:  setConfig method
Lines 33-37:  set hass method
Lines 38-40:  getCardSize method
Lines 42-63:  render method
Lines 65-154: getStyles method
Lines 156-183: renderDropdown method
Lines 185-233: renderButtons method
Lines 235-242: getEffectColors method
Lines 244-256: getContrastColor method
Lines 258-281: attachEventListeners method
Lines 283-313: handleEffectSelect method
Lines 316-327: Static methods (getConfigElement, getStubConfig)
Lines 329:    Register NanoleafEffectCard

Lines 331-336: Editor constructor
Lines 338-341: Editor setConfig
Lines 343-350: Editor configChanged
Lines 352-451: Editor render
Lines 453-522: Editor attachEventListeners
Lines 524:    Register NanoleafEffectCardEditor

Lines 526-533: Register with Home Assistant
Lines 535-540: Console info message
```

## 📊 Key Statistics

-   **Total Lines**: 540 (card.js)
-   **Card Code**: 330 lines
-   **Editor Code**: 190 lines
-   **Documentation**: 1500+ lines
-   **Test Cases**: 8+
-   **Examples**: 10+

## 🎨 Features Checklist

Display Modes:

-   ✅ Button grid
-   ✅ Dropdown

Visual Features:

-   ✅ Single colors
-   ✅ Multi-colors
-   ✅ Color animations
-   ✅ Custom icons
-   ✅ Text contrast
-   ✅ Off button

Customization:

-   ✅ Global button style
-   ✅ Per-effect style
-   ✅ Show/hide icons
-   ✅ Show/hide names

Integration:

-   ✅ Entities cards
-   ✅ Tile cards
-   ✅ Visual editor
-   ✅ YAML mode
-   ✅ HACS compatible

## 🔧 Maintenance

### Update Version

1. Update `package.json` version
2. Update version in `card.js` console.info
3. Update `CHANGELOG.md`
4. Create git tag
5. Push to GitHub
6. Create release

### Add New Feature

1. Edit `card.js`
2. Update tests in `card.test.js`
3. Update documentation
4. Update `CHANGELOG.md`
5. Test thoroughly
6. Submit PR

### Fix Bug

1. Identify issue
2. Write test case
3. Fix in `card.js`
4. Verify test passes
5. Update `CHANGELOG.md`
6. Submit PR

## 📞 Quick Links

-   **GitHub**: https://github.com/luckydonald/hoass_nanoleaf-effect-card
-   **Issues**: https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues
-   **MDI Icons**: https://pictogrammers.com/library/mdi/

## 💡 Tips

1. **Always test in demo.html first** - Faster than Home Assistant
2. **Use browser dev tools** - Console, Network, Elements tabs
3. **Clear cache often** - Ctrl+Shift+R or Cmd+Shift+R
4. **Check effect_list** - In HA Developer Tools → States
5. **Format before commit** - `npm run prettier`
6. **Read error messages** - Console errors are helpful
7. **Test both modes** - Buttons and dropdown
8. **Test with real device** - Before releasing

## 🎯 Success Indicators

Working correctly when:

-   ✅ No console errors
-   ✅ Visual editor loads
-   ✅ Effects switch properly
-   ✅ Icons display
-   ✅ Colors animate
-   ✅ Off button works
-   ✅ Works in Entities card
-   ✅ Works in Tile card

## 📝 Notes

-   Editor is bundled in card.js (not separate file)
-   card-editor.js is for reference only
-   Demo uses ha-icon polyfill
-   Single file deployment (card.js only)
-   No build step required
-   All dependencies bundled

---

**Last Updated**: January 4, 2026  
**Version**: 0.0.0 (Ready for v1.0.0)  
**Status**: Production Ready ✅
