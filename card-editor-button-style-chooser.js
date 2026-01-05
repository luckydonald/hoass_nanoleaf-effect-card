// Nanoleaf Effect Card Editor - Button Style Chooser

class NanoleafEffectCardCardEditorButtonStyleChooser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = {};
    }

    set value(v) {
        // Merge incoming value with existing internal state to preserve transient flags
        const incoming = v || {};
        const keys = ['full_background', 'small_bar', 'text', 'border', 'animated_icon'];
        const merged = { ...this._value };
        keys.forEach((k) => {
            const prev = this._value[k] || { active: false, inactive: false, hover: false };
            const inc = incoming[k] || {};
            merged[k] = {
                active: typeof inc.active === 'boolean' ? inc.active : prev.active,
                inactive: typeof inc.inactive === 'boolean' ? inc.inactive : prev.inactive,
                hover: typeof inc.hover === 'boolean' ? inc.hover : prev.hover,
            };
        });
        this._value = merged;
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
                <button type="button" class="toggle-btn btn-active ${
                    cfg.active ? 'active' : ''
                }" data-mode="active">Active</button>
                <button type="button" class="toggle-btn btn-inactive ${
                    cfg.inactive ? 'active' : ''
                }" data-mode="inactive">Inactive</button>
                <button type="button" class="toggle-btn btn-hover ${
                    cfg.hover ? 'active' : ''
                }" data-mode="hover">Hover</button>
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

            // Use pointerdown to handle immediate activation; guard click to avoid double toggle
            const makeHandlers = (btn) => {
                if (!btn) return;
                const onPointerDown = (e) => {
                    // Mark that pointerdown handled the activation for this interaction
                    btn.dataset._handled = '1';
                    btn.classList.toggle('active');
                    update();
                };
                const onClick = (e) => {
                    // If pointerdown already handled this interaction, ignore the click
                    if (btn.dataset._handled) {
                        delete btn.dataset._handled;
                        return;
                    }
                    btn.classList.toggle('active');
                    update();
                };
                btn.addEventListener('pointerdown', onPointerDown);
                btn.addEventListener('click', onClick);
            };

            makeHandlers(btnActive);
            makeHandlers(btnInactive);
            makeHandlers(btnHover);
        });
    }
}

customElements.define(
    'nanoleaf-effect-card-card-editor-button-style-chooser',
    NanoleafEffectCardCardEditorButtonStyleChooser
);
