import { createEngine, POINTER_DISTANCE, TOUCH_DELAY } from '#core/engine'

/**
 * A stand-in for `@dnd-kit/dom` that records how the manager was configured, so the
 * activation rules can be checked without a browser.
 */
function fakeDndKit() {
  const seen: { input?: Record<string, unknown> } = {}
  class Delay {
    constructor(readonly options: { value: number; tolerance: number }) {}
  }
  class Distance {
    constructor(readonly options: { value: number }) {}
  }
  const configured = (name: string) => ({
    configure: (options: unknown) => ({ plugin: name, options }),
  })
  const module = {
    DragDropManager: class {
      monitor = { addEventListener: () => () => undefined }
      constructor(input: Record<string, unknown>) {
        seen.input = input
      }
      destroy() {
        // Nothing to release.
      }
    },
    PointerSensor: configured('PointerSensor'),
    PointerActivationConstraints: { Delay, Distance },
    Feedback: configured('Feedback'),
    AutoScroller: 'AutoScroller',
    Cursor: 'Cursor',
    PreventSelection: 'PreventSelection',
    Accessibility: 'Accessibility',
    KeyboardSensor: 'KeyboardSensor',
  }
  return { module, seen, Delay, Distance }
}

type Constraints = (event: { pointerType: string }) => { options: Record<string, number> }[]

describe('engine', () => {
  const noop = { start: () => undefined, move: () => undefined, end: () => undefined }

  it('needs a 250ms press for touch, and only movement for mouse and pen', () => {
    const { module, seen, Delay, Distance } = fakeDndKit()
    createEngine(module as never, noop)
    const [sensor] = seen.input?.sensors as [{ options: { activationConstraints: Constraints } }]
    const constraintsFor = sensor.options.activationConstraints

    const touch = constraintsFor({ pointerType: 'touch' })
    expect(touch).toHaveLength(1)
    expect(touch[0]).toBeInstanceOf(Delay)
    expect(touch[0]?.options).toEqual({ value: TOUCH_DELAY, tolerance: 5 })
    expect(TOUCH_DELAY).toBe(250)

    for (const pointerType of ['mouse', 'pen']) {
      const constraints = constraintsFor({ pointerType })
      expect(constraints).toHaveLength(1)
      expect(constraints[0]).toBeInstanceOf(Distance)
      expect(constraints[0]?.options).toEqual({ value: POINTER_DISTANCE })
    }
  })

  it('leaves the keyboard and announcements to Kiln and turns off the drop animation', () => {
    const { module, seen } = fakeDndKit()
    createEngine(module as never, noop)
    const plugins = seen.input?.plugins as unknown[]
    const sensors = seen.input?.sensors as unknown[]
    expect(plugins).not.toContain('Accessibility')
    expect(sensors).toHaveLength(1)
    expect(plugins).toContainEqual({ plugin: 'Feedback', options: { dropAnimation: null } })
  })

  it('passes engineProps through', () => {
    const { module, seen } = fakeDndKit()
    createEngine(module as never, noop, { modifiers: ['snap'] })
    expect(seen.input?.modifiers).toEqual(['snap'])
  })
})
