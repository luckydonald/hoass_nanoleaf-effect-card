import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
    await import('./card-editor.js');
});

describe('Nanoleaf Effect Card Editor - chooser state preservation', () => {
    it('preserves chooser state when setConfig is called again (merge behavior)', async () => {
        const editor = document.createElement('nanoleaf-effect-card-editor');
        document.body.appendChild(editor);

        const cfg = {
            entity: 'light.test',
            effects: [
                {
                    name: 'E1',
                    button_style: {
                        color_display: { full_background: { active: false, inactive: false, hover: false } },
                    },
                },
            ],
        };

        editor.setConfig(cfg);
        // wait for deferred render
        await new Promise((r) => setTimeout(r, 0));

        // Find the per-effect chooser
        const chooser = editor.shadowRoot.querySelector(
            '.effect-item nanoleaf-effect-card-card-editor-button-style-chooser'
        );
        expect(chooser).toBeTruthy();

        // Toggle full_background active on chooser
        const btnActive = chooser.shadowRoot.querySelector('[data-key="full_background"] .btn-active');
        expect(btnActive).toBeTruthy();

        // click to set active true
        btnActive.click();
        await new Promise((r) => setTimeout(r, 0));
        expect(chooser.value.full_background.active).toBe(true);

        // Now call setConfig with essentially the same config (simulate external update)
        editor.setConfig({ ...cfg });
        await new Promise((r) => setTimeout(r, 0));

        // The chooser should retain the active state after merge
        const btnActiveAfter = chooser.shadowRoot.querySelector('[data-key="full_background"] .btn-active');
        expect(btnActiveAfter.classList.contains('active')).toBe(true);
        expect(chooser.value.full_background.active).toBe(true);
    });
});
