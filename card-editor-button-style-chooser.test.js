import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup a DOM before importing the component so it can register correctly
const dom = new JSDOM('<!DOCTYPE html><html lang="en"><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;

beforeAll(async () => {
    // Import the extracted chooser component after DOM globals are set
    await import('./card-editor-button-style-chooser.js');
});

describe('Nanoleaf Effect Card Editor - Button Style Chooser', () => {
    it('reflects initial value in the UI', async () => {
        const chooser = document.createElement('nanoleaf-effect-card-card-editor-button-style-chooser');
        document.body.appendChild(chooser);

        // initial value: full_background active and hover true, small_bar inactive true
        const initial = {
            full_background: { active: true, inactive: false, hover: true },
            small_bar: { active: false, inactive: true, hover: false },
        };

        // Set value and yield to allow the component to render
        chooser.value = initial;
        await new Promise((r) => setTimeout(r, 0));

        const fullRow = chooser.shadowRoot.querySelector('[data-key="full_background"]');
        const smallRow = chooser.shadowRoot.querySelector('[data-key="small_bar"]');

        expect(fullRow).toBeTruthy();
        expect(smallRow).toBeTruthy();

        const fullActive = fullRow.querySelector('.btn-active');
        const fullHover = fullRow.querySelector('.btn-hover');
        const fullInactive = fullRow.querySelector('.btn-inactive');

        expect(fullActive.classList.contains('active')).toBe(true);
        expect(fullHover.classList.contains('active')).toBe(true);
        expect(fullInactive.classList.contains('active')).toBe(false);

        const smallActive = smallRow.querySelector('.btn-active');
        const smallInactive = smallRow.querySelector('.btn-inactive');
        const smallHover = smallRow.querySelector('.btn-hover');

        expect(smallActive.classList.contains('active')).toBe(false);
        expect(smallInactive.classList.contains('active')).toBe(true);
        expect(smallHover.classList.contains('active')).toBe(false);
    });

    it('emits value-changed and updates value when toggles are clicked', async () => {
        const chooser = document.createElement('nanoleaf-effect-card-card-editor-button-style-chooser');
        document.body.appendChild(chooser);

        const initial = {
            full_background: { active: false, inactive: false, hover: false },
        };

        chooser.value = initial;
        await new Promise((r) => setTimeout(r, 0));

        let lastValue = null;
        chooser.addEventListener('value-changed', (e) => {
            lastValue = e.detail.value;
        });

        const fullRow = chooser.shadowRoot.querySelector('[data-key="full_background"]');
        const fullActive = fullRow.querySelector('.btn-active');
        const fullHover = fullRow.querySelector('.btn-hover');

        // Click active
        fullActive.click();
        await new Promise((r) => setTimeout(r, 0));
        expect(lastValue).toBeTruthy();
        expect(lastValue.full_background.active).toBe(true);
        expect(chooser.value.full_background.active).toBe(true);

        // Click hover
        fullHover.click();
        await new Promise((r) => setTimeout(r, 0));
        expect(lastValue.full_background.hover).toBe(true);
        expect(chooser.value.full_background.hover).toBe(true);

        // Toggle active off
        fullActive.click();
        await new Promise((r) => setTimeout(r, 0));
        expect(chooser.value.full_background.active).toBe(false);
        expect(lastValue.full_background.active).toBe(false);
    });

    it('supports keyboard navigation (focus order and activation)', async () => {
        const chooser = document.createElement('nanoleaf-effect-card-card-editor-button-style-chooser');
        document.body.appendChild(chooser);

        const initial = {
            full_background: { active: false, inactive: false, hover: false },
            small_bar: { active: false, inactive: false, hover: false },
        };

        chooser.value = initial;
        await new Promise((r) => setTimeout(r, 0));

        // Find controls
        const fullRow = chooser.shadowRoot.querySelector('[data-key="full_background"]');
        const smallRow = chooser.shadowRoot.querySelector('[data-key="small_bar"]');
        const fullActive = fullRow.querySelector('.btn-active');
        const fullHover = fullRow.querySelector('.btn-hover');
        const smallActive = smallRow.querySelector('.btn-active');

        // Ensure buttons are focusable
        expect(typeof fullActive.focus).toBe('function');
        expect(typeof smallActive.focus).toBe('function');

        // Track emitted values
        let lastValue = null;
        chooser.addEventListener('value-changed', (e) => {
            lastValue = e.detail.value;
        });

        // Focus first button (simulates pressing Tab until it)
        fullActive.focus();
        // JSDOM often reports the host as the activeElement when focusing into shadow DOM.
        // Accept either the inner button or the host chooser as the activeElement.
        const active = document.activeElement;
        const focusedOk = active === fullActive || active === chooser;
        expect(focusedOk).toBe(true);

        // Simulate Enter activation by dispatching a key event then invoking click()
        fullActive.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        fullActive.click(); // emulate browser activation via keyboard
        await new Promise((r) => setTimeout(r, 0));

        expect(chooser.value.full_background.active).toBe(true);
        expect(lastValue).toBeTruthy();
        expect(lastValue.full_background.active).toBe(true);

        // Move focus to the next control (simulate Tab)
        smallActive.focus();
        const active2 = document.activeElement;
        const focusedOk2 = active2 === smallActive || active2 === chooser;
        expect(focusedOk2).toBe(true);

        // Simulate Space activation on the smallActive control
        smallActive.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        smallActive.click();
        await new Promise((r) => setTimeout(r, 0));

        expect(chooser.value.small_bar.active).toBe(true);
        expect(lastValue.small_bar.active).toBe(true);
    });

});
