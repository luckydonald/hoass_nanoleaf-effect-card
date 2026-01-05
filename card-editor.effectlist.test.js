import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
    // Import editor (which imports the chooser)
    await import('./card-editor.js');
});

describe('Nanoleaf Effect Card Editor - effect_list suggestions', () => {
    it('populates datalist and marks invalid effect names', async () => {
        const editor = document.createElement('nanoleaf-effect-card-editor');
        document.body.appendChild(editor);

        // Fake hass with a light entity that has an effect_list
        const hass = {
            states: {
                'light.test_light': {
                    attributes: {
                        effect_list: ['Rainbow', 'Sunrise', 'Party'],
                    },
                },
            },
        };

        // set hass then config
        editor.hass = hass;
        editor.setConfig({ entity: 'light.test_light', effects: [{ name: 'Sunrise' }, { name: 'Custom' }] });

        // allow render
        await new Promise((r) => setTimeout(r, 0));

        // The editor now uses per-effect <card-editor-effect-picker> elements.
        const pickers = editor.shadowRoot.querySelectorAll('.effect-picker');
        expect(pickers.length).toBe(2);
        // Each picker contains a shadow ha-generic-picker with an options property
        const p0 = pickers[0].shadowRoot.querySelector('ha-generic-picker');
        expect(p0).toBeTruthy();
        expect(Array.isArray(p0.options)).toBe(true);
        const optionValues = p0.options.map((o) => o.value);
        expect(optionValues).toEqual(expect.arrayContaining(['Rainbow', 'Sunrise', 'Party']));

        // check inputs and validation: first should be valid, second invalid
        const inputs = editor.shadowRoot.querySelectorAll('.effect-name-input');
        expect(inputs.length).toBe(2);
        const first = inputs[0];
        const second = inputs[1];

        expect(first.value).toBe('Sunrise');
        expect(first.classList.contains('invalid')).toBe(false);

        expect(second.value).toBe('Custom');
        expect(second.classList.contains('invalid')).toBe(true);

        // Now update hass to include 'Custom' in effect_list and ensure validation updates
        hass.states['light.test_light'].attributes.effect_list.push('Custom');
        editor.hass = hass; // setter will call updateEffectListSuggestions
        await new Promise((r) => setTimeout(r, 0));

        expect(second.classList.contains('invalid')).toBe(false);

        // Ensure pickers still reflect updated suggestions
        const p0b = pickers[0].shadowRoot.querySelector('ha-generic-picker');
        const valuesAfter = p0b.options.map((o) => o.value);
        expect(valuesAfter).toEqual(expect.arrayContaining(['Rainbow', 'Sunrise', 'Party', 'Custom']));

        // Simulate user editing the second input to an unknown name -> becomes invalid
        second.value = 'NotAnEffect';
        second.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 0));
        expect(second.classList.contains('invalid')).toBe(true);
    });
});
