class CardEditorEffectPicker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._hass = null;
        this._entity = null;
        this._value = '';
        this._options = [];
        this._pickerBound = false;
        this._onPickerValueChanged = this._onPickerValueChanged.bind(this);
    }

    static get observedAttributes() {
        return ['entity'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'entity' && oldVal !== newVal) {
            this.entity = newVal;
        }
    }

    connectedCallback() {
        this.render();
    }

    set hass(hass) {
        this._hass = hass;
        // update picker hass and options
        const picker = this.shadowRoot?.querySelector('ha-generic-picker');
        if (picker) picker.hass = hass;
        this._updateOptions();
    }

    get hass() {
        return this._hass;
    }

    set entity(entityId) {
        this._entity = entityId;
        this._updateOptions();
    }

    get entity() {
        return this._entity;
    }

    set value(val) {
        this._value = val ?? '';
        const picker = this.shadowRoot?.querySelector('ha-generic-picker');
        if (picker) picker.value = this._value;
    }

    get value() {
        return this._value;
    }

    _onPickerValueChanged(ev) {
        const newVal = ev?.detail?.value;
        this._value = newVal;
        // re-dispatch as composed so host can listen outside shadow
        this.dispatchEvent(
            new CustomEvent('value-changed', { detail: { value: newVal }, bubbles: true, composed: true })
        );
    }

    _updateOptions() {
        const list = this._hass?.states?.[this._entity]?.attributes?.effect_list || [];
        if (!Array.isArray(list)) {
            this._options = [];
        } else {
            // map to {label, value}
            this._options = list.map((name) => ({ label: name, value: name }));
        }

        const picker = this.shadowRoot?.querySelector('ha-generic-picker');
        if (picker) {
            picker.options = this._options;
            // Keep picker value in sync
            if (this._value !== undefined && this._value !== null) picker.value = this._value;
        }
    }

    render() {
        // Minimal styling; host can size the element as needed
        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        ha-generic-picker { width: 100%; }
      </style>
      <ha-generic-picker></ha-generic-picker>
    `;

        const picker = this.shadowRoot.querySelector('ha-generic-picker');
        if (!picker) return;

        // Initialize properties
        if (this._hass) picker.hass = this._hass;
        if (this._options) picker.options = this._options;
        if (this._value) picker.value = this._value;

        if (!this._pickerBound) {
            picker.addEventListener('value-changed', this._onPickerValueChanged);
            this._pickerBound = true;
        }
    }
}

customElements.define('card-editor-effect-picker', CardEditorEffectPicker);
