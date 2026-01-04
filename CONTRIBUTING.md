# Contributing to Nanoleaf Effect Card

Thank you for considering contributing to the Nanoleaf Effect Card! Here are some guidelines to help you get started.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/luckydonald/hoass_nanoleaf-effect-card.git
   cd hoass_nanoleaf-effect-card
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```
   This will start a local server on port 3000.

4. **Configure Home Assistant**
   Add the development resource to your Lovelace configuration:
   ```yaml
   resources:
     - url: http://localhost:3000/card.js
       type: module
   ```

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

## Testing

Before submitting a PR:

1. Test the card with different configurations
2. Test both button and dropdown modes
3. Test with different numbers of effects
4. Verify color animations work correctly
5. Check console for errors

Run tests:
```bash
npm test
```

Check code formatting:
```bash
npm run check-prettier
```

Auto-format code:
```bash
npm run prettier
```

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure tests pass
- Update documentation if needed

## Reporting Issues

When reporting issues, please include:

- Home Assistant version
- Browser and version
- Card configuration (sanitized)
- Console errors (if any)
- Steps to reproduce

## Feature Requests

Feature requests are welcome! Please:

- Check if the feature already exists
- Describe the use case clearly
- Explain how it benefits users
- Consider implementation complexity

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Focus on what's best for the community

## Questions?

Feel free to open an issue for questions or join the discussion in existing issues.

Thank you for contributing! 🎨

