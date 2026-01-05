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
                compact: config.button_style?.compact === true,
                color_display: { ...defaultColorDisplays, ...(config.button_style?.color_display || {}) },
            },
            effects: (config.effects || []).map((ef) => ({
                ...ef,
                button_style: {
                    ...(ef.button_style || {}),
                    color_display: { ...defaultColorDisplays, ...((ef.button_style || {}).color_display || {}) },
                },
            })),
            show_off: config.show_off !== false, // new config option, default true
            show_none: config.show_none === true, // new config option, default false
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
        if (!this._config || !this._config.entity) return;

        // Use safe defaults if hass or the entity isn't available (allow tests without hass)
        const entity = this._hass?.states?.[this._config.entity] || null;
        const currentEffect = entity?.attributes?.effect || null;
        const isOn = Boolean(entity && entity.state === 'on');

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

        // Ensure compact classes are applied in the DOM (helps tests and dynamic updates)
        const containerEl = this.shadowRoot.querySelector('.buttons-container');
        if (containerEl) {
            if (this._config.button_style?.compact) {
                containerEl.classList.add('compact-grid');
            } else {
                containerEl.classList.remove('compact-grid');
            }
            // Apply compact class to each button as needed (global fallback)
            this.shadowRoot.querySelectorAll('.effect-button').forEach((btn) => {
                const effectName = btn.getAttribute('data-effect');
                const effect = (this._config.effects || []).find((e) => e.name === effectName) || null;
                const perEffectCompact = effect?.button_style?.compact === true;
                if (perEffectCompact || this._config.button_style?.compact) {
                    btn.classList.add('compact');
                } else {
                    btn.classList.remove('compact');
                }
            });
        }
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

      /* Compact / inline button style */
      .effect-button.compact { flex-direction: row; align-items: center; gap: 8px; padding: 6px 8px; min-height: 40px; }
      .effect-button.compact .button-icon { font-size: 18px; margin-bottom: 0; margin-right: 6px; }
      .effect-button.compact .button-name { font-size: 12px; text-align: left; }
      .buttons-container.compact-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }

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
        const effects = [
            ...(this._config.show_off === false ? [] : [{ name: 'Off', icon: 'mdi:power', colors: ['#666666'] }]),
            ...(this._config.show_none ? [{ name: 'None', icon: 'mdi:cancel', colors: ['#888888'] }] : []),
            ...this._config.effects,
        ];

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
            // Conditionally include Off / None special items
            ...(this._config.show_off === false
                ? []
                : [{ name: 'Off', icon: 'mdi:power', colors: ['#666666'], button_style: { color_display: {} } }]),
            ...(this._config.show_none
                ? [{ name: 'None', icon: 'mdi:cancel', colors: ['#888888'], button_style: { color_display: {} } }]
                : []),
            ...this._config.effects,
        ];

        return `
      <div class="effect-card">
        <div class="buttons-container ${this._config.button_style?.compact ? 'compact-grid' : ''}">
          ${effects
              .map((effect) => {
                  const isActive = (effect.name === 'Off' && !isOn) || (effect.name === currentEffect && isOn);
                  // getEffectColors may return an empty array if the user removed all colors
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

                  // If colors array is empty, use inactiveColor as fallback for rendering styles
                  const colorsForStyle = colors && colors.length > 0 ? colors : [inactiveColor];
                  const bgGradient = `linear-gradient(135deg, ${colorsForStyle.join(', ')})`;
                  const bgColor = isActive ? colorsForStyle[0] : inactiveColor;

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

                  // compact class if globally compact or per-effect override
                  const compactClass =
                      (effect.button_style && effect.button_style.compact) || this._config.button_style?.compact
                          ? 'compact'
                          : '';

                  // hover data attrs
                  const hoverAttrs = [];
                  if (applyHover('border')) hoverAttrs.push('data-hover-border="true"');
                  if (applyHover('full_background')) hoverAttrs.push('data-hover-full_background="true"');
                  if (applyHover('text')) hoverAttrs.push('data-hover-text="true"');
                  if (applyHover('small_bar')) hoverAttrs.push('data-hover-small_bar="true"');

                  return `
               <button 
                class="effect-button ${isActive ? 'active' : 'inactive'} ${compactClass}" 
                 data-effect="${effect.name}"
                 ${hoverAttrs.join(' ')}
                 style="${fullBg} ${borderStyle} --hover-bg: ${bgGradient}; color: ${this.getContrastColor(
                      colorsForStyle[0]
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
        // Return the raw colors array if present and non-empty. If a single `color` is set, return it.
        // If no color is provided, return an empty array — the renderer will visually fall back to the inactive color.
        if (effect.colors && Array.isArray(effect.colors) && effect.colors.length > 0) return effect.colors;
        if (effect.color) return [effect.color];
        return [];
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

        const serviceData = { entity_id: this._config.entity };
        let turnOn = true;

        if (effectName === 'Off') {
            turnOn = false;
        } else if (effectName === 'None') {
            // 'None' clears the active effect while leaving the light on (revert to previous color mode)
            // Reading color_mode and the state fitting that, we can turn on the light without specifying an effect, by setting previous colors.
            const colorMode = entity.attributes.color_mode ?? 'unknown';

            if (colorMode === 'hs') {
                serviceData.hs_color = entity.attributes.hs_color;
            } else if (colorMode === 'xy') {
                serviceData.xy_color = entity.attributes.xy_color;
            } else if (colorMode === 'rgb') {
                serviceData.rgb_color = entity.attributes.rgb_color;
            } else if (colorMode === 'color_temp') {
                serviceData.color_temp = entity.attributes.color_temp;
            } else if (colorMode === 'brightness') {
                serviceData.brightness = entity.attributes.brightness;
            }
        } else {
            const effectList = entity.attributes.effect_list || [];
            if (effectList.includes(effectName)) {
                this._hass.callService('light', 'turn_on', { entity_id: this._config.entity, effect: effectName });
            } else {
                console.warn(`Effect "${effectName}" is not available for ${this._config.entity}`);
                const message = `Effect "${effectName}" is not available for ${this._config.entity}`;
                try {
                    this._hass.callService('system_log', 'write', {
                        message,
                        level: 'warning',
                    });
                } catch (e) {
                    console.warn(message, e);
                }
            }
            return;
        }
        this._hass.callService('light', turnOn ? 'turn_on' : 'turn_off', serviceData);
    }

    static async getConfigElement() {
        // Dynamically import the editor module so the custom element is defined
        try {
            await import('./card-editor.js');
        } catch (e) {
            // If import fails, still return an element so callers can handle it; setConfig may be undefined
        }
        const el = document.createElement('nanoleaf-effect-card-editor');
        // Defensive: if the editor element doesn't expose setConfig (broken editor), provide a no-op fallback
        if (typeof el.setConfig !== 'function') {
            el.setConfig = function (cfg) {
                // Minimal fallback: store the config so callers that inspect the element don't crash
                this._config = cfg;
                // Log a warning so integrators can detect missing editor behavior in the frontend
                try {
                    // eslint-disable-next-line no-console
                    console.warn('nanoleaf-effect-card-editor: fallback setConfig called with', cfg);
                } catch (e) {
                    // ignore in environments without console
                }
                // Render a minimal visible UI informing the user the visual editor is unavailable
                try {
                    const msg = `
                        <div class="nanoleaf-editor-fallback" style="padding:12px;border:1px solid #f0ad4e;background:#fff9e6;color:#333;border-radius:6px;font-family:Arial, sans-serif;">
                          <div style="font-weight:600;color:#d9534f;">Editor unavailable</div>
                          <div style="margin-top:6px;font-size:13px;">The visual editor failed to load. You can edit the configuration manually.</div>
                        </div>
                    `;
                    // Prefer shadow DOM if available, but fall back to light DOM
                    if (this.attachShadow && this.shadowRoot) {
                        this.shadowRoot.innerHTML = msg;
                    } else if (this.attachShadow) {
                        this.attachShadow({ mode: 'open' });
                        this.shadowRoot.innerHTML = msg;
                    } else {
                        this.innerHTML = msg;
                    }
                } catch (e) {
                    // swallow any rendering errors in fallback
                }
            };
        }
        return el;
    }

    static getSupportedEntityIds(ha) {
        return Object.values(ha.states)
            .filter(
                (entity) =>
                    entity.entity_id.startsWith('light.') &&
                    entity.attributes &&
                    entity.attributes.supported_color_modes &&
                    entity.attributes.supported_color_modes.find((mode) => ['hs', 'rgb', 'xy'].indexOf(mode) !== -1)
            )
            .filter((entity) => {
                const attrs = entity.attributes ?? {};

                // required effect fields
                if (!Array.isArray(attrs.effect_list)) return false;
                if (!('effect' in attrs)) return false; // may be null

                // colour‑mode specific validation
                const mode = attrs.color_mode;
                if (mode === 'color_temp') {
                    if (
                        !Array.isArray(attrs.supported_color_modes) ||
                        !attrs.supported_color_modes.includes('color_temp')
                    ) {
                        return false;
                    }
                    if (typeof attrs.color_temp !== 'number') return false;
                } else if (mode === 'hs') {
                    if (!Array.isArray(attrs.supported_color_modes) || !attrs.supported_color_modes.includes('hs')) {
                        return false;
                    }
                    if (
                        !Array.isArray(attrs.hs_color) ||
                        attrs.hs_color.length !== 2 ||
                        typeof attrs.hs_color[0] !== 'number' ||
                        typeof attrs.hs_color[1] !== 'number'
                    ) {
                        return false;
                    }
                } else {
                    return false; // other modes are not relevant here
                }

                return true;
            })
            .map((entity) => entity.entity_id);
    }

    static getStubConfig() {
        return {
            entity: '',
            display: 'buttons',
            effects: [],
            show_off: true,
            show_none: false,
        };
    }
}

window.customElements.define('nanoleaf-effect-card', NanoleafEffectCard);
