import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

afterAll(() => {
    // cleanup if needed
});

beforeAll(async () => {
    // Import editor (which imports the chooser)
    await import('../src/card-editor');
});

describe('Nanoleaf Effect Card Editor - UI toggles', () => {
    it('dispatches config-changed with show_off toggled', async () => {
        const editor = document.createElement('nanoleaf-effect-card-editor') as HTMLElement & Record<string, unknown>;
        document.body.appendChild(editor);

        // initial config with show_off true
        (editor as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
            entity: 'light.test',
            effects: [],
            show_off: true,
            show_none: false,
        });
        // wait for deferred render
        await Promise.resolve();

        const switchEl = editor.shadowRoot!.querySelector('#show-off') as HTMLInputElement;
        expect(switchEl).toBeTruthy();

        let received: Record<string, unknown> | null = null;
        editor.addEventListener('config-changed', (e) => {
            received = (e as CustomEvent<{ config: Record<string, unknown> }>).detail?.config;
        });

        // simulate unchecking the switch
        switchEl.checked = false;
        switchEl.dispatchEvent(new Event('change', { bubbles: true }));

        // allow microtask/handlers to run
        await Promise.resolve();

        expect(received).toBeTruthy();
        expect((received as Record<string, unknown>).show_off).toBe(false);
    });

    it('dispatches config-changed with show_none toggled', async () => {
        const editor = document.createElement('nanoleaf-effect-card-editor') as HTMLElement & Record<string, unknown>;
        document.body.appendChild(editor);

        // initial config with show_none false
        (editor as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
            entity: 'light.test',
            effects: [],
            show_off: true,
            show_none: false,
        });
        await Promise.resolve();

        const switchEl = editor.shadowRoot!.querySelector('#show-none') as HTMLInputElement;
        expect(switchEl).toBeTruthy();

        let received: Record<string, unknown> | null = null;
        editor.addEventListener('config-changed', (e) => {
            received = (e as CustomEvent<{ config: Record<string, unknown> }>).detail?.config;
        });

        // simulate checking the switch
        switchEl.checked = true;
        switchEl.dispatchEvent(new Event('change', { bubbles: true }));

        await Promise.resolve();

        expect(received).toBeTruthy();
        expect((received as Record<string, unknown>).show_none).toBe(true);
    });
});
