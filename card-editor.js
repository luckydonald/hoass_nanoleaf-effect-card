import './card-editor-button-style-chooser.js';

/**
 * Nanoleaf Effect Card Editor
 *
 * Visual configuration editor using native Home Assistant components.
 * Dynamically imported by card.js when user opens the visual editor.
 *
 * @class NanoleafEffectCardEditor
 * @extends HTMLElement
 *
 * Features:
 * - Entity picker with autocomplete (ha-entity-picker)
 * - Radio buttons for display mode selection (ha-formfield + ha-radio)
 * - Toggle switches for options (ha-switch)
 * - Icon picker for effect icons (ha-icon-picker)
 * - Drag-and-drop effect list editor (ha-sortable)
 * - Multi-color support per effect
 * - Add/remove/reorder effects
 *
 * @fires config-changed - When configuration changes
 */

/**
 * Creates an instance of NanoleafEffectCardEditor.
 * Initializes shadow DOM and default properties.
 */
class NanoleafEffectCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
        this._effectList = [];
        this._savedInputState = null;
    }

    // Save currently focused input state (selector hints, value, caret) to restore after re-render
    saveInputState() {
        try {
            const root = this.shadowRoot;
            if (!root) return;
            const active = root.activeElement;
            if (!active) return;
            const state = {
                id: active.id || null,
                tagName: active.tagName || null,
                className: active.className || null,
                dataset: { ...active.dataset },
                value: active.value ?? null,
                selectionStart: active.selectionStart ?? null,
                selectionEnd: active.selectionEnd ?? null,
            };
            this._savedInputState = state;
        } catch (e) {
            this._savedInputState = null;
        }
    }

    // Restore previously saved input state if the corresponding element exists after re-render
    restoreInputState() {
        try {
            if (!this._savedInputState) return;
            const root = this.shadowRoot;
            if (!root) return;
            let el = null;
            const s = this._savedInputState;
            if (s.id) {
                el = root.querySelector(`#${CSS.escape(s.id)}`);
            }
            if (!el && s.dataset && Object.keys(s.dataset).length > 0) {
                // Try to match by data-index if available
                if (s.dataset.index !== undefined) {
                    el = root.querySelector(`[data-index="${s.dataset.index}"]`);
                } else if (s.dataset.effectIndex !== undefined) {
                    el = root.querySelector(`[data-effect-index="${s.dataset.effectIndex}"]`);
                }
            }
            // Fallback: try to find by class name
            if (!el && s.className) {
                const className = s.className.split(' ')[0];
                el = root.querySelector(`.${className}`);
            }
            if (el) {
                if (s.value !== null && el.value !== undefined) el.value = s.value;
                if (typeof s.selectionStart === 'number' && el.setSelectionRange) {
                    try {
                        el.focus();
                        el.setSelectionRange(s.selectionStart, s.selectionEnd ?? s.selectionStart);
                    } catch (e) {
                        // ignore if element doesn't support selection
                        el.focus();
                    }
                } else {
                    el.focus();
                }
            }
        } catch (e) {
            // ignore
        } finally {
            this._savedInputState = null;
        }
    }

    /**
     * Sets the Home Assistant object.
     * Updates the entity picker when hass changes.
     *
     * @param {Object} hass - Home Assistant object containing states and services
     */
    set hass(hass) {
        this._hass = hass;
        // Update entity picker if it exists
        const entityPicker = this.shadowRoot?.querySelector('#entity-picker');
        if (entityPicker) {
            entityPicker.hass = hass;
        }
        // If we have an entity selected, refresh effect suggestions from hass
        if (this._hass && this._config && this._config.entity) {
            try {
                this.updateEffectListSuggestions(this._config.entity);
            } catch (e) {
                // ignore if called before render
            }
        }
    }

    /**
     * Sets the editor configuration.
     * Called by Home Assistant when the editor is initialized.
     *
     * @param {Object} config - Card configuration object
     */
    setConfig(config) {
        this._config = config || {};
        // Defer render to next microtask to avoid prototype/import-order races in test environments
        Promise.resolve().then(() => this.render());
    }

    /**
     * Fires a config-changed event.
     * Notifies Home Assistant that the configuration has been modified.
     *
     * @param {Object} newConfig - Updated configuration object
     * @fires config-changed
     */
    configChanged(newConfig) {
        const event = new Event('config-changed', {
            bubbles: true,
            composed: true,
        });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);
    }

    /**
     * Populate the datalist with effect names from the entity's effect_list
     * and validate existing effect name inputs (mark invalid ones).
     * Safe to call even if hass or entity aren't available yet.
     * @param {string} entityId
     */
    updateEffectListSuggestions(entityId) {
        const datalist = this.shadowRoot?.querySelector('#effects-datalist');
        if (!datalist) return;

        const list = this._hass?.states?.[entityId]?.attributes?.effect_list || [];
        this._effectList = Array.isArray(list) ? list.slice() : [];

        // clear existing options
        datalist.innerHTML = '';
        this._effectList.forEach((name) => {
            const opt = document.createElement('option');
            opt.value = name;
            datalist.appendChild(opt);
        });

        // validate existing inputs
        this.shadowRoot.querySelectorAll('.effect-name-input').forEach((input) => {
            const val = input.value?.trim();
            if (!val) {
                input.classList.remove('invalid');
                return;
            }
            const isValid = this._effectList.includes(val);
            input.classList.toggle('invalid', !isValid);
        });
    }

    // Attach listeners for global controls (non-effects area)
    attachEventListeners() {
        // Entity picker
        const entityPicker = this.shadowRoot.querySelector('#entity-picker');
        if (entityPicker && !entityPicker._nanoleaf_bound) {
            entityPicker._nanoleaf_bound = true;
            try {
                entityPicker.hass = this._hass;
            } catch (e) {}
            entityPicker.addEventListener('value-changed', (e) => {
                const value = e.detail?.value ?? e.target.value ?? entityPicker.value;
                this._config = { ...this._config, entity: value };
                this.updateEffectListSuggestions(value);
                this.configChanged(this._config);
            });
        }

        // Display mode radios
        this.shadowRoot.querySelectorAll('ha-radio').forEach((radio) => {
            if (radio._nanoleaf_bound) return;
            radio._nanoleaf_bound = true;
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this._config = { ...this._config, display: e.target.value };
                    this.configChanged(this._config);
                    // Full render may be required to switch dropdown/buttons UI
                    this.render();
                }
            });
        });

        // Inactive color
        const inactiveColorInput = this.shadowRoot.querySelector('#inactive-color');
        if (inactiveColorInput && !inactiveColorInput._nanoleaf_bound) {
            inactiveColorInput._nanoleaf_bound = true;
            inactiveColorInput.addEventListener('input', (e) => {
                this._config = {
                    ...this._config,
                    button_style: { ...(this._config.button_style || {}), inactive_color: e.target.value },
                };
                this.configChanged(this._config);
                // partial update of effects area to reflect new inactive color
                this.renderEffectsArea();
            });
        }

        // Show icon/name/compact switches
        const showIcon = this.shadowRoot.querySelector('#show-icon');
        if (showIcon && !showIcon._nanoleaf_bound) {
            showIcon._nanoleaf_bound = true;
            showIcon.addEventListener('change', (e) => {
                this._config = {
                    ...this._config,
                    button_style: { ...(this._config.button_style || {}), icon: e.target.checked },
                };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }
        const showName = this.shadowRoot.querySelector('#show-name');
        if (showName && !showName._nanoleaf_bound) {
            showName._nanoleaf_bound = true;
            showName.addEventListener('change', (e) => {
                this._config = {
                    ...this._config,
                    button_style: { ...(this._config.button_style || {}), name: e.target.checked },
                };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }
        const compactSwitch = this.shadowRoot.querySelector('#compact-style');
        if (compactSwitch && !compactSwitch._nanoleaf_bound) {
            compactSwitch._nanoleaf_bound = true;
            compactSwitch.addEventListener('change', (e) => {
                this._config = {
                    ...this._config,
                    button_style: { ...(this._config.button_style || {}), compact: e.target.checked },
                };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }

        // Show Off / None toggles
        const showOff = this.shadowRoot.querySelector('#show-off');
        if (showOff && !showOff._nanoleaf_bound) {
            showOff._nanoleaf_bound = true;
            showOff.addEventListener('change', (e) => {
                this._config = { ...this._config, show_off: e.target.checked };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }
        const showNone = this.shadowRoot.querySelector('#show-none');
        if (showNone && !showNone._nanoleaf_bound) {
            showNone._nanoleaf_bound = true;
            showNone.addEventListener('change', (e) => {
                this._config = { ...this._config, show_none: e.target.checked };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }

        // Add effect button (partial render)
        const addEffectButton = this.shadowRoot.querySelector('#add-effect');
        if (addEffectButton && !addEffectButton._nanoleaf_bound) {
            addEffectButton._nanoleaf_bound = true;
            addEffectButton.addEventListener('click', (e) => {
                e.preventDefault();
                const effects = [...(this._config.effects || [])];
                effects.push({ name: '', icon: 'mdi:lightbulb', colors: ['#CCCCCC'] });
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }
    }

    /**
     * Renders the editor UI.
     * Creates all form fields using native HA components and the effects list editor.
     * Includes entity picker, display mode radios, button style options, and effects editor.
     */
    render() {
        if (!this._config) {
            this._config = {};
        }

        // Preserve focused input state so re-render doesn't interrupt typing
        this.saveInputState();

        this.shadowRoot.innerHTML = `
      <style>
        .editor-container {
          padding: 16px;
        }
        .setting {
          margin-bottom: 16px;
        }
        .setting label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .info {
          color: var(--secondary-text-color);
          font-size: 12px;
          margin-top: 4px;
        }
        .section-title {
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--divider-color);
          padding-bottom: 8px;
        }
        .effect-name-input.invalid { border-color: var(--error-color); box-shadow: 0 0 0 3px rgba(255,0,0,0.06); }
        ha-entity-picker {
          width: 100%;
        }
        ha-formfield {
          display: inline-block;
          margin-right: 16px;
        }
        .radio-group {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }
        ha-sortable {
          display: block;
          margin-top: 8px;
        }
        .effect-item {
          display: flex;
          align-items: stretch;
          background: var(--card-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .handle {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          cursor: move;
          background: var(--secondary-background-color);
          border-right: 1px solid var(--divider-color);
        }
        .handle ha-icon {
          --mdc-icon-size: 24px;
          color: var(--secondary-text-color);
        }
        .effect-content {
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .effect-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .effect-name-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .effect-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .effect-row label {
          min-width: 40px;
          font-size: 12px;
          color: var(--secondary-text-color);
        }
        ha-icon-picker {
          flex: 1;
        }
        .colors-container {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          align-items: center;
        }
        .color-input {
          width: 40px;
          height: 40px;
          padding: 4px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          cursor: pointer;
        }
        .color-input::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-input::-webkit-color-swatch {
          border: none;
          border-radius: 2px;
        }
        .icon-button {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--secondary-text-color);
        }
        .icon-button:hover {
          background: var(--secondary-background-color);
        }
        .icon-button.add-color {
          border: 1px dashed var(--divider-color);
        }
        .icon-button.delete {
          color: var(--error-color);
        }
        .effect-actions {
          display: flex;
          align-items: center;
          padding: 12px 8px;
          border-left: 1px solid var(--divider-color);
        }
        ha-button {
          margin-top: 8px;
        }
        ha-switch {
          padding: 16px 0;
        }
      </style>
      <div class="editor-container">
        <div class="section-title">Basic Settings</div>
        
        <div class="setting">
          <label>Entity</label>
          <ha-entity-picker
            id="entity-picker"
            .hass="${this._hass}"
            .value="${this._config.entity || ''}"
            .includeDomains="${['light']}"
            allow-custom-entity
          ></ha-entity-picker>
          <div class="info">Select your Nanoleaf light entity</div>
        </div>

        <!-- datalist used to provide autocomplete suggestions for effect names -->
        <datalist id="effects-datalist"></datalist>

        <div class="setting">
          <label>Display Mode</label>
          <div class="radio-group">
            <ha-formfield label="Buttons">
              <ha-radio
                name="display"
                value="buttons"
                ${this._config.display !== 'dropdown' ? 'checked' : ''}
              ></ha-formfield>
            </ha-formfield>
            <ha-formfield label="Dropdown">
              <ha-radio
                name="display"
                value="dropdown"
                ${this._config.display === 'dropdown' ? 'checked' : ''}
              ></ha-formfield>
            </ha-formfield>
          </div>
          <div class="info">Choose how to display effect selection</div>
        </div>

        <div class="section-title">Button Style</div>

        <div class="setting">
          <label>Inactive Color</label>
          <input
            type="color"
            id="inactive-color"
            value="${this._config.button_style?.inactive_color || '#CCCCCC'}"
          />
          <div class="info">Color for inactive effect buttons</div>
        </div>

        <div class="setting">
          <ha-formfield label="Show Icons">
            <ha-switch
              id="show-icon"
              ${this._config.button_style?.icon !== false ? 'checked' : ''}
            ></ha-formfield>
          </ha-formfield>
        </div>

        <div class="setting">
          <ha-formfield label="Show Effect Names">
            <ha-switch
              id="show-name"
              ${this._config.button_style?.name !== false ? 'checked' : ''}
            ></ha-formfield>
          </div>
        </div>

        <div class="setting">
          <ha-formfield label="Compact (inline) buttons">
            <ha-switch
              id="compact-style"
              ${this._config.button_style?.compact ? 'checked' : ''}
            ></ha-switch>
          </ha-formfield>
          <div class="info">If enabled, buttons are rendered compact with icon left of the text.</div>
        </div>

        <div class="setting">
          <ha-formfield label="Show 'Off' button">
            <ha-switch
              id="show-off"
              ${this._config.show_off !== false ? 'checked' : ''}
            ></ha-switch>
          </ha-formfield>
          <ha-formfield label="Show 'None' action">
            <ha-switch
              id="show-none"
              ${this._config.show_none ? 'checked' : ''}
            ></ha-switch>
          </ha-formfield>
          <div class="info">Toggle visibility of special entries in the effect list</div>
        </div>

        <div class="setting">
          <label>Color Display Styles</label>
          <nanoleaf-effect-card-card-editor-button-style-chooser id="global-style-chooser" />
          <div class="info">Configure how colors are displayed for active/inactive/hover states</div>
        </div>

        <div class="section-title">Effects</div>
        <div class="info" style="margin-bottom: 8px;">
          Configure effects that match your Nanoleaf's effect list.
        </div>
        <ha-sortable id="effects-sortable" handle-selector=".handle" .disabled="${
            !this._config.effects || this._config.effects.length === 0
        }">
          ${this.renderEffectsList()}
        </ha-sortable>
        <ha-button 
          id="add-effect"
          .label="Add Effect"
        >
          <ha-svg-icon slot="icon" .path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"></ha-svg-icon>
        </ha-button>
      </div>
    `;

        // After injecting HTML, attach listeners and set proper element properties
        if (typeof this.attachEventListeners === 'function') {
            this.attachEventListeners();
        } else {
            // Defensive: some test envs might not have the method (avoid throwing)
            // eslint-disable-next-line no-console
            console.warn('attachEventListeners is not defined on editor instance');
        }
        // Attach listeners for effects area (separate to avoid full re-renders)
        this.attachEffectsListeners();

        // ensure each effect name input uses the datalist for autocomplete
        this.shadowRoot.querySelectorAll('.effect-name-input').forEach((input) => {
            input.setAttribute('list', 'effects-datalist');
        });

        // If we already have an entity and hass, populate suggestions
        if (this._hass && this._config.entity) {
            if (typeof this.updateEffectListSuggestions === 'function') {
                this.updateEffectListSuggestions(this._config.entity);
            }
        }

        // Initialize element properties that can't be set via innerHTML
        const entityPicker = this.shadowRoot.querySelector('#entity-picker');
        if (entityPicker) {
            entityPicker.hass = this._hass;
            if (this._config.entity) entityPicker.value = this._config.entity;
        }

        // initialize global style chooser value
        const globalChooser = this.shadowRoot.querySelector('#global-style-chooser');
        if (globalChooser) {
            try {
                globalChooser.value = this._config.button_style?.color_display || {};
            } catch (e) {}
            globalChooser.addEventListener('value-changed', (e) => {
                this._config = {
                    ...this._config,
                    button_style: { ...(this._config.button_style || {}), color_display: e.detail.value },
                };
                this.configChanged(this._config);
            });
        }

        // Set radio checked states
        this.shadowRoot.querySelectorAll('ha-radio').forEach((radio) => {
            if (radio.value === (this._config.display || 'buttons')) {
                radio.checked = true;
            } else {
                radio.checked = false;
            }
        });

        // Set icon-picker values and color inputs for effects
        this.shadowRoot.querySelectorAll('.effect-icon').forEach((picker, idx) => {
            const val =
                (this._config.effects && this._config.effects[idx] && this._config.effects[idx].icon) ||
                'mdi:lightbulb';
            try {
                picker.value = val;
            } catch (e) {
                /* some environments may not expose property */
            }
        });
        this.shadowRoot.querySelectorAll('.color-input').forEach((input, idx) => {
            // color inputs already have value attribute in markup; ensure it's synced
            const effectIndex = parseInt(input.dataset.effectIndex);
            const colorIndex = parseInt(input.dataset.colorIndex);
            const color =
                this._config.effects?.[effectIndex]?.colors?.[colorIndex] ||
                this._config.effects?.[effectIndex]?.color ||
                '#CCCCCC';
            input.value = color;
        });

        // Initialize per-effect style chooser components
        this.shadowRoot
            .querySelectorAll('nanoleaf-effect-card-card-editor-button-style-chooser')
            .forEach((comp, idx) => {
                try {
                    comp.value =
                        (this._config.effects &&
                            this._config.effects[idx] &&
                            this._config.effects[idx].button_style?.color_display) ||
                        {};
                } catch (e) {}
            });

        // Restore focused input after render
        this.restoreInputState();
    }

    // Re-render only the effects list area and reattach its listeners
    renderEffectsArea() {
        const sortable = this.shadowRoot?.querySelector('#effects-sortable');
        if (!sortable) return;
        // preserve focused input state around the partial re-render
        this.saveInputState();
        sortable.innerHTML = this.renderEffectsList();
        // reattach effect-specific listeners
        this.attachEffectsListeners();
        // restore focus/caret if needed
        this.restoreInputState();
    }

    // Attach listeners that are specific to the effects area (name inputs, color inputs, add/delete color, reorder)
    attachEffectsListeners() {
        // ha-sortable for reordering effects
        const sortable = this.shadowRoot.querySelector('#effects-sortable');
        if (sortable && !sortable._nanoleaf_bound) {
            sortable._nanoleaf_bound = true;
            sortable.addEventListener('item-moved', (e) => {
                const effects = [...(this._config.effects || [])];
                const movedEffect = effects.splice(e.detail.oldIndex, 1)[0];
                effects.splice(e.detail.newIndex, 0, movedEffect);
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        }

        // Effect name inputs
        this.shadowRoot.querySelectorAll('.effect-name-input').forEach((input) => {
            if (input._nanoleaf_bound) return;
            input._nanoleaf_bound = true;
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const effects = [...(this._config.effects || [])];
                effects[index] = { ...effects[index], name: e.target.value };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                // validate against effect_list suggestions (if available)
                const val = e.target.value?.trim();
                const isValid = !val || (this._effectList && this._effectList.includes(val));
                e.target.classList.toggle('invalid', !isValid);
                // avoid re-rendering here to not disrupt typing/focus
            });
        });

        // Effect icon pickers
        this.shadowRoot.querySelectorAll('.effect-icon').forEach((picker) => {
            if (picker._nanoleaf_bound) return;
            picker._nanoleaf_bound = true;
            picker.addEventListener('value-changed', (e) => {
                const index = parseInt(picker.dataset.index);
                const effects = [...(this._config.effects || [])];
                effects[index] = { ...effects[index], icon: e.detail.value };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
            });
        });

        // Color inputs
        this.shadowRoot.querySelectorAll('.color-input').forEach((input) => {
            if (input._nanoleaf_bound) return;
            input._nanoleaf_bound = true;
            input.addEventListener('input', (e) => {
                const effectIndex = parseInt(e.target.dataset.effectIndex);
                const colorIndex = parseInt(e.target.dataset.colorIndex);
                const effects = [...(this._config.effects || [])];
                const colors = [...(effects[effectIndex].colors || [effects[effectIndex].color] || ['#CCCCCC'])];
                colors[colorIndex] = e.target.value;
                effects[effectIndex] = { ...effects[effectIndex], colors, color: undefined };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
            });
        });

        // Add color buttons
        this.shadowRoot.querySelectorAll('.add-color').forEach((button) => {
            if (button._nanoleaf_bound) return;
            button._nanoleaf_bound = true;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const effectIndex = parseInt(button.dataset.effectIndex);
                const effects = [...(this._config.effects || [])];
                const colors = [...(effects[effectIndex].colors || [effects[effectIndex].color] || ['#CCCCCC'])];
                colors.push('#CCCCCC');
                effects[effectIndex] = { ...effects[effectIndex], colors, color: undefined };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        });

        // Delete color buttons (trash) - remove a color from an effect
        this.shadowRoot.querySelectorAll('.delete-color').forEach((button) => {
            if (button._nanoleaf_bound) return;
            button._nanoleaf_bound = true;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const effectIndex = parseInt(button.dataset.effectIndex);
                const colorIndex = parseInt(button.dataset.colorIndex);
                const effects = [...(this._config.effects || [])];
                let colors = [
                    ...(effects[effectIndex].colors ||
                        (effects[effectIndex].color ? [effects[effectIndex].color] : [])),
                ];
                if (colorIndex >= 0 && colorIndex < colors.length) {
                    colors.splice(colorIndex, 1);
                }
                effects[effectIndex] = { ...effects[effectIndex], colors, color: undefined };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        });

        // Delete effect buttons
        this.shadowRoot.querySelectorAll('.delete').forEach((button) => {
            if (button._nanoleaf_bound) return;
            button._nanoleaf_bound = true;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(button.dataset.index);
                const effects = [...(this._config.effects || [])];
                effects.splice(index, 1);
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.renderEffectsArea();
            });
        });

        // Button style value-changed events
        this.shadowRoot.querySelectorAll('nanoleaf-effect-card-card-editor-button-style-chooser').forEach((comp) => {
            if (comp._nanoleaf_bound) return;
            comp._nanoleaf_bound = true;
            comp.addEventListener('value-changed', (e) => {
                const index = parseInt(comp.closest('.effect-item').dataset.index);
                const effects = [...(this._config.effects || [])];
                effects[index] = { ...effects[index], button_style: e.detail.value };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
            });
        });
    }

    renderEffectsList() {
        const effects = this._config.effects || [];
        if (effects.length === 0) {
            return '';
        }

        return effects
            .map(
                (effect, index) => `
      <div class="effect-item" data-index="${index}">
        <div class="handle">
          <ha-icon icon="mdi:drag"></ha-icon>
        </div>
        <div class="effect-content">
          <div class="effect-header">
            <input
              type="text"
              id="effect-name-${index}"
              class="effect-name-input"
              placeholder="Effect name (e.g., Rainbow)"
              value="${effect.name || ''}"
              data-index="${index}"
            />
          </div>
          <div class="effect-row">
            <label>Icon</label>
            <ha-icon-picker
              class="effect-icon"
              .value="${effect.icon || 'mdi:lightbulb'}"
              data-index="${index}"
            ></ha-icon-picker>
          </div>
          <div class="effect-row">
            <label>Colors</label>
            <div class="colors-container">
              ${this.renderColorInputs(effect, index)}
            </div>
          </div>
          <nanoleaf-effect-card-card-editor-button-style-chooser
            class="button-style"
            .value="${effect.button_style || {}}"
            compact
          />
        </div>
        <div class="effect-actions">
          <button id="delete-effect-${index}" class="icon-button delete" data-index="${index}" title="Delete effect">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `
            )
            .join('');
    }

    renderColorInputs(effect, effectIndex) {
        const colors = effect.colors || (effect.color ? [effect.color] : ['#CCCCCC']);
        const colorInputs = colors
            .map(
                (color, colorIndex) => `
       <div style="display:flex; align-items:center; gap:6px;">
        <input
          type="color"
          id="effect-${effectIndex}-color-${colorIndex}"
          class="color-input"
          value="${color}"
          data-effect-index="${effectIndex}"
          data-color-index="${colorIndex}"
          title="Click to change color"
        />
        <button id="effect-${effectIndex}-delete-color-${colorIndex}" class="icon-button delete-color" data-effect-index="${effectIndex}" data-color-index="${colorIndex}" title="Remove color">
          <ha-icon icon="mdi:trash-can"></ha-icon>
        </button>
       </div>
     `
            )
            .join('');

        return (
            colorInputs +
            `
      <button id="effect-${effectIndex}-add-color" class="icon-button add-color" data-effect-index="${effectIndex}" title="Add color">
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>
    `
        );
    }
}

customElements.define('nanoleaf-effect-card-editor', NanoleafEffectCardEditor);
