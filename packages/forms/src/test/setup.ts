// First: the render tracker hooks into React's commit hook, which React reads when it loads.
import { stopRecordingCommits } from '#test/renders'
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  stopRecordingCommits()
})

/*
 * jsdom implements none of these, and kiln-ui (or Radix under it) calls them. Each stub
 * is the smallest thing that lets the call succeed. `schema/core/node.test.ts` runs in
 * Vitest's `node` environment, which has no DOM to patch.
 */

if (typeof window !== 'undefined') {
  // Radix sliders and selects use pointer capture.
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined

  // Radix Select and the Combobox scroll the active option into view.
  Element.prototype.scrollIntoView = () => undefined

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
}
