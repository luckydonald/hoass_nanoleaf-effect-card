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
  await import('../src/card');
});

describe('NanoleafEffectCard - compact style', () => {
  it('applies compact-grid and compact button classes when configured', async () => {
    const card = document.createElement('nanoleaf-effect-card') as HTMLElement & Record<string, unknown>;
    document.body.appendChild(card);

    const hass = {
      states: {
        'light.test_nanoleaf': {
          state: 'on',
          attributes: {
            effect: 'Rainbow',
            effect_list: [
              'Rainbow',
              'Sunrise',
            ],
          },
        },
      },
      callService: () => {},
    };

    (card as unknown as { hass: typeof hass }).hass = hass;

    (card as unknown as { setConfig: (c: Record<string, unknown>) => void }).setConfig({
      entity: 'light.test_nanoleaf',
      display: 'buttons',
      button_style: { compact: true },
      effects: [
        {
          name: 'Rainbow',
          icon: 'mdi:looks',
          colors: [
            '#FF00FF',
          ],
        },
      ],
    });

    // allow render
    await new Promise((r) => setTimeout(r, 0));

    const container = card.shadowRoot!.querySelector('.buttons-container') as HTMLElement;
    expect(container.classList.contains('compact-grid')).toBe(true);

    const button = card.shadowRoot!.querySelector('.effect-button') as HTMLElement;
    expect(button.classList.contains('compact')).toBe(true);
  });
});
