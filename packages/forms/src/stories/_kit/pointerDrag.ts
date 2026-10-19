/*
 * A mouse drag for play functions, which run in a real browser: press on `handle`, move to `to`
 * a frame at a time, and let go. kiln-dnd's engine starts a mouse drag once the pointer has
 * moved 5px, so the steps cross that before they reach the target.
 */
const frame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve()
    })
  })

interface Point {
  x: number
  y: number
}

const centre = (element: Element): Point => {
  const rect = element.getBoundingClientRect()
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
}

function fire(type: string, point: Point, target?: Element) {
  const at = target ?? document.elementFromPoint(point.x, point.y) ?? document.body
  at.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: point.x,
      clientY: point.y,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: type === 'pointermove' ? -1 : 0,
      buttons: type === 'pointerup' ? 0 : 1,
    }),
  )
}

/** Drags `handle` to `to` and drops it there. */
export async function pointerDrag(handle: Element, to: Point, steps = 12): Promise<void> {
  const start = centre(handle)
  fire('pointerdown', start, handle)
  await frame()
  for (let step = 1; step <= steps; step++) {
    const t = step / steps
    fire('pointermove', { x: start.x + (to.x - start.x) * t, y: start.y + (to.y - start.y) * t })
    await frame()
  }
  await frame()
  fire('pointerup', to)
  await frame()
  await frame()
}
