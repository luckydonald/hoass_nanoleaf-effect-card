/**
 * Nanoleaf Effect Card
 *
 * A custom Home Assistant Lovelace card for controlling Nanoleaf light effects.
 */
class NanoleafEffectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
    }

    setConfig(config) {
        if (!config || !config.entity) {
            throw new Error('You need to define an entity');
        }

        const defaultColorDisplays = {
            full_background: { active: true, inactive: false },
            small_bar: { active: false, inactive: true },
            text: { active: false, inactive: false },
            border: { active: false, inactive: false },
            animated_icon: { active: true, inactive: false },
        };

        this._config = {
            entity: config.entity,
            display: config.display || 'buttons',
            button_style: {
                inactive_color: config.button_style?.inactive_color || '#CCCCCC',
                icon: config.button_style?.icon !== false,
                name: config.button_style?.name !== false,
                color_display: { ...defaultColorDisplays, ...(config.button_style?.color_display || {}) },
            },
            effects: (config.effects || []).map((ef) => ({
                ...ef,
                button_style: {
                    ...(ef.button_style || {}),
                    color_display: { ...defaultColorDisplays, ...((ef.button_style || {}).color_display || {}) },
                },
            })),
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
        // Basic guards
        if (!this._hass || !this._config || !this._config.entity) return;

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
      :host { display: block; }
      .effect-card { padding: 16px; }

      .buttons-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }

      .effect-button { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; border: none; border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); cursor: pointer; transition: all 0.3s ease; min-height: 60px; position: relative; overflow: hidden; }
      .effect-button:hover { transform: scale(1.02); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .effect-button.active { box-shadow: 0 0 12px rgba(var(--rgb-primary-color), 0.08); }
      .effect-button.inactive { opacity: 0.9; }
      .button-icon { font-size: 24px; margin-bottom: 4px; display:inline-flex; align-items:center; justify-content:center; }
      .button-name { font-size: 12px; text-align: center; word-wrap: break-word; }

      .color-bar { transition: all 0.3s ease; }

      .icon-animated ha-icon { animation: hueRotate 3s linear infinite; }

      @keyframes hueRotate { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(180deg); } 100% { filter: hue-rotate(360deg); } }

      /* Hover-based styles applied by data attributes */
      button[data-hover-border="true"]:hover { border: 2px solid transparent; border-image: inherit; }
      button[data-hover-full_background="true"]:hover { background: var(--hover-bg, inherit); }
      button[data-hover-text="true"]:hover .button-name, button[data-hover-text="true"]:hover .button-icon { background: var(--hover-bg, inherit); -webkit-background-clip: text; color: transparent; }
      button[data-hover-small_bar="true"]:hover .color-bar { opacity: 1; }

      ha-icon { --mdc-icon-size: 24px; }
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
        const effects = [
            { name: 'Off', icon: 'mdi:power', colors: ['#666666'], button_style: { color_display: {} } },
            ...this._config.effects,
        ];

        return `
      <div class="effect-card">
        <div class="buttons-container">
          ${effects
              .map((effect) => {
                  const isActive = (effect.name === 'Off' && !isOn) || (effect.name === currentEffect && isOn);
                  const colors = this.getEffectColors(effect);
                  const buttonStyle = { ...(this._config.button_style || {}), ...(effect.button_style || {}) };
                  const inactiveColor = buttonStyle.inactive_color || '#CCCCCC';
                  const showIcon = buttonStyle.icon !== false;
                  const showName = buttonStyle.name !== false;

                  // Decide which styles apply depending on active/inactive flags
                  const colorDisplay = buttonStyle.color_display || {};

                  const applyStyle = (styleKey) => {
                      const cfg = colorDisplay[styleKey] || {};
                      return (isActive && cfg.active) || (!isActive && cfg.inactive);
                  };

                  const applyHover = (styleKey) => {
                      const cfg = colorDisplay[styleKey] || {};
                      return cfg.hover === true;
                  };

                  const bgGradient = `linear-gradient(135deg, ${colors.join(', ')})`;
                  const bgColor = isActive ? colors[0] : inactiveColor;

                  // prepare inline styles
                  const fullBg = applyStyle('full_background')
                      ? `background: ${bgGradient};`
                      : `background: ${bgColor};`;
                  const borderStyle = applyStyle('border')
                      ? `border: 2px solid transparent; border-image: linear-gradient(135deg, ${colors.join(', ')}) 1;`
                      : '';
                  const textGradientStyle = applyStyle('text')
                      ? `background: ${bgGradient}; -webkit-background-clip: text; color: transparent;`
                      : '';
                  const iconAnimatedClass = applyStyle('animated_icon') ? 'icon-animated' : '';

                  // hover data attrs
                  const hoverAttrs = [];
                  if (applyHover('border')) hoverAttrs.push('data-hover-border="true"');
                  if (applyHover('full_background')) hoverAttrs.push('data-hover-full_background="true"');
                  if (applyHover('text')) hoverAttrs.push('data-hover-text="true"');
                  if (applyHover('small_bar')) hoverAttrs.push('data-hover-small_bar="true"');

                  return `
              <button 
                class="effect-button ${isActive ? 'active' : 'inactive'}" 
                data-effect="${effect.name}"
                ${hoverAttrs.join(' ')}
                style="${fullBg} ${borderStyle} --hover-bg: ${bgGradient}; color: ${this.getContrastColor(
                      colors[0] || inactiveColor
                  )};"
              >
                <div class="button-inner" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
                ${
                    showIcon
                        ? `
                  <div class="button-icon ${iconAnimatedClass}" style="${textGradientStyle}">
                    <ha-icon icon="${effect.icon || 'mdi:lightbulb'}"></ha-icon>
                  </div>
                `
                        : ''
                }
                ${
                    showName
                        ? `
                  <div class="button-name" style="${textGradientStyle}">${effect.name}</div>
                `
                        : ''
                }
                ${
                    applyStyle('small_bar')
                        ? `<div class="color-bar" style="margin-top:8px; width:70%; height:8px; border-radius:8px; background: ${bgGradient}; opacity: ${
                              applyHover('small_bar') ? 0.6 : 1
                          };"></div>`
                        : ''
                }
                </div>
              </button>
            `;
              })
              .join('')}
        </div>
      </div>
    `;
    }

    getEffectColors(effect) {
        if (effect.colors && Array.isArray(effect.colors)) return effect.colors;
        if (effect.color) return [effect.color];
        return ['#CCCCCC'];
    }

    getContrastColor(hexColor) {
        const hex = (hexColor || '#FFFFFF').replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
            this._hass.callService('light', 'turn_off', { entity_id: this._config.entity });
        } else {
            const effectList = entity.attributes.effect_list || [];
            if (effectList.includes(effectName)) {
                this._hass.callService('light', 'turn_on', { entity_id: this._config.entity, effect: effectName });
            } else {
                console.warn(`Effect "${effectName}" is not available for ${this._config.entity}`);
                this._hass.callService('system_log', 'write', {
                    message: `Nanoleaf Effect Card: Effect "${effectName}" is not in the effect_list for ${this._config.entity}`,
                    level: 'warning',
                });
            }
        }
    }

    static async getConfigElement() {
        await import('./card-editor.js');
        return document.createElement('nanoleaf-effect-card-editor');
    }

    static getStubConfig() {
        return { entity: '', display: 'buttons', effects: [] };
    }
}

customElements.define('nanoleaf-effect-card', NanoleafEffectCard);

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
