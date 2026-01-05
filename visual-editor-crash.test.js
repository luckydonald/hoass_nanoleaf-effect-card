import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Ensure we use a fresh module env for each test
beforeEach(() => {
    vi.resetModules();
});

// Setup a minimal DOM so document.createElement works and customElements is available
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

describe('Visual editor crash (getConfigElement)', () => {
    it('getConfigElement returns a fallback element when editor module does not implement setConfig', async () => {
        // Mock a broken editor module: it defines the custom element but doesn't implement setConfig
        vi.doMock('./card-editor.js', () => {
            class BrokenEditor extends HTMLElement {
                constructor() {
                    super();
                    this.innerHTML = '<div>Broken editor</div>';
                }
            }
            // define the element in the mocked module context as well
            try {
                customElements.define('nanoleaf-effect-card-editor', BrokenEditor);
            } catch (e) {
                // ignore if already defined
            }
            return {};
        });

        // Spy on console.warn to ensure fallback logs
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // Import the card module (which will dynamically import the mocked editor)
        const mod = await import('./card.js');

        // Call the async method to create editor
        const el = await mod.NanoleafEffectCard.getConfigElement();
        expect(el).toBeTruthy();
        // Fallback should have created a setConfig function
        expect(typeof el.setConfig).toBe('function');

        // Calling setConfig should store the config on the element and log a warning
        const cfg = { entity: 'light.test' };
        el.setConfig(cfg);
        expect(el._config).toEqual(cfg);
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });
});
