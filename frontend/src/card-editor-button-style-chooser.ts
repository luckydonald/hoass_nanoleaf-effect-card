// Nanoleaf Effect Card Editor - Button Style Chooser

import type { ButtonStyleColorState, ColorDisplayConfig, StyleKey } from './types';

type BoundElement = Element & { _nanoleaf_bound?: boolean; dataset?: DOMStringMap; _handled?: string };

class NanoleafEffectCardCardEditorButtonStyleChooser extends HTMLElement {
  private _value: ColorDisplayConfig = {};

  private _bound = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set value(v: ColorDisplayConfig | null | undefined) {
    // Merge incoming value with existing internal state to preserve transient flags
    const incoming = v ?? {};
    const keys: StyleKey[] = [
      'full_background',
      'small_bar',
      'text',
      'border',
      'animated_icon',
    ];
    const merged: ColorDisplayConfig = { ...this._value };
    keys.forEach((k) => {
      const prev: ButtonStyleColorState = this._value[k] ?? { active: false, inactive: false, hover: false };
      const inc: ButtonStyleColorState = incoming[k] ?? {};
      merged[k] = {
        active: typeof inc.active === 'boolean' ? inc.active : prev.active,
        inactive: typeof inc.inactive === 'boolean' ? inc.inactive : prev.inactive,
        hover: typeof inc.hover === 'boolean' ? inc.hover : prev.hover,
      };
    });
    this._value = merged;
    this.render();
  }

  get value(): ColorDisplayConfig {
    return this._value;
  }

  connectedCallback(): void {
    this.render();
    if (this._bound) return;
    this._bound = true;
  }

  private _updateKey(key: StyleKey): void {
    const root = this.shadowRoot;
    if (!root) return;
    const item = root.querySelector(`.item[data-key="${key}"]`);
    if (!item) return;
    const btnActive = item.querySelector('.btn-active');
    const btnInactive = item.querySelector('.btn-inactive');
    const btnHover = item.querySelector('.btn-hover');
    const current: ButtonStyleColorState = this._value[key] ?? { active: false, inactive: false, hover: false };
    current.active = btnActive?.classList.contains('active') ?? false;
    current.inactive = btnInactive?.classList.contains('active') ?? false;
    current.hover = btnHover ? btnHover.classList.contains('active') : false;
    this._value = { ...this._value, [key]: current };
    let out: ColorDisplayConfig;
    try {
      out = JSON.parse(JSON.stringify(this._value)) as ColorDisplayConfig;
    } catch {
      out = { ...this._value };
    }
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: out }, bubbles: true, composed: true }));
    // also microtask dispatch
    try {
      Promise.resolve().then(() => {
        this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: out }, bubbles: true, composed: true }));
      });
    } catch {
      // ignore
    }
  }

  private get root(): ShadowRoot {
    return this.shadowRoot as ShadowRoot;
  }

  render(): void {
    const v = this._value;
    const styles: { key: StyleKey; label: string }[] = [
      { key: 'full_background', label: 'Full Background' },
      { key: 'small_bar', label: 'Small Bar' },
      { key: 'text', label: 'Text' },
      { key: 'border', label: 'Border' },
      { key: 'animated_icon', label: 'Animated Icon' },
    ];

    this.root.innerHTML = /* html */ `
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
            const cfg = v[s.key] ?? { active: false, inactive: false, hover: false };
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
    this.root.querySelectorAll('.toggle-btn').forEach((btn) => {
      const b = btn as BoundElement;
      if (b._nanoleaf_bound) return;
      b._nanoleaf_bound = true;
      btn.addEventListener('click', () => {
        // Toggle active class (click doesn't change classes automatically)
        // If a prior keyboard event handled activation, ignore this click
        if (b.dataset?._handled) {
          delete b.dataset._handled;
          return;
        }
        btn.classList.toggle('active');
        const item = btn.closest('.item');
        if (!item) return;
        const key = (item as HTMLElement).dataset.key as StyleKey;
        this._updateKey(key);
      });
      btn.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') {
          ke.preventDefault();
          // mark this interaction as handled so click won't toggle again
          if (b.dataset) b.dataset._handled = '1';
          btn.classList.toggle('active');
          const item = btn.closest('.item');
          if (!item) return;
          const key = (item as HTMLElement).dataset.key as StyleKey;
          this._updateKey(key);
        }
      });
    });
  }
}

customElements.define(
  'nanoleaf-effect-card-card-editor-button-style-chooser',
  NanoleafEffectCardCardEditorButtonStyleChooser,
);
