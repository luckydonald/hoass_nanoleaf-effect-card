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
        const entityPicker = this.shadowRoot?.querySelector('ha-entity-picker');
        if (entityPicker) {
            entityPicker.hass = hass;
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
        this.render();
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
     * Renders the editor UI.
     * Creates all form fields using native HA components and the effects list editor.
     * Includes entity picker, display mode radios, button style options, and effects editor.
     */
    render() {
        if (!this._config) {
            this._config = {};
        }

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

        <div class="setting">
          <label>Display Mode</label>
          <div class="radio-group">
            <ha-formfield label="Buttons">
              <ha-radio
                name="display"
                value="buttons"
                .checked="${this._config.display !== 'dropdown'}"
              ></ha-radio>
            </ha-formfield>
            <ha-formfield label="Dropdown">
              <ha-radio
                name="display"
                value="dropdown"
                .checked="${this._config.display === 'dropdown'}"
              ></ha-radio>
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
              .checked="${this._config.button_style?.icon !== false}"
            ></ha-switch>
          </ha-formfield>
        </div>

        <div class="setting">
          <ha-formfield label="Show Effect Names">
            <ha-switch
              id="show-name"
              .checked="${this._config.button_style?.name !== false}"
            ></ha-switch>
          </ha-formfield>
        </div>

        <div class="section-title">Effects</div>
        <div class="info" style="margin-bottom: 8px;">
          Configure effects that match your Nanoleaf's effect list.
        </div>
        <ha-sortable handle-selector=".handle" .disabled="${
            !this._config.effects || this._config.effects.length === 0
        }">
          ${this.renderEffectsList()}
        </ha-sortable>
        <ha-button 
          id="add-effect"
          .label="${'Add Effect'}"
        >
          <ha-svg-icon slot="icon" .path="${'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z'}"></ha-svg-icon>
        </ha-button>
      </div>
    `;

        this.attachEventListeners();
    }

    /**
     * Renders the list of configured effects.
     * Creates draggable effect items with name, icon, and color inputs.
     * Each effect has a drag handle, content area, and delete button.
     *
     * @returns {string} HTML string for effects list, or empty string if no effects
     */
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
        </div>
        <div class="effect-actions">
          <button class="icon-button delete" data-index="${index}" title="Delete effect">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `
            )
            .join('');
    }

    /**
     * Renders color inputs for an effect.
     * Creates color picker inputs and an "add color" button.
     *
     * @param {Object} effect - Effect configuration object
     * @param {number} effectIndex - Index of the effect in the effects array
     * @returns {string} HTML string for color inputs
     */
    renderColorInputs(effect, effectIndex) {
        const colors = effect.colors || (effect.color ? [effect.color] : ['#CCCCCC']);
        const colorInputs = colors
            .map(
                (color, colorIndex) => `
      <input
        type="color"
        class="color-input"
        value="${color}"
        data-effect-index="${effectIndex}"
        data-color-index="${colorIndex}"
        title="Click to change color"
      />
    `
            )
            .join('');

        return (
            colorInputs +
            `
      <button class="icon-button add-color" data-effect-index="${effectIndex}" title="Add color">
        <ha-icon icon="mdi:plus"></ha-icon>
      </button>
    `
        );
    }

    /**
     * Attaches event listeners to all interactive elements.
     * Sets up handlers for entity picker, radios, switches, buttons, and ha-sortable.
     * Called after render() completes.
     */
    attachEventListeners() {
        // Entity picker
        const entityPicker = this.shadowRoot.querySelector('#entity-picker');
        if (entityPicker && this._hass) {
            entityPicker.hass = this._hass;
            entityPicker.addEventListener('value-changed', (e) => {
                this._config = { ...this._config, entity: e.detail.value };
                this.configChanged(this._config);
            });
        }

        // Display mode radios
        const radios = this.shadowRoot.querySelectorAll('ha-radio');
        radios.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this._config = { ...this._config, display: e.target.value };
                    this.configChanged(this._config);
                }
            });
        });

        // Inactive color
        const inactiveColorInput = this.shadowRoot.querySelector('#inactive-color');
        inactiveColorInput?.addEventListener('input', (e) => {
            this._config = {
                ...this._config,
                button_style: {
                    ...(this._config.button_style || {}),
                    inactive_color: e.target.value,
                },
            };
            this.configChanged(this._config);
        });

        // Show icon switch
        const showIconSwitch = this.shadowRoot.querySelector('#show-icon');
        showIconSwitch?.addEventListener('change', (e) => {
            this._config = {
                ...this._config,
                button_style: {
                    ...(this._config.button_style || {}),
                    icon: e.target.checked,
                },
            };
            this.configChanged(this._config);
        });

        // Show name switch
        const showNameSwitch = this.shadowRoot.querySelector('#show-name');
        showNameSwitch?.addEventListener('change', (e) => {
            this._config = {
                ...this._config,
                button_style: {
                    ...(this._config.button_style || {}),
                    name: e.target.checked,
                },
            };
            this.configChanged(this._config);
        });

        // ha-sortable for reordering effects
        const sortable = this.shadowRoot.querySelector('ha-sortable');
        sortable?.addEventListener('item-moved', (e) => {
            const effects = [...(this._config.effects || [])];
            const movedEffect = effects.splice(e.detail.oldIndex, 1)[0];
            effects.splice(e.detail.newIndex, 0, movedEffect);
            this._config = { ...this._config, effects };
            this.configChanged(this._config);
        });

        // Add effect button
        const addEffectButton = this.shadowRoot.querySelector('#add-effect');
        addEffectButton?.addEventListener('click', () => {
            const effects = [...(this._config.effects || [])];
            effects.push({
                name: '',
                icon: 'mdi:lightbulb',
                colors: ['#CCCCCC'],
            });
            this._config = { ...this._config, effects };
            this.configChanged(this._config);
            this.render();
        });

        // Effect name inputs
        this.shadowRoot.querySelectorAll('.effect-name-input').forEach((input) => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const effects = [...(this._config.effects || [])];
                effects[index] = { ...effects[index], name: e.target.value };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
            });
        });

        // Effect icon pickers
        this.shadowRoot.querySelectorAll('.effect-icon').forEach((picker) => {
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
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const effectIndex = parseInt(button.dataset.effectIndex);
                const effects = [...(this._config.effects || [])];
                const colors = [...(effects[effectIndex].colors || [effects[effectIndex].color] || ['#CCCCCC'])];
                colors.push('#CCCCCC');
                effects[effectIndex] = { ...effects[effectIndex], colors, color: undefined };
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.render();
            });
        });

        // Delete effect buttons
        this.shadowRoot.querySelectorAll('.delete').forEach((button) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(button.dataset.index);
                const effects = [...(this._config.effects || [])];
                effects.splice(index, 1);
                this._config = { ...this._config, effects };
                this.configChanged(this._config);
                this.render();
            });
        });
    }
}

customElements.define('nanoleaf-effect-card-editor', NanoleafEffectCardEditor);
