# Development Tips & Tricks

Helpful information for developing and debugging the Nanoleaf Effect Card.

## Local Development Setup

### Quick Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, expose via ngrok (optional)
npm run ngrok
```

### Testing in Home Assistant

#### Option 1: Local Server
Add to your Lovelace resources:
```yaml
resources:
  - url: http://YOUR_LOCAL_IP:3000/card.js
    type: module
```

#### Option 2: Direct File
1. Copy `card.js` to `config/www/`
2. Add resource:
```yaml
resources:
  - url: /local/card.js
    type: module
```

#### Option 3: Ngrok (Remote Testing)
```bash
npm run ngrok
# Copy the https URL
```
Add to Lovelace:
```yaml
resources:
  - url: https://YOUR-NGROK-URL/card.js
    type: module
```

## Debugging

### Browser Console
1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Look for the card initialization message

### Inspect Card State
```javascript
// In browser console
const card = document.querySelector('nanoleaf-effect-card');
console.log('Config:', card._config);
console.log('Hass:', card._hass);
console.log('Shadow Root:', card.shadowRoot);
```

### Mock Testing
Use `demo.html` for quick testing without Home Assistant:
```bash
npm run dev
# Open http://localhost:3000/demo.html
```

## Common Development Tasks

### Adding a New Feature

1. **Modify card.js**
   ```javascript
   // Add your feature code
   ```

2. **Update config schema**
   ```javascript
   setConfig(config) {
     this._config = {
       // Add new config option
       newFeature: config.newFeature || defaultValue,
     };
   }
   ```

3. **Update documentation**
   - README.md
   - examples.md
   - CHANGELOG.md

4. **Add tests**
   ```javascript
   // In card.test.js
   it('should handle new feature', () => {
     // Test code
   });
   ```

### Modifying Styles

Edit the `getStyles()` method in `card.js`:
```javascript
getStyles() {
  return `
    .your-new-class {
      /* Your styles */
    }
  `;
}
```

Use Home Assistant CSS variables:
- `--primary-color`
- `--primary-text-color`
- `--secondary-text-color`
- `--card-background-color`
- `--divider-color`

### Testing with Different Configurations

Create test configs in `demo.html`:
```javascript
const testConfig = {
  entity: 'light.demo_nanoleaf',
  display: 'buttons',
  effects: [/* ... */]
};
```

## Code Quality

### Before Committing

```bash
# Format code
npm run prettier

# Check formatting
npm run check-prettier

# Run tests
npm test

# Generate coverage
npm run coverage
```

### Pre-commit Hook
Husky automatically runs prettier on commit. To bypass (not recommended):
```bash
git commit --no-verify
```

## Testing Checklist

Before releasing:

- [ ] Test with real Nanoleaf device
- [ ] Test button mode
- [ ] Test dropdown mode
- [ ] Test effect switching
- [ ] Test turn on/off
- [ ] Test with 1 effect
- [ ] Test with many effects (10+)
- [ ] Test in Entities card
- [ ] Test in Tile card
- [ ] Test on mobile
- [ ] Test in different themes
- [ ] Test with unavailable entity
- [ ] Check console for errors
- [ ] Verify no memory leaks
- [ ] Test with slow network

## Performance Tips

### Efficient Rendering
- Use CSS instead of JavaScript animations
- Minimize DOM updates
- Use event delegation
- Cache DOM queries

### Memory Management
- Remove event listeners in disconnectedCallback
- Avoid circular references
- Clean up timers/intervals

### Best Practices
```javascript
// ✅ Good: Event delegation
this.shadowRoot.addEventListener('click', (e) => {
  if (e.target.matches('.effect-button')) {
    // Handle click
  }
});

// ❌ Bad: Many individual listeners
buttons.forEach(btn => {
  btn.addEventListener('click', handler);
});
```

## Useful Resources

### Home Assistant
- [Frontend Development](https://developers.home-assistant.io/docs/frontend/)
- [Custom Cards Guide](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)
- [Lit Element Docs](https://lit.dev/)

### Icons
- [Material Design Icons](https://pictogrammers.com/library/mdi/)
- [Icon Picker](https://pictogrammers.com/)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)

### CSS
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)

## Troubleshooting Development Issues

### Card doesn't update after changes
1. Clear browser cache (Ctrl+Shift+R)
2. Hard reload in dev tools
3. Check console for errors
4. Verify file is being served correctly

### Tests failing
```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
npm ci

# Run tests with verbose output
npm test -- --reporter=verbose
```

### Prettier conflicts
```bash
# Fix automatically
npm run prettier

# Check what would change
npx prettier --check .
```

### Git hooks not running
```bash
# Reinstall husky
npm run prepare
npx husky install
```

## Version Management

### Creating a Release

1. Update version in files:
   ```bash
   npm version 1.0.0 --no-git-tag-version
   # Manually update card.js console.info version
   ```

2. Update CHANGELOG.md

3. Commit changes:
   ```bash
   git add .
   git commit -m "chore: bump version to 1.0.0"
   ```

4. Create and push tag:
   ```bash
   git tag v1.0.0
   git push origin main --tags
   ```

5. Create GitHub release
   - GitHub Actions will build artifacts automatically

## Getting Help

- Check [CONTRIBUTING.md](CONTRIBUTING.md)
- Search [existing issues](https://github.com/luckydonald/hoass_nanoleaf-effect-card/issues)
- Join Home Assistant community forums
- Check browser console first!

Happy coding! 🚀

