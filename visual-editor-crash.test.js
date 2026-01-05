import { describe, it, expect, beforeEach, vi } from 'vitest';

// Ensure we use a fresh module env for each test
beforeEach(() => {
    vi.resetModules();
});

describe('Visual editor crash (getConfigElement)', () => {
    it('getConfigElement returns an element with setConfig and calling it does not throw when lovelace config is undefined', async () => {
        // Arrange: import the card module fresh
        const mod = await import('./card.js');
        const Card = mod.default || mod.NanoleafEffectCard || mod.NaN;

        // Call the async method to create editor
        const el = await mod.NanoleafEffectCard.getConfigElement();
        expect(el).toBeTruthy();
        expect(typeof el.setConfig).toBe('function');

        // Calling setConfig should not throw even if the editor implementation is minimal
        expect(() => el.setConfig({})).not.toThrow();
    });
});

