# Testing Guide

## Overview

This template includes comprehensive test setups for both frontend (TypeScript/Vue) and backend (Python) code.

## Backend Tests (Python)

### Setup

```bash
# Install test dependencies
make setup-py

# Or manually with uv
uv sync
```

### Running Tests

```bash
# Run all Python tests
make test-py

# Run with coverage
make test-coverage-py

# Run specific test file
uv run pytest tests/test_sensor.py

# Run specific test
uv run pytest tests/test_sensor.py::test_sensor_initialization

# Run with verbose output
uv run pytest tests/ -v

# Run with debug output
uv run pytest tests/ -s
```

### Test Structure

```
tests/
├── __init__.py           # Package init
├── conftest.py           # Shared fixtures
├── test_init.py          # Integration setup tests
├── test_sensor.py        # Sensor platform tests
├── test_services.py      # Service tests
├── test_const.py         # Constants tests
└── test_models.py        # Data model tests
```

### Writing Backend Tests

Example test:

```python
import pytest
from unittest.mock import Mock
from custom_components.plugin_template.sensor import PluginTemplateSensor

@pytest.mark.asyncio
async def test_my_sensor():
    """Test sensor functionality."""
    entry = Mock()
    entry.entry_id = "test_id"
    
    sensor = PluginTemplateSensor(entry, "test")
    await sensor.async_update()
    
    assert sensor._attr_native_value is not None
```

### Test Coverage

Coverage reports are generated in:
- Terminal output (summary)
- `htmlcov/index.html` (detailed HTML report)

```bash
# Open coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

## Frontend Tests (TypeScript/Vitest)

### Setup

```bash
# Install test dependencies
make setup-ts

# Or manually with npm/yarn
cd frontend_vue
npm install
# or
yarn install
```

### Running Tests

```bash
# Run all frontend tests
make test-ts

# Run with coverage
make test-coverage-ts

# Or from frontend directory
cd frontend_vue

# Run tests
npm test
# or
yarn test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
frontend_vue/tests/
├── setup.ts                     # Test setup and mocks
├── PluginTemplateCard.test.ts   # Component tests
├── types.test.ts                # Type definition tests
├── main.test.ts                 # Registration tests
└── utils.test.ts                # Utility function tests
```

### Writing Frontend Tests

Example component test:

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PluginTemplateCard from '../src/PluginTemplateCard.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(PluginTemplateCard, {
      props: {
        hass: mockHass,
        config: { title: 'Test' },
      },
    });

    expect(wrapper.text()).toContain('Test');
  });
});
```

### Test Coverage

Coverage reports are generated in:
- Terminal output (summary)
- `frontend_vue/coverage/index.html` (detailed HTML report)

```bash
# Open coverage report
open frontend_vue/coverage/index.html  # macOS
xdg-open frontend_vue/coverage/index.html  # Linux
```

## Running All Tests

```bash
# Run both backend and frontend tests
make test

# Run both with coverage
make test-coverage
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install uv
        run: pip install uv
      - name: Run tests
        run: make test-py

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: cd frontend_vue && npm install
      - name: Run tests
        run: make test-ts
```

## Test Configuration

### Python (pytest)

Configuration in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = [
    "--strict-markers",
    "--cov=custom_components.plugin_template",
    "--cov-report=term-missing",
    "--cov-report=html",
]
```

### Frontend (Vitest)

Configuration in `frontend_vue/vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## Best Practices

### Backend Tests

1. **Use fixtures** for common test data (in `conftest.py`)
2. **Mock external dependencies** (Home Assistant core, external APIs)
3. **Test async code** with `@pytest.mark.asyncio`
4. **Use meaningful test names** that describe what is being tested
5. **Test edge cases** and error conditions

### Frontend Tests

1. **Use `@vue/test-utils`** for component testing
2. **Mock Home Assistant objects** (hass, config)
3. **Test user interactions** (clicks, inputs)
4. **Test prop changes** and reactivity
5. **Keep tests focused** on one thing at a time

## Troubleshooting

### Backend

**Problem**: `ModuleNotFoundError: No module named 'homeassistant'`
```bash
# Solution: Install dev dependencies
uv sync
```

**Problem**: Tests fail with `ImportError`
```bash
# Solution: Ensure custom_components is in Python path (handled by conftest.py)
```

### Frontend

**Problem**: `Cannot find module 'vue'`
```bash
# Solution: Install dependencies
cd frontend_vue && npm install
```

**Problem**: Tests hang or timeout
```bash
# Solution: Check for missing await in async operations
```

## Adding New Tests

### Backend

1. Create test file: `tests/test_<module>.py`
2. Import module under test
3. Write test functions (prefix with `test_`)
4. Use fixtures from `conftest.py`
5. Run tests to verify

### Frontend

1. Create test file: `frontend_vue/tests/<Component>.test.ts`
2. Import component and testing utilities
3. Write test cases in `describe` blocks
4. Use `it` for individual tests
5. Run tests to verify

## Examples

See existing test files for examples:
- Backend: `tests/test_sensor.py`
- Frontend: `frontend_vue/tests/PluginTemplateCard.test.ts`

## Coverage Goals

- **Backend**: Aim for >80% coverage
- **Frontend**: Aim for >80% coverage
- **Critical paths**: 100% coverage
- **UI components**: Test main functionality

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [Vitest documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Home Assistant Testing](https://developers.home-assistant.io/docs/development_testing)

