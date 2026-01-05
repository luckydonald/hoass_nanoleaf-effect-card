// Nanoleaf Effect Card Editor - Button Style Chooser

class NanoleafEffectCardCardEditorButtonStyleChooser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = this._value || {};
    }

    set value(v) {
        this._value = v || {};
        this.render();
    }

    get value() {
        return this._value;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const v = this._value || {};
        const styles = [
            { key: 'full_background', label: 'Full Background' },
            { key: 'small_bar', label: 'Small Bar' },
            { key: 'text', label: 'Text' },
            { key: 'border', label: 'Border' },
            { key: 'animated_icon', label: 'Animated Icon' },
        ];

        this.shadowRoot.innerHTML = `
      <style>
        .group { display:flex; flex-direction:column; gap:6px; }
        .group.compact { flex-direction:row; flex-wrap:wrap; gap:12px; }
        .item { display:flex; align-items:center; gap:8px; }
        .item.compact { flex-direction:column; align-items:flex-start; min-width:160px; }
        .label { width:140px; font-size:13px; color:var(--primary-text-color); }
        .toggles { display:flex; gap:8px; }
        .toggle-btn { padding:6px 8px; border:1px solid var(--divider-color); border-radius:6px; background:transparent; cursor:pointer; font-size:12px; }
        .toggle-btn.active { background:var(--primary-color); color:white; border-color:var(--primary-color); }
      </style>
      <div class="group ${this.hasAttribute('compact') ? 'compact' : ''}">
        ${styles
            .map((s) => {
                const cfg = v[s.key] || { active: false, inactive: false, hover: false };
                return `
            <div class="item ${this.hasAttribute('compact') ? 'compact' : ''}" data-key="${s.key}">
              <div class="label">${s.label}</div>
              <div class="toggles">
                <button class="toggle-btn btn-active ${cfg.active ? 'active' : ''}" data-mode="active">Active</button>
                <button class="toggle-btn btn-inactive ${
                    cfg.inactive ? 'active' : ''
                }" data-mode="inactive">Inactive</button>
                <button class="toggle-btn btn-hover ${cfg.hover ? 'active' : ''}" data-mode="hover">Hover</button>
              </div>
            </div>
          `;
            })
            .join('')}
      </div>
    `;

        // Attach handlers
        this.shadowRoot.querySelectorAll('.item').forEach((item) => {
            const key = item.dataset.key;
            const btnActive = item.querySelector('.btn-active');
            const btnInactive = item.querySelector('.btn-inactive');
            const btnHover = item.querySelector('.btn-hover');

            const update = () => {
                const current = this._value[key] || { active: false, inactive: false, hover: false };
                current.active = btnActive.classList.contains('active');
                current.inactive = btnInactive.classList.contains('active');
                current.hover = btnHover ? btnHover.classList.contains('active') : false;
                this._value = { ...this._value, [key]: current };
                this.dispatchEvent(
                    new CustomEvent('value-changed', { detail: { value: this._value }, bubbles: true, composed: true })
                );
            };

            btnActive?.addEventListener('click', () => {
                btnActive.classList.toggle('active');
                update();
            });
            btnInactive?.addEventListener('click', () => {
                btnInactive.classList.toggle('active');
                update();
            });
            if (btnHover) {
                btnHover.addEventListener('click', () => {
                    btnHover.classList.toggle('active');
                    update();
                });
            }
        });
    }
}

customElements.define(
    'nanoleaf-effect-card-card-editor-button-style-chooser',
    NanoleafEffectCardCardEditorButtonStyleChooser
);
