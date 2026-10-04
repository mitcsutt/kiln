import '@testing-library/jest-dom/vitest'

/*
 * jsdom implements none of these, and the components (or Radix under them) call them.
 * Each stub is the smallest thing that lets the call succeed.
 */

// ThemeProvider follows `prefers-color-scheme`.
window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => undefined,
  removeListener: () => undefined,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  dispatchEvent: () => false,
})

// Radix sliders and selects use pointer capture.
Element.prototype.hasPointerCapture = () => false
Element.prototype.setPointerCapture = () => undefined
Element.prototype.releasePointerCapture = () => undefined

// Radix Select and the Combobox scroll the active option into view.
Element.prototype.scrollIntoView = () => undefined

// Radix measures popper content.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {
    // jsdom has no layout, so there's nothing to observe.
  }
  unobserve() {
    // Nothing was observed.
  }
  disconnect() {
    // Nothing was observed.
  }
}
