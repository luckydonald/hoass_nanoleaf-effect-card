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

describe('Card Editor - color removal', () => {
    it('removes a color when trash is clicked and falls back when last removed', async () => {
        const editor = document.createElement('nanoleaf-effect-card-editor');
        document.body.appendChild(editor);

        const config = {
            entity: 'light.test_light',
            effects: [{ name: 'Test', colors: ['#111111', '#222222'] }],
        };

        editor.setConfig(config);
        await new Promise((r) => setTimeout(r, 0));

        // initial: two color inputs
        let colorButtons = editor.shadowRoot.querySelectorAll('.colors-container .delete-color');
        expect(colorButtons.length).toBe(2);

        // click the first trash -> should remove first color
        colorButtons[0].click();
        await new Promise((r) => setTimeout(r, 0));

        // verify config updated
        expect(editor._config.effects[0].colors.length).toBe(1);
        expect(editor._config.effects[0].colors[0]).toBe('#222222');

        // Now remove the last color
        const remainingTrash = editor.shadowRoot.querySelectorAll('.colors-container .delete-color');
        expect(remainingTrash.length).toBe(1);
        remainingTrash[0].click();
        await new Promise((r) => setTimeout(r, 0));

        // After removing the last color the colors array should be empty (no fallback in editor)
        expect(editor._config.effects[0].colors.length).toBe(0);
    });
});
