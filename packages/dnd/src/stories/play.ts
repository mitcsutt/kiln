/*
 * Helpers for the workbench stories' `play` functions. They run in a real browser (the
 * Storybook Vitest addon drives Chromium), so pointer drags measure real layout: each
 * helper dispatches the pointer events a mouse, pen or finger would, at real coordinates.
 */
import { expect, waitFor } from 'storybook/test'

/** The element a story's `play` queries: the first copy in "All themes, side by side". */
export function storyRoot(canvasElement: HTMLElement): HTMLElement {
  return canvasElement.querySelector<HTMLElement>('.sb-matrix-cell') ?? canvasElement
}

/** The text of the scope's live region nearest `within`. */
export function announcement(within: HTMLElement, index = 0): string {
  const regions = within.querySelectorAll('[data-kiln-dnd-announcer]')
  return (regions[index]?.textContent ?? '').replace(/\u00A0/g, '').trim()
}

/** Waits until the live region says exactly `text`. */
export async function expectAnnouncement(within: HTMLElement, text: string, index = 0) {
  await waitFor(async () => {
    await expect(announcement(within, index)).toBe(text)
  })
}

const frame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve()
    })
  })

export const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

export interface Point {
  x: number
  y: number
}

export const centre = (element: Element): Point => {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

type PointerType = 'mouse' | 'pen' | 'touch'

function fire(type: string, point: Point, pointerType: PointerType, target?: Element) {
  const at = target ?? document.elementFromPoint(point.x, point.y) ?? document.body
  at.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: point.x,
      clientY: point.y,
      pointerId: 1,
      pointerType,
      isPrimary: true,
      button: type === 'pointermove' ? -1 : 0,
      buttons: type === 'pointerup' ? 0 : 1,
    }),
  )
}

export interface DragOptions {
  pointerType?: PointerType
  /** How long to hold before moving (touch needs 250ms). */
  hold?: number
  steps?: number
  /** Don't let go: the caller checks the drag in progress, then calls the returned `drop`. */
  keepHolding?: boolean
}

/**
 * Presses on `handle`, moves to `to` (a point or the centre of an element) in steps, a
 * frame apart, and lets go. Returns `drop` when `keepHolding` is set.
 */
export async function drag(
  handle: Element,
  to: Point | Element,
  { pointerType = 'mouse', hold = 0, steps = 12, keepHolding = false }: DragOptions = {},
): Promise<() => Promise<void>> {
  const start = centre(handle)
  const end = to instanceof Element ? centre(to) : to
  fire('pointerdown', start, pointerType, handle)
  if (hold) await wait(hold)
  await frame()
  for (let step = 1; step <= steps; step++) {
    const t = step / steps
    fire(
      'pointermove',
      { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t },
      pointerType,
    )
    await frame()
  }
  await frame()
  const drop = async () => {
    fire('pointerup', end, pointerType)
    await frame()
    await frame()
  }
  if (!keepHolding) await drop()
  return drop
}

/** Moves a held pointer (after `drag(..., { keepHolding: true })`). */
export async function moveTo(point: Point, pointerType: PointerType = 'mouse') {
  fire('pointermove', point, pointerType)
  await frame()
  await frame()
}
