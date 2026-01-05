import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Ensure we use a fresh module env for each test
beforeEach(() => {
    vi.resetModules();
});

// Setup a minimal DOM so document.createElement works and customElements is available
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
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

        // Import the card module (which will register the custom element and may dynamically import the mocked editor)
        await import('./card.js');

        // The card registers itself as a custom element; get the constructor from customElements
        const Card = customElements.get('nanoleaf-effect-card');
        expect(Card).toBeTruthy();

        // Call the async method to create editor
        const el = await Card.getConfigElement();
        expect(el).toBeTruthy();
        // Fallback should have created a setConfig function
        expect(typeof el.setConfig).toBe('function');

        // Calling setConfig should store the config on the element and log a warning
        const cfg = { entity: 'light.test' };
        el.setConfig(cfg);
        expect(el._config).toEqual(cfg);
        expect(warnSpy).toHaveBeenCalled();

        // The fallback should render a visible UI indicating the editor is unavailable
        const fallbackInShadow = el.shadowRoot && el.shadowRoot.querySelector('.nanoleaf-editor-fallback');
        const fallbackInLight = el.querySelector && el.querySelector('.nanoleaf-editor-fallback');
        expect(fallbackInShadow || fallbackInLight).toBeTruthy();

        warnSpy.mockRestore();
    });
});
