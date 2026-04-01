import { JSDOM } from 'jsdom';
import {
  beforeAll,
  describe, expect, it,
} from 'vitest';

import type { ColorDisplayConfig } from '../src/types';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
  await import('../src/card-editor-button-style-chooser');
});

type ChooserElement = HTMLElement & {
  value: ColorDisplayConfig;
};

describe('Nanoleaf Effect Card Editor - Button Style Chooser multiple instances', () => {
  it('toggling one chooser does not reset others', async () => {
    const chooser1 = document.createElement('nanoleaf-effect-card-card-editor-button-style-chooser') as ChooserElement;
    const chooser2 = document.createElement('nanoleaf-effect-card-card-editor-button-style-chooser') as ChooserElement;
    document.body.appendChild(chooser1);
    document.body.appendChild(chooser2);

    const val1: ColorDisplayConfig = { full_background: { active: true, inactive: false, hover: false } };
    const val2: ColorDisplayConfig = { full_background: { active: false, inactive: false, hover: false } };

    chooser1.value = val1;
    chooser2.value = val2;
    await new Promise<void>((r) => {
      setTimeout(r, 0);
    });

    // Sanity check initial states
    const btn1 = (chooser1.shadowRoot as ShadowRoot).querySelector('[data-key="full_background"] .btn-active') as HTMLElement;
    const btn2 = (chooser2.shadowRoot as ShadowRoot).querySelector('[data-key="full_background"] .btn-active') as HTMLElement;
    expect(btn1.classList.contains('active')).toBe(true);
    expect(btn2.classList.contains('active')).toBe(false);

    // Click chooser1's active button to toggle it off
    let lastValue1: ColorDisplayConfig | null = null;
    chooser1.addEventListener('value-changed', (e) => {
      lastValue1 = (e as CustomEvent<{ value: ColorDisplayConfig }>).detail.value;
    });
    btn1.click();
    await new Promise<void>((r) => {
      setTimeout(r, 0);
    });

    // chooser1 should have active false now
    expect(chooser1.value.full_background?.active).toBe(false);
    expect(lastValue1).toBeTruthy();
    expect((lastValue1 as ColorDisplayConfig).full_background?.active).toBe(false);

    // chooser2 must remain unchanged
    expect(chooser2.value.full_background?.active).toBe(false);
    const btn2After = (chooser2.shadowRoot as ShadowRoot).querySelector('[data-key="full_background"] .btn-active') as Element;
    expect(btn2After.classList.contains('active')).toBe(false);
  });
});
