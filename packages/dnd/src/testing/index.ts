/**
 * Stubs the browser APIs the drag engine calls and jsdom doesn't implement
 * (`ResizeObserver`, `matchMedia`, the Popover API, `getAnimations`,
 * `elementFromPoint`), so components from `@mitcsutt/kiln-dnd` render and respond to the
 * keyboard in a jsdom test. Call it once in your test setup file.
 *
 * jsdom has no layout, so pointer drags (which measure where things are) still need a
 * real browser; keyboard dragging works in jsdom because it moves in data space.
 *
 * @example
 * ```ts
 * // vitest.setup.ts
 * import { stubDndBrowserApis } from '@mitcsutt/kiln-dnd/testing'
 *
 * stubDndBrowserApis()
 * ```
 */
export function stubDndBrowserApis(): void {
  if (typeof window === 'undefined') return
  const g = globalThis as Record<string, unknown>
  g.ResizeObserver ??= class ResizeObserver {
    observe(): void {
      // jsdom has no layout, so there's nothing to observe.
    }
    unobserve(): void {
      // Nothing was observed.
    }
    disconnect(): void {
      // Nothing was observed.
    }
  }
  if (typeof window.matchMedia !== 'function') {
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
  }
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>
  proto.showPopover ??= function showPopover() {
    // No top layer in jsdom.
  }
  proto.hidePopover ??= function hidePopover() {
    // No top layer in jsdom.
  }
  const element = Element.prototype as unknown as Record<string, unknown>
  element.getAnimations ??= () => []
  const doc = Document.prototype as unknown as Record<string, unknown>
  doc.elementFromPoint ??= () => null
}
