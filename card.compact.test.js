import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
    await import('./card.js');
});

describe('NanoleafEffectCard - compact style', () => {
    it('applies compact-grid and compact button classes when configured', async () => {
        const card = document.createElement('nanoleaf-effect-card');
        document.body.appendChild(card);

        const hass = {
            states: {
                'light.test_nanoleaf': {
                    state: 'on',
                    attributes: {
                        effect: 'Rainbow',
                        effect_list: ['Rainbow', 'Sunrise'],
                    },
                },
            },
            callService: () => {},
        };

        card.hass = hass;

        card.setConfig({
            entity: 'light.test_nanoleaf',
            display: 'buttons',
            button_style: { compact: true },
            effects: [{ name: 'Rainbow', icon: 'mdi:looks', colors: ['#FF00FF'] }],
        });

        // allow render
        await new Promise((r) => setTimeout(r, 0));

        const container = card.shadowRoot.querySelector('.buttons-container');
        expect(container.classList.contains('compact-grid')).toBe(true);

        const button = card.shadowRoot.querySelector('.effect-button');
        expect(button.classList.contains('compact')).toBe(true);
    });
});
