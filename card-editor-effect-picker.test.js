import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Minimal DOM setup for component tests
const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

describe('card-editor-effect-picker', () => {
    beforeEach(async () => {
        // import the component module freshly
        await import('./card-editor-effect-picker.js');
    });

    it('populates options and dispatches value-changed (happy path)', async () => {
        const picker = document.createElement('card-editor-effect-picker');
        document.body.appendChild(picker);

        const hass = { states: { 'light.test': { attributes: { effect_list: ['A', 'B'] } } } };
        picker.hass = hass;
        picker.entity = 'light.test';

        // ensure options updated
        const internal = picker.shadowRoot.querySelector('ha-generic-picker');
        expect(internal).toBeTruthy();
        // the component maps options to objects; verify the options array exists
        expect(internal.options).toBeTruthy();
        expect(internal.options.length).toBe(2);
        expect(internal.options[0].value).toBe('A');

        let last = null;
        picker.addEventListener('value-changed', (e) => (last = e.detail.value));

        // simulate inner picker dispatch
        const ev = new window.CustomEvent('value-changed', { detail: { value: 'B' } });
        internal.dispatchEvent(ev);

        expect(last).toBe('B');
        expect(picker.value).toBe('B');
    });

    it('works when entity is not provided (no options)', async () => {
        const picker = document.createElement('card-editor-effect-picker');
        document.body.appendChild(picker);

        const hass = { states: {} };
        picker.hass = hass;
        picker.entity = undefined;

        const internal = picker.shadowRoot.querySelector('ha-generic-picker');
        expect(internal).toBeTruthy();
        expect(internal.options).toEqual([]);

        let last = null;
        picker.addEventListener('value-changed', (e) => (last = e.detail.value));
        const ev = new window.CustomEvent('value-changed', { detail: { value: '' } });
        internal.dispatchEvent(ev);
        expect(last).toBe('');
    });

    it('handles empty effect_list gracefully', async () => {
        const picker = document.createElement('card-editor-effect-picker');
        document.body.appendChild(picker);

        const hass = { states: { 'light.test': { attributes: { effect_list: [] } } } };
        picker.hass = hass;
        picker.entity = 'light.test';

        const internal = picker.shadowRoot.querySelector('ha-generic-picker');
        expect(internal).toBeTruthy();
        expect(internal.options).toEqual([]);
    });
});
