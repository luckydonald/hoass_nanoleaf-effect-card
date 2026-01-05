// Nanoleaf Effect Card Editor - Button Style Chooser

class NanoleafEffectCardCardEditorButtonStyleChooser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = {};
        this._bound = false;
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
        if (this._bound) return;
        this._bound = true;
    }

    _updateKey(key) {
        const root = this.shadowRoot;
        const item = root.querySelector(`.item[data-key="${key}"]`);
        if (!item) return;
        const btnActive = item.querySelector('.btn-active');
        const btnInactive = item.querySelector('.btn-inactive');
        const btnHover = item.querySelector('.btn-hover');
        const current = this._value[key] || { active: false, inactive: false, hover: false };
        current.active = btnActive.classList.contains('active');
        current.inactive = btnInactive.classList.contains('active');
        current.hover = btnHover ? btnHover.classList.contains('active') : false;
        this._value = { ...this._value, [key]: current };
        let out;
        try {
            out = JSON.parse(JSON.stringify(this._value));
        } catch (e) {
            out = { ...this._value };
        }
        this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: out }, bubbles: true, composed: true }));
        // also microtask dispatch
        try {
            Promise.resolve().then(() => {
                this.dispatchEvent(
                    new CustomEvent('value-changed', { detail: { value: out }, bubbles: true, composed: true })
                );
            });
        } catch (e) {}
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

        // After injecting HTML, attach per-button listeners (guarded) to ensure reliable events
        this.shadowRoot.querySelectorAll('.toggle-btn').forEach((btn) => {
            if (btn._nanoleaf_bound) return;
            btn._nanoleaf_bound = true;
            btn.addEventListener('click', (e) => {
                // Toggle active class (click doesn't change classes automatically)
                btn.classList.toggle('active');
                const item = btn.closest('.item');
                if (!item) return;
                const key = item.dataset.key;
                this._updateKey(key);
            });
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.classList.toggle('active');
                    const item = btn.closest('.item');
                    if (!item) return;
                    const key = item.dataset.key;
                    this._updateKey(key);
                }
            });
        });
    }
}

customElements.define(
    'nanoleaf-effect-card-card-editor-button-style-chooser',
    NanoleafEffectCardCardEditorButtonStyleChooser
);
