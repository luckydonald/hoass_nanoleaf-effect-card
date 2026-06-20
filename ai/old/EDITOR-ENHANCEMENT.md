# Visual Editor Enhancement - Native HA Components

**Date**: January 4, 2026  
**Status**: ✅ COMPLETE

---

## Summary

Enhanced the visual editor to use native Home Assistant components for a more integrated, professional experience.

---

## Changes Made

### 1. Native Entity Picker ✅

**Before**: Plain text input

```html
<input type="text" placeholder="light.nanoleaf_shapes" />
```

**After**: Native HA entity picker

```html
<ha-entity-picker
    .hass="${this._hass}"
    .value="${this._config.entity}"
    .includeDomains="${['light']}"
    allow-custom-entity
></ha-entity-picker>
```

**Benefits**:

-   Autocomplete from available entities
-   Filtered to light domain
-   Custom entity support
-   Proper validation
-   Consistent with HA UI

---

### 2. Radio Buttons for Display Mode ✅

**Before**: Dropdown select

```html
<select id="display">
    <option value="buttons">Buttons</option>
    <option value="dropdown">Dropdown</option>
</select>
```

**After**: Radio buttons with ha-formfield

```html
<ha-formfield label="Buttons">
    <ha-radio name="display" value="buttons" .checked="${...}"></ha-radio>
</ha-formfield>
<ha-formfield label="Dropdown">
    <ha-radio name="display" value="dropdown" .checked="${...}"></ha-radio>
</ha-formfield>
```

**Benefits**:

-   More intuitive for binary choice
-   Better visual feedback
-   Consistent with HA patterns
-   Clearer labeling

---

### 3. Native Switches ✅

**Before**: Checkboxes

```html
<input type="checkbox" id="show-icon" />
```

**After**: HA switches

```html
<ha-formfield label="Show Icons">
    <ha-switch id="show-icon" .checked="${...}"></ha-switch>
</ha-formfield>
```

**Benefits**:

-   Modern toggle UI
-   Better accessibility
-   Consistent with HA design
-   Clear on/off states

---

### 4. Effects List Editor ✅

**Before**: YAML instructions only

**After**: Full GUI editor with:

-   ✅ **Add/Remove Effects** - Button to add, icon to delete
-   ✅ **Effect Name Input** - Text field for effect name
-   ✅ **Icon Picker** - Native `ha-icon-picker` component
-   ✅ **Color Inputs** - Multiple color pickers per effect
-   ✅ **Add Colors** - Button to add more colors to an effect
-   ✅ **Drag to Reorder** - Drag handle for reordering effects

**Features**:

```html
<div class="effect-item">
    <ha-icon icon="mdi:drag" class="effect-handle"></ha-icon>
    <input type="text" class="effect-name" placeholder="Effect name" />
    <ha-icon-picker .value="${effect.icon}"></ha-icon-picker>
    <div class="color-list">
        <input type="color" class="color-input" />
        <button class="add-color-button">+</button>
    </div>
    <ha-icon icon="mdi:delete" class="effect-delete"></ha-icon>
</div>
```

---

## Component Details

### ha-entity-picker

**Purpose**: Entity selection with autocomplete  
**Properties**:

-   `.hass` - Home Assistant object
-   `.value` - Current entity ID
-   `.includeDomains` - Filter to specific domains (e.g., ['light'])
-   `allow-custom-entity` - Allow manual entry

**Events**:

-   `value-changed` - Fires when entity selected

---

### ha-formfield

**Purpose**: Wraps form inputs with labels  
**Properties**:

-   `label` - Label text

**Usage**: Wraps radio buttons, switches, etc.

---

### ha-radio

**Purpose**: Radio button option  
**Properties**:

-   `name` - Radio group name
-   `value` - Option value
-   `.checked` - Selected state

**Events**:

-   `change` - Fires when selected

---

### ha-switch

**Purpose**: Toggle switch  
**Properties**:

-   `.checked` - On/off state

**Events**:

-   `change` - Fires when toggled

---

### ha-icon-picker

**Purpose**: Icon selection with search  
**Properties**:

-   `.value` - Current icon (e.g., 'mdi:rainbow')

**Events**:

-   `value-changed` - Fires when icon selected

---

## Editor Features

### Effect Management

1. **Add Effect**: Click "Add Effect" button
2. **Edit Name**: Type in text field
3. **Choose Icon**: Click icon picker, search and select
4. **Add Colors**: Click + button to add color
5. **Edit Colors**: Click color swatch to change
6. **Reorder**: Drag by handle to reorder
7. **Delete**: Click delete icon to remove

### Drag and Drop

-   Grab effect by drag handle
-   Visual feedback (opacity change)
-   Reorder in list
-   Config automatically updates

---

## Code Structure

### Editor Class (lines 331-630 in card.js)

```javascript
class NanoleafEffectCardEditor extends HTMLElement {
  constructor() { ... }

  set hass(hass) {
    // Update entity picker when hass changes
  }

  setConfig(config) {
    // Set initial configuration
  }

  configChanged(newConfig) {
    // Fire event when config changes
  }

  render() {
    // Render editor UI
  }

  renderEffectsList() {
    // Render effects editor
  }

  renderColorInputs(effect, index) {
    // Render color pickers for effect
  }

  attachEventListeners() {
    // Attach all event handlers
  }

  setupDragAndDrop() {
    // Setup drag-and-drop for reordering
  }

  getDragAfterElement(container, y) {
    // Calculate drop position
  }
}
```

---

## Event Handling

### Entity Selection

```javascript
entityPicker.addEventListener('value-changed', (e) => {
    this._config = { ...this._config, entity: e.detail.value };
    this.configChanged(this._config);
});
```

### Display Mode

```javascript
radios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            this._config = { ...this._config, display: e.target.value };
            this.configChanged(this._config);
        }
    });
});
```

### Effect Modifications

```javascript
// Name change
input.addEventListener('input', (e) => {
    const effects = [...this._config.effects];
    effects[index].name = e.target.value;
    this._config = { ...this._config, effects };
    this.configChanged(this._config);
});

// Icon change
picker.addEventListener('value-changed', (e) => {
    const effects = [...this._config.effects];
    effects[index].icon = e.detail.value;
    this._config = { ...this._config, effects };
    this.configChanged(this._config);
});

// Color change
input.addEventListener('input', (e) => {
    const effects = [...this._config.effects];
    effects[effectIndex].colors[colorIndex] = e.target.value;
    this._config = { ...this._config, effects };
    this.configChanged(this._config);
});
```

---

## Benefits

### User Experience ✅

-   **Familiar UI**: Uses standard HA components
-   **Intuitive**: Visual feedback and clear controls
-   **Efficient**: No YAML editing required
-   **Powerful**: Full effect configuration in GUI

### Developer Experience ✅

-   **Consistent**: Follows HA patterns
-   **Maintainable**: Uses documented components
-   **Accessible**: Built-in a11y support
-   **Reliable**: Well-tested HA components

### Visual Design ✅

-   **Professional**: Matches HA design system
-   **Responsive**: Works on all screen sizes
-   **Clean**: Organized sections and spacing
-   **Interactive**: Hover states, animations

---

## Testing Checklist

### Basic Functionality

-   ✅ Entity picker shows light entities
-   ✅ Entity picker allows custom entity
-   ✅ Display mode radios work
-   ✅ Inactive color picker works
-   ✅ Show icons switch works
-   ✅ Show names switch works

### Effects Editor

-   ✅ Can add new effect
-   ✅ Can edit effect name
-   ✅ Can select effect icon
-   ✅ Can change effect colors
-   ✅ Can add more colors
-   ✅ Can delete effect
-   ✅ Can drag to reorder effects
-   ✅ Changes save immediately

### Integration

-   ✅ Config updates properly
-   ✅ Card preview updates
-   ✅ YAML mode matches GUI
-   ✅ No console errors
-   ✅ Works in card editor modal

---

## Comparison: Before vs After

### Before (Simple Editor)

-   Text input for entity
-   Dropdown for display mode
-   Checkboxes for options
-   YAML instructions for effects
-   Manual YAML editing required

### After (Enhanced Editor)

-   ✅ Native entity picker with autocomplete
-   ✅ Radio buttons for display mode
-   ✅ Switches for options
-   ✅ Full GUI effects editor
-   ✅ Add/remove/reorder effects
-   ✅ Icon picker integration
-   ✅ Multiple color support
-   ✅ Drag-and-drop reordering
-   ✅ No YAML needed

---

## File Changes

### card.js

-   **Lines 331-630**: Complete editor rewrite
-   **Added**: `set hass()` method for entity picker
-   **Added**: Effects list renderer
-   **Added**: Color inputs renderer
-   **Added**: Drag-and-drop functionality
-   **Enhanced**: All event handlers
-   **Total**: ~300 lines of editor code

### card-editor.js

-   **Status**: File removed (editor bundled in card.js)
-   **Alternative**: Keep as stub with reference note

---

## Known Limitations

### Current

-   Color deletion requires removing and re-adding effect
-   No validation of effect names against device
-   No preview of what effect looks like

### Future Enhancements

-   Button to fetch effects from device
-   Effect name validation
-   Color palette presets
-   Effect preview
-   Import/export effects
-   Templates for common effects

---

## Usage Example

### Configuration Flow

1. Click "Add Card"
2. Search "Nanoleaf"
3. Select entity from picker
4. Choose display mode (buttons/dropdown)
5. Click "Add Effect"
6. Enter effect name (e.g., "Rainbow")
7. Click icon picker, search "rainbow"
8. Click color, choose colors
9. Click + to add more colors
10. Drag to reorder if needed
11. Click "Add Effect" for more
12. Save card

### Result

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
```

---

## Technical Notes

### hass Property

The editor now has a `set hass(hass)` method that:

1. Stores the hass object
2. Updates the entity picker when hass changes
3. Ensures picker has current entity list

### Config Changes

All changes fire `config-changed` event with:

```javascript
event.detail = { config: newConfig };
```

Home Assistant listens for this and updates the card.

### Drag and Drop

Uses native HTML5 drag-and-drop:

-   `dragstart` - Mark item as being dragged
-   `dragover` - Calculate drop position
-   `drop` - Reorder array and re-render

---

## Conclusion

The visual editor now provides a **complete GUI experience** using native Home Assistant components. Users can configure all card options without touching YAML, while still having the option to use YAML mode for advanced features.

**Status**: ✅ COMPLETE AND TESTED  
**Impact**: Major UX improvement  
**Compatibility**: Home Assistant 2023.1+

---

_Enhancement completed January 4, 2026_
