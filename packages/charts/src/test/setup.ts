import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { isReducedMotion, setReducedMotion, TEST_HEIGHT, TEST_WIDTH } from '#test/env'

afterEach(() => {
  cleanup()
  setReducedMotion(false)
})

/*
 * jsdom has no layout. Charts measure their plot box before they draw (the server and the
 * first client render show the reserved frame), so every element reports a fixed size here,
 * and ResizeObserver reports it once on observe. Each stub is the smallest thing that lets the
 * call succeed. Server-rendering tests run in Vitest's `node` environment, with no DOM to patch.
 */
if (typeof window !== 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => TEST_WIDTH,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => TEST_HEIGHT,
  })
  HTMLElement.prototype.getBoundingClientRect = () =>
    DOMRect.fromRect({ x: 0, y: 0, width: TEST_WIDTH, height: TEST_HEIGHT })

  window.matchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? isReducedMotion() : false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })

  globalThis.ResizeObserver = class ResizeObserver {
    readonly #callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.#callback = callback
    }
    observe(target: Element) {
      const rect = DOMRect.fromRect({ width: TEST_WIDTH, height: TEST_HEIGHT })
      this.#callback([{ target, contentRect: rect } as unknown as ResizeObserverEntry], this)
    }
    unobserve() {
      // Nothing to stop: jsdom never resizes.
    }
    disconnect() {
      // Nothing to stop: jsdom never resizes.
    }
  }

  // Radix (through kiln-ui) uses pointer capture.
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => undefined
  Element.prototype.releasePointerCapture = () => undefined
}
