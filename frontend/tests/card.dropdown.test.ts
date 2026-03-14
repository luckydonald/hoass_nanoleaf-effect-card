import { JSDOM } from 'jsdom';
import {
  beforeAll,
  describe, expect, it, vi,
} from 'vitest';

// Setup DOM
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window as unknown as Window & typeof globalThis;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
  await import('../src/card');
});

describe('Nanoleaf Effect Card - dropdown behavior', () => {
  it('dropdown shows None and not Off when configured', async () => {
    const card = document.createElement('nanoleaf-effect-card') as HTMLElement & Record<string, unknown>;
    document.body.appendChild(card);

    (card as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
      entity: 'light.test',
      display: 'dropdown',
      effects: [],
      show_off: false,
      show_none: true,
    });
    // wait for deferred render
    await Promise.resolve();

    const select = card.shadowRoot!.querySelector('.effect-dropdown') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const optionValues = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    expect(optionValues).toContain('None');
    expect(optionValues).not.toContain('Off');
  });

  it('dropdown shows Off by default', async () => {
    const card = document.createElement('nanoleaf-effect-card') as HTMLElement & Record<string, unknown>;
    document.body.appendChild(card);

    (card as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
      entity: 'light.test',
      display: 'dropdown',
      effects: [],
    });
    await Promise.resolve();

    const select = card.shadowRoot!.querySelector('.effect-dropdown') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const optionValues = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    expect(optionValues).toContain('Off');
  });

  it('selecting None in dropdown calls light.turn_on without effect', async () => {
    const card = document.createElement('nanoleaf-effect-card') as HTMLElement & Record<string, unknown>;
    document.body.appendChild(card);

    const mockHass = {
      states: {
        'light.test': {
          state: 'on',
          attributes: {
            effect_list: [
              'Rainbow',
            ],
          },
        },
      },
      callService: vi.fn(),
    };

    (card as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
      entity: 'light.test',
      display: 'dropdown',
      effects: [],
      show_none: true,
    });
    await Promise.resolve();

    // Inject hass mock
    (card as unknown as { _hass: typeof mockHass })._hass = mockHass;

    const select = card.shadowRoot!.querySelector('.effect-dropdown') as HTMLSelectElement;
    expect(select).toBeTruthy();

    // Ensure the 'None' option exists and select it
    const noneOption = Array.from(select.options).find((o) => o.value === 'None');
    expect(noneOption).toBeTruthy();
    select.value = 'None';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(mockHass.callService).toHaveBeenCalledWith('light', 'turn_on', { entity_id: 'light.test' });
  });
});
