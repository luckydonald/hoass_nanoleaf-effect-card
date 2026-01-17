# Scripts Documentation

## init.sh

The `init.sh` script initializes a new Home Assistant plugin from this template repository.

### Features

The script performs the following operations:

1. **Collects Plugin Information**
   - Display name (e.g., "Calendar Alarm Clock") for UI elements
   - Lowercase-dash name (e.g., "calendar-alarm-clock") for filenames and custom components
   - Snake_case name (e.g., "calendar_alarm_clock") for Python modules and integration domain
   - Generates GitHub repository URL automatically

2. **Optional Backend Removal**
   - Ask if Python backend is needed
   - If not, removes `custom_components/template/` and `pyproject.toml`

3. **Frontend Framework Selection**
   - Choose between Vue.js (`frontend_vue/`) or Plain HTML/JS (`frontend_plain/`)
   - Removes the unused frontend directory
   - Renames the selected directory to `frontend/`

4. **String Replacements**
   - Replaces all template-related strings throughout the codebase
   - Handles various naming conventions (snake_case, PascalCase, kebab-case, etc.)
   - Updates URLs, file paths, and component names

5. **File and Directory Renaming**
   - Renames `custom_components/template/` to `custom_components/{snake_name}/`
   - Renames `AlarmClockCard.vue` to `{PascalName}Card.vue`

### Usage

```bash
# Navigate to the template repository
cd /path/to/hoass_<your-plugin-name>

# Run the initialization script
./scripts/init.sh
```

### Interactive Prompts

The script will prompt you for:

1. **Plugin Display Name**: The human-readable name for your plugin (e.g., "Calendar Alarm Clock")
2. **Lowercase-Dash Name**: Auto-calculated but can be overridden (e.g., "calendar-alarm-clock")
3. **Snake_Case Name**: Auto-calculated but can be overridden (e.g., "calendar_alarm_clock")
4. **Python Backend**: Whether to keep the Python backend files (y/n)
5. **Frontend Framework**: Choose between "vue" or "plain"
6. **Confirmation**: Review the configuration and confirm before proceeding
7. **Final Confirmation**: Confirm file replacements before modifying files

### Example Session

```
Plugin Display Name: My Custom Widget
Lowercase-dash:      my-custom-widget
Snake_case:          my_custom_widget
GitHub URL:          https://github.com/luckydonald/hoass_my-custom-widget.git
Python Backend:      yes
Frontend:            vue
```

### Files Modified

The script modifies the following types of files:

**Root Level:**
- `hacs.json`
- `pyproject.toml`
- `Makefile`
- `README.md` (if exists)

**Python Backend:**
- All `.py`, `.yaml`, and `.json` files in `custom_components/template/`

**Frontend:**
- `package.json`
- `index.html`
- `vite.config.ts`
- All `.ts`, `.vue`, and `.js` files in `frontend/src/`

### String Replacements

The script performs the following replacements:

| Original | Replaced With | Use Case |
|----------|---------------|----------|
| `template` | `{snake_name}` | Python modules, domain |
| `Template` | `{PascalName}` | Class names |
| `TEMPLATE` | `{UPPER_SNAKE}` | Constants |
| `plugin-template` | `{dash-name}` | Filenames, URLs |
| `Plugin template` | `{Display Name}` | UI text |
| `calendar_alarm_clock` | `{snake_name}` | Legacy references |
| `alarm-clock-card` | `{dash-name}-card` | Card names |
| `AlarmClockCard` | `{PascalName}Card` | Vue component |
| `Calendar Alarm Clock` | `{Display Name}` | Legacy UI text |

### Safety Features

- Creates backup files (`.bak`) before modifying
- Validates directory structure before starting
- Confirms each major step with user
- Removes backup files after successful completion
- Supports both macOS and Linux

### Post-Initialization Steps

After running the script:

1. Review all modified files
2. Update `README.md` with your plugin details
3. Update `LICENSE` if needed
4. Install dependencies (if backend: `make setup-py`, if frontend: `make setup-ts`)
5. Start developing your plugin!

### Notes

- The script uses `sed` for text replacement, compatible with both macOS and Linux
- Word boundaries (`\b`) are used to avoid partial replacements where possible
- Replacement order matters - more specific patterns are replaced first
- The script will exit if run outside the template repository

