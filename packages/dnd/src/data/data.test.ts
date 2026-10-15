import { appendItem, arrayMove, compact, moveBetween, removeItem } from '#index'

describe('list helpers', () => {
  it('arrayMove moves one entry and leaves the input alone', () => {
    const steps = ['Draft', 'Review', 'Publish']
    expect(arrayMove(steps, 2, 0)).toEqual(['Publish', 'Draft', 'Review'])
    expect(arrayMove(steps, 0, Infinity)).toEqual(['Review', 'Publish', 'Draft'])
    expect(arrayMove(steps, 5, 0)).toEqual(steps)
    expect(steps).toEqual(['Draft', 'Review', 'Publish'])
  })

  it('moveBetween moves across lists and keeps untouched lists', () => {
    const lists = { todo: ['a', 'b'], doing: ['c'], done: [] as string[] }
    const next = moveBetween(lists, { column: 'todo', index: 1 }, { column: 'doing', index: 0 })
    expect(next).toEqual({ todo: ['a'], doing: ['b', 'c'], done: [] })
    expect(next.done).toBe(lists.done)
    expect(
      moveBetween(lists, { column: 'todo', index: 0 }, { column: 'todo', index: 1 }).todo,
    ).toEqual(['b', 'a'])
    expect(moveBetween(lists, { column: 'nope', index: 0 }, { column: 'todo', index: 0 })).toEqual(
      lists,
    )
  })
})

describe('layout helpers', () => {
  const layout = [
    { i: 'revenue', x: 0, y: 0, w: 6, h: 2, title: 'Revenue' },
    { i: 'orders', x: 6, y: 3, w: 6, h: 2, title: 'Orders' },
  ]

  it('compact closes gaps, keeps your fields and adds nothing', () => {
    expect(compact(layout, { columns: 12 })).toEqual([
      { i: 'revenue', x: 0, y: 0, w: 6, h: 2, title: 'Revenue' },
      { i: 'orders', x: 6, y: 0, w: 6, h: 2, title: 'Orders' },
    ])
    expect(compact(layout, { columns: 12, compaction: 'none' })[1]?.y).toBe(3)
  })

  it('compact pulls items back inside fewer columns', () => {
    expect(compact([{ i: 'a', x: 10, y: 0, w: 4, h: 1 }], { columns: 8 })).toEqual([
      { i: 'a', x: 4, y: 0, w: 4, h: 1 },
    ])
  })

  it('appendItem adds at the bottom and removeItem closes the gap', () => {
    const added = appendItem(
      layout,
      { i: 'tickets', w: 4, h: 2, title: 'Tickets' },
      { columns: 12 },
    )
    expect(added.at(-1)).toEqual({ i: 'tickets', x: 0, y: 2, w: 4, h: 2, title: 'Tickets' })
    const removed = removeItem(added, 'revenue', { columns: 12 })
    expect(removed.map((l) => [l.i, l.y])).toEqual([
      ['orders', 0],
      ['tickets', 0],
    ])
  })
})
