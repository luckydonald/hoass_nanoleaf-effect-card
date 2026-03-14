/// <reference types="vite/client" />

// Exported element interfaces for Home Assistant web components
export interface HACardElement extends HTMLElement {
  header?: string;
}

export interface HAIconElement extends HTMLElement {
  icon: string;
}

export interface HAIconButtonElement extends HTMLElement {}

export interface HASwitchElement extends HTMLInputElement {
  // HTMLInputElement already has `checked`, but keep as explicit contract
  checked: boolean;
}

export interface HADialogElement extends HTMLElement {
  open: boolean;
  heading: string;
}

export interface HATextfieldElement extends HTMLInputElement {
  label: string;
  value: string;
}

export interface HASelectElement extends HTMLSelectElement {
  label: string;
  value: string;
}

export interface HAFabElement extends HTMLElement {
  extended: boolean;
  label: string;
}

export interface HAListElement extends HTMLElement {}

export interface HAListItemElement extends HTMLElement {
  graphic: string;
  hasMeta: boolean;
}

export interface HAExpansionPanelElement extends HTMLElement {
  outlined: boolean;
  expanded: boolean;
  header: string;
}

export interface HAFormfieldElement extends HTMLElement {
  label: string;
}

export interface HAEntityPickerElement extends HTMLElement {
  hass: unknown;
  value: string;
  label: string;
  includeDomains: string[];
}

export interface HAButtonElement extends HTMLElement {
  raised: boolean;
  outlined: boolean;
  dense: boolean;
  slot: string;
  dialogAction: string;
}

export interface HARadioElement extends HTMLInputElement {
  name: string;
  value: string;
  checked: boolean;
}

export interface HAIconPickerElement extends HTMLElement {
  value: string;
}

export interface HASortableElement extends HTMLElement {
  disabled: boolean;
}

export interface HAGenericPickerElement extends HTMLElement {
  hass: unknown;
  value: string;
  options: Array<{ label: string; value: string }>;
}

// Augment HTMLElementTagNameMap for Home Assistant custom elements
declare global {
  interface HTMLElementTagNameMap {
    'ha-card': HACardElement;
    'ha-icon': HAIconElement;
    'ha-icon-button': HAIconButtonElement;
    'ha-switch': HASwitchElement;
    'ha-dialog': HADialogElement;
    'ha-textfield': HATextfieldElement;
    'ha-select': HASelectElement;
    'ha-fab': HAFabElement;
    'ha-list': HAListElement;
    'ha-list-item': HAListItemElement;
    'ha-expansion-panel': HAExpansionPanelElement;
    'ha-formfield': HAFormfieldElement;
    'ha-entity-picker': HAEntityPickerElement;
    'ha-button': HAButtonElement;
    'ha-radio': HARadioElement;
    'ha-icon-picker': HAIconPickerElement;
    'ha-sortable': HASortableElement;
    'ha-generic-picker': HAGenericPickerElement;
  }

  interface Window {
    customCards?: {
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      version?: string;
    }[];
    customCardFeatures?: {
      type: string;
      name: string;
      configurable?: boolean;
    }[];
  }
}

export {};
