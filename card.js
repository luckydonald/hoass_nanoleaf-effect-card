class NanoleafEffectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }

        this._config = {
            entity: config.entity,
            display: config.display || 'buttons',
            button_style: {
                inactive_color: config.button_style?.inactive_color || '#CCCCCC',
                icon: config.button_style?.icon !== false,
                name: config.button_style?.name !== false,
            },
            effects: config.effects || [],
        };

        this.render();
    }

    set hass(hass) {
        this._hass = hass;
        this.render();
    }

    getCardSize() {
        return this._config.display === 'dropdown' ? 1 : Math.ceil((this._config.effects.length + 1) / 3);
    }

    render() {
        if (!this._hass || !this._config.entity) return;

        const entity = this._hass.states[this._config.entity];
        if (!entity) {
            this.shadowRoot.innerHTML = `
        <ha-card>
          <div style="padding: 16px; color: red;">
            Entity not found: ${this._config.entity}
          </div>
        </ha-card>
      `;
            return;
        }

        const currentEffect = entity.attributes.effect || null;
        const isOn = entity.state === 'on';

        this.shadowRoot.innerHTML = `
      <style>
        ${this.getStyles()}
      </style>
      ${
          this._config.display === 'dropdown'
              ? this.renderDropdown(currentEffect, isOn)
              : this.renderButtons(currentEffect, isOn)
      }
    `;

        this.attachEventListeners();
    }

    getStyles() {
        return `
      :host {
        display: block;
      }
      
      .effect-card {
        padding: 16px;
      }

      .dropdown-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .effect-dropdown {
        flex: 1;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        cursor: pointer;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }

      .buttons-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
      }

      .effect-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 8px;
        border: none;
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 60px;
        position: relative;
        overflow: hidden;
      }

      .effect-button:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .effect-button.active {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 10px rgba(var(--rgb-primary-color), 0.5);
      }

      .effect-button.inactive {
        opacity: 0.6;
      }

      .button-icon {
        font-size: 24px;
        margin-bottom: 4px;
      }

      .button-name {
        font-size: 12px;
        text-align: center;
        word-wrap: break-word;
      }

      .color-animation {
        animation: colorCycle 3s infinite;
      }

      @keyframes colorCycle {
        0%, 100% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(180deg); }
      }

      ha-icon {
        --mdc-icon-size: 24px;
      }
    `;
    }

    renderDropdown(currentEffect, isOn) {
        const effects = [{ name: 'Off', icon: 'mdi:power', colors: ['#666666'] }, ...this._config.effects];

        return `
      <div class="effect-card">
        <div class="dropdown-container">
          <select class="effect-dropdown" data-effect="${isOn ? currentEffect : 'Off'}">
            ${effects
                .map((effect) => {
                    const selected = (effect.name === 'Off' && !isOn) || (effect.name === currentEffect && isOn);
                    const colors = this.getEffectColors(effect);
                    const color = colors[0] || '#CCCCCC';
                    return `
                <option value="${effect.name}" ${selected ? 'selected' : ''}>
                  ${effect.name}
                </option>
              `;
                })
                .join('')}
          </select>
        </div>
      </div>
    `;
    }

    renderButtons(currentEffect, isOn) {
        const effects = [{ name: 'Off', icon: 'mdi:power', colors: ['#666666'] }, ...this._config.effects];

        return `
      <div class="effect-card">
        <div class="buttons-container">
          ${effects
              .map((effect) => {
                  const isActive = (effect.name === 'Off' && !isOn) || (effect.name === currentEffect && isOn);
                  const colors = this.getEffectColors(effect);
                  const buttonStyle = effect.button_style || this._config.button_style;
                  const inactiveColor = buttonStyle.inactive_color || '#CCCCCC';
                  const showIcon = buttonStyle.icon !== false;
                  const showName = buttonStyle.name !== false;

                  const bgColor = isActive ? colors[0] : inactiveColor;
                  const bgGradient =
                      isActive && colors.length > 1 ? `linear-gradient(135deg, ${colors.join(', ')})` : bgColor;

                  return `
              <button 
                class="effect-button ${isActive ? 'active' : 'inactive'}" 
                data-effect="${effect.name}"
                style="background: ${bgGradient}; color: ${this.getContrastColor(colors[0] || inactiveColor)};"
              >
                ${
                    showIcon
                        ? `
                  <div class="button-icon ${isActive && colors.length > 1 ? 'color-animation' : ''}">
                    <ha-icon icon="${effect.icon || 'mdi:lightbulb'}"></ha-icon>
                  </div>
                `
                        : ''
                }
                ${
                    showName
                        ? `
                  <div class="button-name">${effect.name}</div>
                `
                        : ''
                }
              </button>
            `;
              })
              .join('')}
        </div>
      </div>
    `;
    }

    getEffectColors(effect) {
        if (effect.colors && Array.isArray(effect.colors)) {
            return effect.colors;
        }
        if (effect.color) {
            return [effect.color];
        }
        return ['#CCCCCC'];
    }

    getContrastColor(hexColor) {
        // Remove # if present
        const hex = hexColor.replace('#', '');

        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return black or white depending on luminance
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    attachEventListeners() {
        if (this._config.display === 'dropdown') {
            const dropdown = this.shadowRoot.querySelector('.effect-dropdown');
            if (dropdown) {
                dropdown.addEventListener('change', (e) => this.handleEffectSelect(e.target.value));
            }
        } else {
            const buttons = this.shadowRoot.querySelectorAll('.effect-button');
            buttons.forEach((button) => {
                button.addEventListener('click', (e) => {
                    const effectName = e.currentTarget.getAttribute('data-effect');
                    this.handleEffectSelect(effectName);
                });
            });
        }
    }

    handleEffectSelect(effectName) {
        if (!this._hass) return;

        const entity = this._hass.states[this._config.entity];
        if (!entity) return;

        if (effectName === 'Off') {
            // Turn off the light
            this._hass.callService('light', 'turn_off', {
                entity_id: this._config.entity,
            });
        } else {
            // Check if effect is in the entity's effect_list
            const effectList = entity.attributes.effect_list || [];

            if (effectList.includes(effectName)) {
                // Turn on the light with the selected effect
                this._hass.callService('light', 'turn_on', {
                    entity_id: this._config.entity,
                    effect: effectName,
                });
            } else {
                // Show a warning if effect is not available
                console.warn(`Effect "${effectName}" is not available for ${this._config.entity}`);
                this._hass.callService('system_log', 'write', {
                    message: `Nanoleaf Effect Card: Effect "${effectName}" is not in the effect_list for ${this._config.entity}`,
                    level: 'warning',
                });
            }
        }
    }

    static getConfigElement() {
        return document.createElement('nanoleaf-effect-card-editor');
    }

    static getStubConfig() {
        return {
            entity: '',
            display: 'buttons',
            effects: [],
        };
    }
}

customElements.define('nanoleaf-effect-card', NanoleafEffectCard);

// Visual Editor
class NanoleafEffectCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
    }

    setConfig(config) {
        this._config = config || {};
        this.render();
    }

    configChanged(newConfig) {
        const event = new Event('config-changed', {
            bubbles: true,
            composed: true,
        });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);
    }

    render() {
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
          margin-bottom: 4px;
          font-weight: 500;
        }
        .setting input,
        .setting select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
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
      </style>
      <div class="editor-container">
        <div class="section-title">Basic Settings</div>
        
        <div class="setting">
          <label>Entity</label>
          <input
            type="text"
            id="entity"
            value="${this._config.entity || ''}"
            placeholder="light.nanoleaf_shapes"
          />
          <div class="info">The Nanoleaf light entity to control</div>
        </div>

        <div class="setting">
          <label>Display Mode</label>
          <select id="display">
            <option value="buttons" ${
                this._config.display === 'buttons' || !this._config.display ? 'selected' : ''
            }>Buttons</option>
            <option value="dropdown" ${this._config.display === 'dropdown' ? 'selected' : ''}>Dropdown</option>
          </select>
          <div class="info">How to display the effect selection</div>
        </div>

        <div class="section-title">Button Style (Global)</div>

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
          <label>
            <input
              type="checkbox"
              id="show-icon"
              ${this._config.button_style?.icon !== false ? 'checked' : ''}
            />
            Show Icons
          </label>
        </div>

        <div class="setting">
          <label>
            <input
              type="checkbox"
              id="show-name"
              ${this._config.button_style?.name !== false ? 'checked' : ''}
            />
            Show Effect Names
          </label>
        </div>

        <div class="section-title">Effects</div>
        <div class="info" style="margin-bottom: 12px;">
          Configure effects in YAML mode. Each effect should have a name matching your Nanoleaf's effect_list.
          <br><br>
          Example:
          <pre style="background: var(--code-editor-background-color, #f5f5f5); padding: 8px; border-radius: 4px; overflow-x: auto;">
effects:
  - name: 'Rainbow'
    icon: 'mdi:rainbow'
    color: '#FF00FF'
  - name: 'Sunrise'
    icon: 'mdi:weather-sunset-up'
    colors:
      - '#FFA500'
      - '#FFFF00'
      - '#FF4500'
          </pre>
        </div>
      </div>
    `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const entityInput = this.shadowRoot.getElementById('entity');
        const displaySelect = this.shadowRoot.getElementById('display');
        const inactiveColorInput = this.shadowRoot.getElementById('inactive-color');
        const showIconCheckbox = this.shadowRoot.getElementById('show-icon');
        const showNameCheckbox = this.shadowRoot.getElementById('show-name');

        entityInput?.addEventListener('input', (e) => {
            this._config = { ...this._config, entity: e.target.value };
            this.configChanged(this._config);
        });

        displaySelect?.addEventListener('change', (e) => {
            this._config = { ...this._config, display: e.target.value };
            this.configChanged(this._config);
        });

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

        showIconCheckbox?.addEventListener('change', (e) => {
            this._config = {
                ...this._config,
                button_style: {
                    ...(this._config.button_style || {}),
                    icon: e.target.checked,
                },
            };
            this.configChanged(this._config);
        });

        showNameCheckbox?.addEventListener('change', (e) => {
            this._config = {
                ...this._config,
                button_style: {
                    ...(this._config.button_style || {}),
                    name: e.target.checked,
                },
            };
            this.configChanged(this._config);
        });
    }
}

customElements.define('nanoleaf-effect-card-editor', NanoleafEffectCardEditor);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
    type: 'nanoleaf-effect-card',
    name: 'Nanoleaf Effect Card',
    description: 'A card for controlling Nanoleaf light effects',
    preview: true,
    documentationURL: 'https://github.com/luckydonald/hoass_nanoleaf-effect-card',
});

console.info(
    '%c NANOLEAF-EFFECT-CARD %c v0.0.0 ',
    'color: white; background: #03a9f4; font-weight: 700;',
    'color: #03a9f4; background: white; font-weight: 700;'
);
