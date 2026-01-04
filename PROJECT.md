# Nanoleaf Effect Card - Project Overview

A complete HACS-compatible Home Assistant custom card for controlling Nanoleaf light effects.

## 📁 Project Structure

```
hoass_nanoleaf-effect-card/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous Integration
│   │   └── release.yml               # Release automation
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md             # Bug report template
│   │   └── feature_request.md        # Feature request template
│   └── pull_request_template.md      # PR template
├── .husky/
│   └── pre-commit                    # Git pre-commit hook
├── card.js                           # Main card implementation ⭐
├── card-editor.js                    # Visual configuration editor
├── card.test.js                      # Unit tests
├── demo.html                         # Standalone demo page
├── hacs.json                         # HACS integration config
├── package.json                      # NPM package config
├── vitest.config.js                  # Test configuration
├── pyproject.toml                    # Python project config
├── .prettierrc                       # Code formatting rules
├── .gitignore                        # Git ignore rules
├── README.md                         # Full documentation ⭐
├── QUICKSTART.md                     # Quick start guide
├── CONTRIBUTING.md                   # Contribution guidelines
├── CHANGELOG.md                      # Version history
├── LICENSE                           # MIT License
├── info.md                           # HACS info page
└── examples.md                       # Configuration examples

```

## 🎯 Key Files

### Core Implementation
- **card.js** - Main custom element implementing the Nanoleaf effect card
- **card-editor.js** - Visual configuration editor for the card
- **hacs.json** - HACS integration configuration

### Documentation
- **README.md** - Complete documentation with features, configuration, and troubleshooting
- **QUICKSTART.md** - Step-by-step setup guide
- **examples.md** - Various configuration examples
- **info.md** - HACS repository information page

### Development
- **card.test.js** - Unit tests with Vitest
- **vitest.config.js** - Test runner configuration
- **demo.html** - Standalone demo for local testing
- **package.json** - Dependencies and scripts

## 🚀 Features Implemented

### Display Modes
- ✅ Button grid layout
- ✅ Dropdown compact layout
- ✅ Responsive design

### Visual Features
- ✅ Single color effects
- ✅ Multi-color gradient effects
- ✅ Color cycling animation for active effects
- ✅ Custom MDI icons per effect
- ✅ Automatic text contrast calculation
- ✅ "Off" button/option

### Customization
- ✅ Global button styling
- ✅ Per-effect button styling
- ✅ Show/hide icons
- ✅ Show/hide effect names
- ✅ Custom inactive colors

### Integration
- ✅ Works in Entities cards
- ✅ Works as Tile card features
- ✅ HACS compatible
- ✅ Visual editor support
- ✅ Entity validation
- ✅ Effect list validation

### Developer Experience
- ✅ Unit tests
- ✅ CI/CD workflows
- ✅ Code formatting (Prettier)
- ✅ Git hooks (Husky)
- ✅ Comprehensive documentation
- ✅ Issue templates
- ✅ Contributing guidelines

## 📦 NPM Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run serve        # Same as dev
npm run test         # Run unit tests
npm run coverage     # Generate coverage report
npm run prettier     # Auto-format code
npm run check-prettier  # Check code formatting
npm run ngrok        # Expose dev server via ngrok
```

## 🧪 Testing

Run the demo locally:
```bash
npm install
npm run dev
# Open demo.html in browser at http://localhost:3000/demo.html
```

Test in Home Assistant:
1. Add resource pointing to dev server:
   ```yaml
   resources:
     - url: http://YOUR_IP:3000/card.js
       type: module
   ```
2. Add card to dashboard
3. Test effects and display modes

## 🔧 Development Workflow

1. **Make changes** to `card.js` or `card-editor.js`
2. **Run tests**: `npm test`
3. **Format code**: `npm run prettier`
4. **Test locally**: Open `demo.html` or test in HA
5. **Commit changes** (pre-commit hook runs automatically)
6. **Push and create PR**

## 📝 Configuration Example

```yaml
type: 'custom:nanoleaf-effect-card'
entity: light.nanoleaf_shapes
display: buttons
button_style:
  inactive_color: '#CCCCCC'
  icon: true
  name: true
effects:
  - name: 'Rainbow'
    icon: 'mdi:rainbow'
    colors:
      - '#FF0000'
      - '#FFFF00'
      - '#00FF00'
      - '#0000FF'
  - name: 'Sunrise'
    icon: 'mdi:weather-sunset-up'
    colors:
      - '#FFA500'
      - '#FFFF00'
```

## 🎨 Design Philosophy

- **User-Friendly**: Visual effect selection with icons and colors
- **Flexible**: Multiple display modes and customization options
- **Performant**: CSS animations, no polling, efficient rendering
- **Maintainable**: Well-documented, tested, follows best practices
- **Accessible**: Proper contrast, keyboard navigation support

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guidelines
- Testing requirements
- PR process

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🔗 Links

- Repository: https://github.com/luckydonald/hoass_nanoleaf-effect-card
- Issues: https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues
- HACS: Compatible with Home Assistant Community Store

---

**Version**: 0.0.0 (Initial Release)
**Status**: Ready for initial release
**Last Updated**: January 4, 2026

