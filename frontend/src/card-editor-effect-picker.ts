import type { HomeAssistant } from './types';

interface PickerOption {
  label: string;
  value: string;
}

type BoundElement = Element & { _nanoleaf_bound?: boolean };

class CardEditorEffectPicker extends HTMLElement {
  private _hass: HomeAssistant | null = null;
  private _entity: string | null = null;
  private _value: string = '';
  private _options: PickerOption[] = [];
  private _pickerBound: boolean = false;
  private _onPickerValueChanged: (ev: Event) => void;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._onPickerValueChanged = this._handlePickerValueChanged.bind(this);
  }

  static get observedAttributes(): string[] {
    return ['entity'];
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
    if (name === 'entity' && oldVal !== newVal) {
      this.entity = newVal ?? '';
    }
  }

  connectedCallback(): void {
    this.render();
  }

  set hass(hass: HomeAssistant | null) {
    this._hass = hass;
    // update picker hass and options
    const picker = this.shadowRoot?.querySelector('ha-generic-picker');
    if (picker) (picker as Element & { hass: unknown }).hass = hass;
    this._updateOptions();
  }

  get hass(): HomeAssistant | null {
    return this._hass;
  }

  set entity(entityId: string | null | undefined) {
    this._entity = entityId ?? null;
    this._updateOptions();
  }

  get entity(): string | null {
    return this._entity;
  }

  set value(val: string) {
    this._value = val ?? '';
    const picker = this.shadowRoot?.querySelector('ha-generic-picker');
    if (picker) (picker as Element & { value: string }).value = this._value;
  }

  get value(): string {
    return this._value;
  }

  private _handlePickerValueChanged(ev: Event): void {
    const customEv = ev as CustomEvent<{ value: string }>;
    const newVal = customEv?.detail?.value;
    this._value = newVal;
    // re-dispatch as composed so host can listen outside shadow
    this.dispatchEvent(
      new CustomEvent('value-changed', { detail: { value: newVal }, bubbles: true, composed: true }),
    );
  }

  private _updateOptions(): void {
    const entity = this._entity;
    const list = entity
      ? (this._hass?.states?.[entity]?.attributes?.['effect_list'] as string[] | undefined) ?? []
      : [];
    if (!Array.isArray(list)) {
      this._options = [];
    } else {
      // map to {label, value}
      this._options = list.map((name) => ({ label: name, value: name }));
    }

    const picker = this.shadowRoot?.querySelector('ha-generic-picker');
    if (picker) {
      (picker as Element & { options: PickerOption[] }).options = this._options;
      // Keep picker value in sync
      if (this._value !== undefined && this._value !== null) {
        (picker as Element & { value: string }).value = this._value;
      }
    }
  }

  render(): void {
    // Minimal styling; host can size the element as needed
    this.shadowRoot!.innerHTML = /* html */ `
      <style>
        :host { display: block; }
        ha-generic-picker { width: 100%; }
      </style>
      <ha-generic-picker></ha-generic-picker>
    `;

    const picker = this.shadowRoot!.querySelector('ha-generic-picker');
    if (!picker) return;

    // Initialize properties
    if (this._hass) (picker as Element & { hass: unknown }).hass = this._hass;
    if (this._options) (picker as Element & { options: PickerOption[] }).options = this._options;
    if (this._value) (picker as Element & { value: string }).value = this._value;

    if (!this._pickerBound) {
      picker.addEventListener('value-changed', this._onPickerValueChanged);
      this._pickerBound = true;
    }
  }
}

customElements.define('card-editor-effect-picker', CardEditorEffectPicker);
