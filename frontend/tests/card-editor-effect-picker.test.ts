import { JSDOM } from 'jsdom';
import {
  beforeEach,
  describe, expect, it,
} from 'vitest';

// Minimal DOM setup for component tests
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

interface PickerOption { value: string; label: string }
type PickerElement = HTMLElement & {
  hass: unknown;
  entity: string | undefined;
  value: string;
};
type InternalPicker = HTMLElement & { options: PickerOption[] };

describe('card-editor-effect-picker', () => {
  beforeEach(async () => {
    // import the component module freshly
    await import('../src/card-editor-effect-picker');
  });

  it('populates options and dispatches value-changed (happy path)', async () => {
    const picker = document.createElement('card-editor-effect-picker') as PickerElement;
    document.body.appendChild(picker);

    const hass = {
      states: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'light.test': {
          attributes: {
            effect_list: [
              'A',
              'B',
            ],
          },
        },
      },
    };
    picker.hass = hass;
    picker.entity = 'light.test';

    // ensure options updated
    const internal = (picker.shadowRoot as ShadowRoot).querySelector('ha-generic-picker') as InternalPicker;
    expect(internal).toBeTruthy();
    // the component maps options to objects; verify the options array exists
    expect(internal.options).toBeTruthy();
    expect(internal.options.length).toBe(2);
    expect(internal.options[0].value).toBe('A');

    let last: string | null = null;
    picker.addEventListener('value-changed', (e) => {
      last = (e as CustomEvent<{ value: string }>).detail.value;
    });

    // simulate inner picker dispatch
    const ev = new window.CustomEvent('value-changed', { detail: { value: 'B' } });
    internal.dispatchEvent(ev);

    expect(last).toBe('B');
    expect(picker.value).toBe('B');
  });

  it('works when entity is not provided (no options)', async () => {
    const picker = document.createElement('card-editor-effect-picker') as PickerElement;
    document.body.appendChild(picker);

    const hass = { states: {} };
    picker.hass = hass;
    picker.entity = undefined;

    const internal = (picker.shadowRoot as ShadowRoot).querySelector('ha-generic-picker') as InternalPicker;
    expect(internal).toBeTruthy();
    expect(internal.options).toEqual([]);

    let last: string | null = null;
    picker.addEventListener('value-changed', (e) => {
      last = (e as CustomEvent<{ value: string }>).detail.value;
    });
    const ev = new window.CustomEvent('value-changed', { detail: { value: '' } });
    internal.dispatchEvent(ev);
    expect(last).toBe('');
  });

  it('handles empty effect_list gracefully', async () => {
    const picker = document.createElement('card-editor-effect-picker') as PickerElement;
    document.body.appendChild(picker);

    const hass = {
      states: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'light.test': { attributes: { effect_list: [] } },
      },
    };
    picker.hass = hass;
    picker.entity = 'light.test';

    const internal = (picker.shadowRoot as ShadowRoot).querySelector('ha-generic-picker') as InternalPicker;
    expect(internal).toBeTruthy();
    expect(internal.options).toEqual([]);
  });
});
