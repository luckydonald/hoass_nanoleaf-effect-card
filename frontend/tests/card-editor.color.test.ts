import { JSDOM } from 'jsdom';
import {
  beforeAll,
  describe, expect, it,
} from 'vitest';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
  await import('../src/card-editor');
});

describe('Card Editor - color removal', () => {
  it('removes a color when trash is clicked and falls back when last removed', async () => {
    const editor = document.createElement('nanoleaf-effect-card-editor') as HTMLElement & Record<string, unknown>;
    document.body.appendChild(editor);

    const config = {
      entity: 'light.test_light',
      effects: [
        {
          name: 'Test',
          colors: [
            '#111111',
            '#222222',
          ],
        },
      ],
    };

    (editor as unknown as { setConfig: (c: typeof config) => void }).setConfig(config);
    await new Promise<void>((r) => { setTimeout(r, 0); });

    // initial: two color inputs
    const colorButtons = (editor.shadowRoot as ShadowRoot).querySelectorAll('.colors-container .delete-color');
    expect(colorButtons.length).toBe(2);

    // click the first trash -> should remove first color
    (colorButtons[0] as HTMLElement).click();
    await new Promise<void>((r) => { setTimeout(r, 0); });

    // verify config updated
    const editorConfig = (editor as unknown as { _config: { effects: { colors: string[] }[] } })._config;
    expect(editorConfig.effects[0].colors.length).toBe(1);
    expect(editorConfig.effects[0].colors[0]).toBe('#222222');

    // Now remove the last color
    const remainingTrash = (editor.shadowRoot as ShadowRoot).querySelectorAll('.colors-container .delete-color');
    expect(remainingTrash.length).toBe(1);
    (remainingTrash[0] as HTMLElement).click();
    await new Promise<void>((r) => { setTimeout(r, 0); });

    // After removing the last color the colors array should be empty (no fallback in editor)
    // Re-read _config in case it was replaced with a new object reference on re-render
    const editorConfig2 = (editor as unknown as { _config: { effects: { colors: string[] }[] } })._config;
    expect(editorConfig2.effects[0].colors.length).toBe(0);
  });
});
