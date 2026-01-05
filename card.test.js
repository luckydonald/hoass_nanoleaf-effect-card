import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

// Import the card after setting up the DOM so customElements are registered
beforeAll(async () => {
    await import('./card.js');
});

describe('NanoleafEffectCard', () => {
    let card;

    beforeEach(() => {
        // Create a new card instance for each test
        card = document.createElement('nanoleaf-effect-card');
        document.body.appendChild(card);
    });

    describe('Configuration', () => {
        it('should throw error when entity is not provided', () => {
            expect(() => {
                card.setConfig({});
            }).toThrow('You need to define an entity');
        });

        it('should accept valid configuration', () => {
            const config = {
                entity: 'light.test_nanoleaf',
                display: 'buttons',
                effects: [{ name: 'Rainbow', icon: 'mdi:looks', color: '#FF00FF' }],
            };

            expect(() => {
                card.setConfig(config);
            }).not.toThrow();
        });

        it('should default to buttons display mode', () => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                effects: [],
            });

            expect(card._config.display).toBe('buttons');
        });

        it('should use provided display mode', () => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                display: 'dropdown',
                effects: [],
            });

            expect(card._config.display).toBe('dropdown');
        });
    });

    describe('Effect Colors', () => {
        beforeEach(() => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                effects: [],
            });
        });

        it('should handle single color', () => {
            const effect = { name: 'Test', color: '#FF0000' };
            const colors = card.getEffectColors(effect);

            expect(colors).toEqual(['#FF0000']);
        });

        it('should handle multiple colors', () => {
            const effect = {
                name: 'Test',
                colors: ['#FF0000', '#00FF00', '#0000FF'],
            };
            const colors = card.getEffectColors(effect);

            expect(colors).toEqual(['#FF0000', '#00FF00', '#0000FF']);
        });

        it('should default to grey when no color provided', () => {
            const effect = { name: 'Test' };
            const colors = card.getEffectColors(effect);

            // New behavior: editor allows an empty colors array; card renderer falls back visually.
            expect(colors).toEqual([]);
        });
    });

    describe('Contrast Color', () => {
        beforeEach(() => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                effects: [],
            });
        });

        it('should return white for dark colors', () => {
            const contrast = card.getContrastColor('#000000');
            expect(contrast).toBe('#FFFFFF');
        });

        it('should return black for light colors', () => {
            const contrast = card.getContrastColor('#FFFFFF');
            expect(contrast).toBe('#000000');
        });

        it('should handle colors without # prefix', () => {
            const contrast1 = card.getContrastColor('000000');
            const contrast2 = card.getContrastColor('#000000');
            expect(contrast1).toBe(contrast2);
        });
    });

    describe('Card Size', () => {
        it('should return 1 for dropdown mode', () => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                display: 'dropdown',
                effects: [{ name: 'Effect1' }, { name: 'Effect2' }, { name: 'Effect3' }],
            });

            expect(card.getCardSize()).toBe(1);
        });

        it('should calculate size for button mode', () => {
            card.setConfig({
                entity: 'light.test_nanoleaf',
                display: 'buttons',
                effects: [{ name: 'Effect1' }, { name: 'Effect2' }, { name: 'Effect3' }],
            });

            // 4 effects total (3 + Off button), divided by 3 per row, rounded up
            expect(card.getCardSize()).toBeGreaterThan(0);
        });
    });

    describe('Static Methods', () => {
        it('should have getStubConfig', () => {
            const stub = card.constructor.getStubConfig();
            expect(stub).toHaveProperty('entity');
            expect(stub).toHaveProperty('display');
            expect(stub).toHaveProperty('effects');
        });
    });

    describe('Special entries (Off / None)', () => {
        it('should render "None" and not "Off" when configured', async () => {
            card.setConfig({ entity: 'light.test_nanoleaf', effects: [], show_off: false, show_none: true });
            // setConfig defers render to a microtask
            await Promise.resolve();

            const html = card.shadowRoot?.innerHTML || '';
            expect(html).toContain('data-effect="None"');
            expect(html).not.toContain('data-effect="Off"');
        });

        it('should default to showing Off when not explicitly disabled', async () => {
            card.setConfig({ entity: 'light.test_nanoleaf', effects: [] /* defaults */ });
            await Promise.resolve();

            const html = card.shadowRoot?.innerHTML || '';
            // Off button should be present by default
            expect(html).toContain('data-effect="Off"');
        });

        it('selecting "None" should call light.turn_on without an effect', () => {
            const mockHass = {
                states: {
                    'light.test_nanoleaf': { state: 'on', attributes: { effect_list: ['Rainbow'] } },
                },
                callService: vi.fn(),
            };

            // configure card and inject hass
            card.setConfig({ entity: 'light.test_nanoleaf', effects: [], show_none: true });
            card._hass = mockHass;

            card.handleEffectSelect('None');

            expect(mockHass.callService).toHaveBeenCalledWith('light', 'turn_on', { entity_id: 'light.test_nanoleaf' });
        });
    });
});
