import {
  bottom,
  cloneLayout,
  cloneLayoutItem,
  collides,
  compactItemHorizontal,
  compactItemVertical,
  correctBounds,
  findOrGenerateResponsiveLayout,
  getAllCollisions,
  getBreakpointFromWidth,
  getCompactor,
  getFirstCollision,
  getLayoutItem,
  getStatics,
  horizontalCompactor,
  moveElement,
  moveElementAwayFromCollision,
  noCompactor,
  resolveCompactionCollision,
  sortBreakpoints,
  sortLayoutItems,
  sortLayoutItemsByColRow,
  sortLayoutItemsByRowCol,
  verticalCompactor,
  type LayoutItem,
} from '#grid/engine'

const item = (i: string, x: number, y: number, w = 1, h = 1, extra: Partial<LayoutItem> = {}) => ({
  i,
  x,
  y,
  w,
  h,
  ...extra,
})

/** The positions only, keyed by id, so a test reads like a picture of the grid. */
const positions = (layout: readonly LayoutItem[]) =>
  Object.fromEntries(layout.map((l) => [l.i, [l.x, l.y, l.w, l.h]]))

describe('collision', () => {
  it('collides only when the boxes overlap and the ids differ', () => {
    expect(collides(item('a', 0, 0, 2, 2), item('b', 1, 1))).toBe(true)
    expect(collides(item('a', 0, 0, 2, 2), item('b', 2, 0))).toBe(false)
    expect(collides(item('a', 0, 0, 2, 2), item('b', 0, 2))).toBe(false)
    expect(collides(item('a', 0, 0, 2, 2), item('a', 0, 0, 2, 2))).toBe(false)
  })

  it('finds the first and every collision', () => {
    const layout = [item('a', 0, 0), item('b', 1, 0), item('c', 5, 5)]
    const probe = item('p', 0, 0, 2, 1)
    expect(getFirstCollision(layout, probe)?.i).toBe('a')
    expect(getAllCollisions(layout, probe).map((l) => l.i)).toEqual(['a', 'b'])
    expect(getFirstCollision(layout, item('p', 9, 9))).toBeUndefined()
  })
})

describe('sorting', () => {
  const layout = [item('c', 1, 1), item('a', 0, 0), item('b', 1, 0), item('d', 0, 1)]

  it('sorts by row then column, or by column then row', () => {
    expect(sortLayoutItemsByRowCol(layout).map((l) => l.i)).toEqual(['a', 'b', 'd', 'c'])
    expect(sortLayoutItemsByColRow(layout).map((l) => l.i)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('sorts for the compaction type and leaves the input alone', () => {
    expect(sortLayoutItems(layout, 'vertical').map((l) => l.i)).toEqual(['a', 'b', 'd', 'c'])
    expect(sortLayoutItems(layout, 'horizontal').map((l) => l.i)).toEqual(['a', 'd', 'b', 'c'])
    expect(sortLayoutItems(layout, null).map((l) => l.i)).toEqual(['c', 'a', 'b', 'd'])
    expect(layout.map((l) => l.i)).toEqual(['c', 'a', 'b', 'd'])
  })
})

describe('layout queries and cloning', () => {
  it('measures the bottom of a layout', () => {
    expect(bottom([])).toBe(0)
    expect(bottom([item('a', 0, 0, 1, 3), item('b', 1, 2, 1, 4)])).toBe(6)
  })

  it('finds an item and the static items', () => {
    const layout = [item('a', 0, 0), item('b', 1, 0, 1, 1, { static: true })]
    expect(getLayoutItem(layout, 'b')?.x).toBe(1)
    expect(getLayoutItem(layout, 'z')).toBeUndefined()
    expect(getStatics(layout).map((l) => l.i)).toEqual(['b'])
  })

  it('clones items with every field, including a consumer’s own', () => {
    const original = { ...item('a', 1, 2, 3, 4), title: 'Revenue' }
    const copy = cloneLayoutItem(original)
    expect(copy).toEqual(original)
    expect(copy).not.toBe(original)
    const layout = cloneLayout([original])
    expect(layout[0]).toEqual(original)
    expect(layout[0]).not.toBe(original)
  })
})

describe('correctBounds', () => {
  it('pulls items back inside the columns', () => {
    const layout = correctBounds([item('a', 10, 0, 4), item('b', -2, 1, 2)], { cols: 12 })
    expect(positions(layout)).toEqual({ a: [8, 0, 4, 1], b: [0, 1, 12, 1] })
  })

  it('moves static items down until no two of them overlap', () => {
    const layout = correctBounds(
      [item('a', 0, 0, 2, 2, { static: true }), item('b', 0, 1, 2, 1, { static: true })],
      { cols: 4 },
    )
    expect(positions(layout)).toEqual({ a: [0, 2, 2, 2], b: [0, 1, 2, 1] })
  })

  it('turns y: Infinity into the current bottom', () => {
    const layout = correctBounds([item('a', 0, 0, 1, 3), item('b', 1, Infinity)], { cols: 2 })
    expect(positions(layout).b).toEqual([1, 3, 1, 1])
  })
})

describe('moveElement', () => {
  it('pushes the item it lands on down, in vertical compaction', () => {
    const layout = [item('a', 0, 0, 2, 1), item('b', 0, 1, 2, 1)]
    const moving = cloneLayoutItem(layout[1] as LayoutItem)
    const next = moveElement(
      layout.map((l) => (l.i === 'b' ? moving : l)),
      moving,
      0,
      0,
      true,
      false,
      'vertical',
      4,
    )
    const compacted = verticalCompactor.compact(next, 4)
    expect(positions(compacted)).toEqual({ a: [0, 1, 2, 1], b: [0, 0, 2, 1] })
  })

  it('returns the layout unchanged when the position is the same', () => {
    const a = item('a', 1, 1)
    const layout = [a]
    expect(moveElement(layout, a, 1, 1, true, false, 'vertical', 4)).toEqual(layout)
    expect(a.moved).toBeUndefined()
  })

  it('never moves a static item', () => {
    const a = item('a', 0, 0, 1, 1, { static: true })
    moveElement([a], a, 2, 2, true, false, 'vertical', 4)
    expect([a.x, a.y]).toEqual([0, 0])
  })

  it('snaps back into place with preventCollision', () => {
    const a = item('a', 0, 0)
    const b = item('b', 1, 0)
    const layout = [a, b]
    const result = moveElement(layout, b, 0, 0, true, true, 'vertical', 4)
    expect(result).toBe(layout)
    expect([b.x, b.y, b.moved]).toEqual([1, 0, false])
  })

  it('pushes right in horizontal compaction', () => {
    const a = item('a', 0, 0)
    const b = item('b', 2, 0)
    const result = moveElement([a, b], b, 0, 0, false, false, 'horizontal', 4)
    expect(positions(result)).toEqual({ a: [1, 0, 1, 1], b: [0, 0, 1, 1] })
  })

  it('swaps vertically with no compaction', () => {
    const a = item('a', 0, 0)
    const b = item('b', 0, 1)
    const result = moveElement([a, b], b, 0, 0, true, false, null, 4)
    expect(positions(result)).toEqual({ a: [0, 1, 1, 1], b: [0, 0, 1, 1] })
  })

  it('moves a colliding item up when there is room above it', () => {
    const b = item('b', 0, 3)
    const c = item('c', 0, 3)
    const result = moveElementAwayFromCollision([b, c], b, c, true, 'vertical', 4)
    expect(positions(result).c).toEqual([0, 2, 1, 1])
  })

  it('moves a colliding item down when there is no room above it', () => {
    const b = item('b', 0, 0)
    const c = item('c', 0, 0)
    const result = moveElementAwayFromCollision([b, c], b, c, true, 'vertical', 4)
    expect(positions(result).c).toEqual([0, 1, 1, 1])
  })
})

describe('compaction', () => {
  it('compacts upward around static items', () => {
    const layout = [
      item('a', 0, 3, 2, 1),
      item('s', 0, 0, 1, 1, { static: true }),
      item('b', 1, 5, 1, 1),
    ]
    // b can't pass a, which spans both of the first two columns.
    expect(positions(verticalCompactor.compact(layout, 4))).toEqual({
      a: [0, 1, 2, 1],
      s: [0, 0, 1, 1],
      b: [1, 2, 1, 1],
    })
  })

  it('compacts leftward, wrapping an item that would overflow', () => {
    const layout = [item('a', 0, 0, 3, 1), item('b', 3, 0, 2, 1)]
    expect(positions(horizontalCompactor.compact(layout, 4))).toEqual({
      a: [0, 0, 3, 1],
      b: [0, 1, 2, 1],
    })
  })

  it('keeps the input order and clears the moved flag', () => {
    const layout = [item('b', 0, 4), item('a', 0, 2, 1, 1, { moved: true })]
    const out = verticalCompactor.compact(layout, 4)
    expect(out.map((l) => l.i)).toEqual(['b', 'a'])
    expect(out.every((l) => l.moved === false)).toBe(true)
  })

  it('leaves a free-form layout where it is', () => {
    const layout = [item('a', 2, 7)]
    const out = noCompactor.compact(layout, 4)
    expect(positions(out)).toEqual({ a: [2, 7, 1, 1] })
    expect(out[0]).not.toBe(layout[0])
  })

  it('picks a compactor by type', () => {
    expect(getCompactor('vertical')).toBe(verticalCompactor)
    expect(getCompactor('horizontal')).toBe(horizontalCompactor)
    expect(getCompactor(null)).toBe(noCompactor)
  })

  it('compacts single items and resolves collisions below them', () => {
    const placed = [item('a', 0, 0, 2, 2)]
    const moving = item('b', 0, 5)
    compactItemVertical(placed, moving, [...placed, moving], 10)
    expect([moving.x, moving.y]).toEqual([0, 2])

    const row = [item('a', 0, 0, 2, 1)]
    const sliding = item('b', 3, 0)
    compactItemHorizontal(row, sliding, 4, [...row, sliding])
    expect([sliding.x, sliding.y]).toEqual([2, 0])

    const top = item('t', 0, 0, 1, 2)
    const below = item('u', 0, 1, 1, 1)
    resolveCompactionCollision([top, below], top, 1, 'y')
    expect([top.y, below.y]).toEqual([1, 3])
  })
})

describe('responsive helpers', () => {
  const breakpoints = { base: 0, md: 768, lg: 1024 }

  it('sorts breakpoints and finds the one for a width', () => {
    expect(sortBreakpoints({ lg: 1024, base: 0, md: 768 })).toEqual(['base', 'md', 'lg'])
    expect(getBreakpointFromWidth(breakpoints, 500)).toBe('base')
    expect(getBreakpointFromWidth(breakpoints, 800)).toBe('md')
    expect(getBreakpointFromWidth(breakpoints, 1024)).toBe('md')
    expect(getBreakpointFromWidth(breakpoints, 1025)).toBe('lg')
    expect(() => getBreakpointFromWidth({}, 10)).toThrow('No breakpoints defined')
  })

  it('generates a narrower layout from the widest one', () => {
    const lg = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2), item('c', 8, 2, 4, 1)]
    const generated = findOrGenerateResponsiveLayout(
      { lg },
      breakpoints,
      'base',
      'lg',
      4,
      'vertical',
    )
    expect(positions(generated)).toEqual({
      a: [0, 0, 4, 2],
      b: [0, 2, 4, 2],
      c: [0, 4, 4, 1],
    })
    expect(lg[1]?.x).toBe(6)
  })

  it('returns a copy of a stored layout', () => {
    const md = [item('a', 1, 1)]
    const found = findOrGenerateResponsiveLayout({ md }, breakpoints, 'md', 'md', 8, 'vertical')
    expect(found).toEqual(md)
    expect(found[0]).not.toBe(md[0])
  })
})
