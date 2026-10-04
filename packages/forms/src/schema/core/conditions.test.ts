import { describe, expect, it } from 'vitest'
import { conditionDeps, evaluateCondition, usesContext } from '#schema/core/conditions'
import type { UntypedCondition } from '#schema/core/types'

const values = {
  name: 'Ada',
  blank: '',
  nothing: null,
  zero: 0,
  age: 30,
  agree: true,
  off: false,
  tags: ['a', 'b'],
  none: [] as string[],
  role: 'admin',
  range: [1, 5],
  address: { city: 'Leeds' },
  guests: [{ name: 'Grace', age: 12 }],
}

describe('evaluateCondition — field operators', () => {
  const cases: [UntypedCondition, boolean][] = [
    [{ field: 'name', op: 'eq', value: 'Ada' }, true],
    [{ field: 'name', op: 'eq', value: 'ada' }, false],
    [{ field: 'name', op: 'neq', value: 'Grace' }, true],
    [{ field: 'range', op: 'eq', value: [1, 5] }, true],
    [{ field: 'address', op: 'eq', value: { city: 'Leeds' } }, true],
    [{ field: 'role', op: 'in', value: ['admin', 'owner'] }, true],
    [{ field: 'role', op: 'in', value: ['player'] }, false],
    [{ field: 'role', op: 'notIn', value: ['player'] }, true],
    [{ field: 'role', op: 'notIn', value: ['admin'] }, false],
    [{ field: 'age', op: 'gt', value: 29 }, true],
    [{ field: 'age', op: 'gt', value: 30 }, false],
    [{ field: 'age', op: 'gte', value: 30 }, true],
    [{ field: 'age', op: 'lt', value: 31 }, true],
    [{ field: 'age', op: 'lte', value: 29 }, false],
    [{ field: 'nothing', op: 'gt', value: -1 }, false],
    [{ field: 'name', op: 'gt', value: 0 }, false],
    [{ field: 'address.city', op: 'eq', value: 'Leeds' }, true],
    [{ field: 'guests[0].name', op: 'eq', value: 'Grace' }, true],
    [{ field: 'guests.0.age', op: 'lt', value: 16 }, true],
    [{ field: 'guests[3].name', op: 'empty' }, true],
    [{ field: 'missing.deep', op: 'eq', value: undefined }, true],
  ]
  it.each(cases)('%j → %s', (condition, expected) => {
    expect(evaluateCondition(condition, values)).toBe(expected)
  })
})

describe('evaluateCondition — truthiness and empty semantics', () => {
  // field → [truthy, falsy, empty, notEmpty]
  const table: [string, boolean, boolean, boolean, boolean][] = [
    ['name', true, false, false, true],
    ['blank', false, true, true, false],
    ['nothing', false, true, true, false],
    ['undefinedField', false, true, true, false],
    ['none', false, true, true, false],
    ['tags', true, false, false, true],
    ['zero', false, true, false, true],
    ['off', false, true, false, true],
    ['agree', true, false, false, true],
    ['address', true, false, false, true],
  ]
  it.each(table)('%s', (field, truthy, falsy, empty, notEmpty) => {
    expect(evaluateCondition({ field, op: 'truthy' }, values)).toBe(truthy)
    expect(evaluateCondition({ field, op: 'falsy' }, values)).toBe(falsy)
    expect(evaluateCondition({ field, op: 'empty' }, values)).toBe(empty)
    expect(evaluateCondition({ field, op: 'notEmpty' }, values)).toBe(notEmpty)
  })
})

describe('evaluateCondition — combinators', () => {
  const t: UntypedCondition = { field: 'agree', op: 'truthy' }
  const f: UntypedCondition = { field: 'off', op: 'truthy' }

  it('all / any / not', () => {
    expect(evaluateCondition({ all: [t, t] }, values)).toBe(true)
    expect(evaluateCondition({ all: [t, f] }, values)).toBe(false)
    expect(evaluateCondition({ any: [f, t] }, values)).toBe(true)
    expect(evaluateCondition({ any: [f, f] }, values)).toBe(false)
    expect(evaluateCondition({ not: f }, values)).toBe(true)
    expect(evaluateCondition({ not: t }, values)).toBe(false)
  })

  it('empty all is true, empty any is false', () => {
    expect(evaluateCondition({ all: [] }, values)).toBe(true)
    expect(evaluateCondition({ any: [] }, values)).toBe(false)
  })

  it('nests', () => {
    const nested: UntypedCondition = {
      all: [
        { any: [f, { not: { all: [f] } }] },
        { not: { any: [f, { field: 'blank', op: 'notEmpty' }] } },
      ],
    }
    expect(evaluateCondition(nested, values)).toBe(true)
    expect(evaluateCondition({ not: nested }, values)).toBe(false)
  })
})

describe('evaluateCondition — context', () => {
  const context = { mode: 'edit', role: 'organiser', flags: ['beta'] }
  it('eq / neq / in', () => {
    expect(evaluateCondition({ context: 'mode', op: 'eq', value: 'edit' }, values, context)).toBe(
      true,
    )
    expect(evaluateCondition({ context: 'mode', op: 'neq', value: 'edit' }, values, context)).toBe(
      false,
    )
    expect(
      evaluateCondition(
        { context: 'role', op: 'in', value: ['organiser', 'admin'] },
        values,
        context,
      ),
    ).toBe(true)
    expect(
      evaluateCondition({ context: 'flags', op: 'eq', value: ['beta'] }, values, context),
    ).toBe(true)
  })
  it('missing context reads undefined', () => {
    expect(evaluateCondition({ context: 'mode', op: 'eq', value: 'edit' }, values)).toBe(false)
    expect(evaluateCondition({ context: 'mode', op: 'neq', value: 'edit' }, values)).toBe(true)
  })
  it('mixes with field conditions', () => {
    const c: UntypedCondition = {
      all: [
        { context: 'mode', op: 'eq', value: 'edit' },
        { field: 'role', op: 'eq', value: 'admin' },
      ],
    }
    expect(evaluateCondition(c, values, context)).toBe(true)
    expect(evaluateCondition(c, values, { mode: 'create' })).toBe(false)
  })
})

describe('conditionDeps / usesContext', () => {
  it('collects field paths once, in order, skipping context', () => {
    const c: UntypedCondition = {
      all: [
        { field: 'age', op: 'gt', value: 1 },
        {
          any: [
            { field: 'role', op: 'eq', value: 'admin' },
            { not: { field: 'age', op: 'empty' } },
          ],
        },
        { context: 'mode', op: 'eq', value: 'edit' },
        { field: 'guests[0].name', op: 'truthy' },
      ],
    }
    expect(conditionDeps(c)).toEqual(['age', 'role', 'guests[0].name'])
    expect(usesContext(c)).toBe(true)
    expect(usesContext({ field: 'age', op: 'empty' })).toBe(false)
  })
})
