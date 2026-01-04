class NanoleafEffectCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
    }

    setConfig(config) {
        this._config = config;
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
        if (!this._config) return;

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
            <option value="buttons" ${this._config.display === 'buttons' ? 'selected' : ''}>Buttons</option>
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
    icon: 'mdi:looks'
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
