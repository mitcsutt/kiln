import { describe, expect, it } from 'vitest'
import { analyseSchema, schemaDefaultValues } from '#schema/core/collect'
import {
  fieldNodeProps,
  isFieldNode,
  isLayoutNode,
  isRepeaterNode,
  layoutNodeProps,
} from '#schema/core/nodes'
import type { UntypedFormSchema, UntypedLayoutNode, UntypedNode } from '#schema/core/types'
import { getPath, joinPath, pathSegments, setPath } from '#schema/core/values'
import { expenseSchema, projectSignupSchema } from '#schema/core/__fixtures__/schemas'

function byId(schema: UntypedFormSchema, id: string): UntypedNode {
  const node = analyseSchema(schema).nodeById.get(id)
  if (!node) throw new Error(`no node ${id}`)
  return node
}

const schema: UntypedFormSchema = {
  version: 1,
  root: {
    layout: 'tabs',
    id: 'tabs',
    label: 'Sections',
    children: [
      {
        layout: 'tab',
        id: 'you',
        value: 'you',
        label: 'You',
        children: [
          {
            kind: 'text',
            name: 'name',
            id: 'name',
            label: 'Name',
            defaultValue: 'Ada',
            when: { field: 'role', op: 'eq', value: 'member' },
          },
          {
            layout: 'grid',
            id: 'grid',
            children: [
              {
                kind: 'text',
                name: 'address.city',
                label: 'City',
                disabledWhen: { field: 'address.line1', op: 'empty' },
              },
              {
                kind: 'number',
                name: 'age',
                label: 'Age',
                defaultValue: 18,
                requiredWhen: {
                  all: [
                    { field: 'role', op: 'eq', value: 'admin' },
                    { field: 'age', op: 'gt', value: 1 },
                  ],
                },
              },
              { kind: 'text', name: 'name', label: 'Name again' },
            ],
          },
        ],
      },
      {
        layout: 'tab',
        id: 'guests-tab',
        value: 'guests',
        label: 'Guests',
        children: [
          {
            layout: 'repeater',
            id: 'guests',
            name: 'guests',
            label: 'Guests',
            newItem: { name: '', age: null },
            item: [
              {
                kind: 'text',
                name: 'name',
                id: 'guest-name',
                label: 'Name',
                defaultValue: 'ignored at root',
              },
              {
                layout: 'section',
                id: 'guest-more',
                title: 'More',
                children: [{ kind: 'number', name: 'age', label: 'Age' }],
              },
            ],
          },
          { content: 'text', id: 'note', text: 'Up to four guests.' },
        ],
      },
    ],
  },
}

describe('analyseSchema', () => {
  const analysis = analyseSchema(schema)

  it('is cached per schema object', () => {
    expect(analyseSchema(schema)).toBe(analysis)
    expect(analyseSchema({ ...schema })).not.toBe(analysis)
  })

  it('indexes nodes by id', () => {
    expect([...analysis.nodeById.keys()]).toEqual([
      'tabs',
      'you',
      'name',
      'grid',
      'guests-tab',
      'guests',
      'guest-name',
      'guest-more',
      'note',
    ])
  })

  it('names per subtree, de-duplicated; repeaters contribute their array name', () => {
    expect(analysis.names(schema.root)).toEqual(['name', 'address.city', 'age', 'guests'])
    expect(analysis.names(byId(schema, 'you'))).toEqual(['name', 'address.city', 'age'])
    expect(analysis.names(byId(schema, 'grid'))).toEqual(['address.city', 'age', 'name'])
    expect(analysis.names(byId(schema, 'guests-tab'))).toEqual(['guests'])
    expect(analysis.names(byId(schema, 'note'))).toEqual([])
  })

  it('item nodes are item-relative; a prefix makes them absolute', () => {
    expect(analysis.names(byId(schema, 'guest-more'))).toEqual(['age'])
    expect(analysis.names(byId(schema, 'guest-more'), 'guests[2]')).toEqual(['guests[2].age'])
    expect(analysis.names(byId(schema, 'guests'), '')).toEqual(['guests'])
  })

  it('repeaterOf finds the enclosing repeater', () => {
    const guests = byId(schema, 'guests')
    expect(analysis.repeaterOf(byId(schema, 'guest-name'))).toBe(guests)
    expect(analysis.repeaterOf(byId(schema, 'guest-more'))).toBe(guests)
    expect(analysis.repeaterOf(guests)).toBeUndefined()
    expect(analysis.repeaterOf(byId(schema, 'name'))).toBeUndefined()
  })

  it('deps: paths read by the node’s own conditions', () => {
    expect(analysis.deps(byId(schema, 'name'))).toEqual(['role'])
    const grid = byId(schema, 'grid') as UntypedLayoutNode
    const [city, age] = grid.children
    expect(city && analysis.deps(city)).toEqual(['address.line1'])
    expect(age && analysis.deps(age)).toEqual(['role', 'age'])
    expect(analysis.deps(grid)).toEqual([])
  })

  it('defaults: field-level defaultValue of root-scope fields only', () => {
    expect(analysis.defaults).toEqual({ name: 'Ada', age: 18 })
  })

  it('handles the fixture schemas', () => {
    const signup = analyseSchema(projectSignupSchema)
    expect(signup.names(projectSignupSchema.root)).toEqual([
      'name',
      'email',
      'age',
      'role',
      'address.line1',
      'address.city',
      'address.postcode',
      'client',
      'project',
      'disciplines',
      'fee',
      'paid',
      'code',
      'guests',
    ])
    expect(signup.nodeById.get('email')).toMatchObject({ kind: 'text', name: 'email' })
    expect(analyseSchema(expenseSchema).names(expenseSchema.root)).toContain('splits')
  })
})

describe('schemaDefaultValues', () => {
  it('builds nested values from defaults, kind empties and repeaters', () => {
    const values = schemaDefaultValues(schema, { text: '', number: null })
    expect(values).toEqual({ name: 'Ada', address: { city: '' }, age: 18, guests: [] })
  })
  it('without empties only defaults and repeaters', () => {
    expect(schemaDefaultValues(schema)).toEqual({ name: 'Ada', age: 18, guests: [] })
  })
  it('clones defaults (no shared references)', () => {
    const s: UntypedFormSchema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'tags', name: 'a' },
          { kind: 'tags', name: 'b' },
        ],
      },
    }
    const empties = { tags: [] as string[] }
    const values = schemaDefaultValues(s, empties) as { a: string[]; b: string[] }
    values.a.push('x')
    expect(values.b).toEqual([])
    expect(empties.tags).toEqual([])
  })
})

describe('field nodes carrying a layout prop', () => {
  const s: UntypedFormSchema = {
    version: 1,
    root: {
      layout: 'stack',
      children: [
        {
          kind: 'text',
          name: 'name',
          id: 'name',
          label: 'Name',
          layout: 'horizontal',
          defaultValue: 'Ada',
        },
        {
          kind: 'switch',
          name: 'alerts',
          label: 'Alerts',
          layout: 'inline',
          when: { field: 'name', op: 'notEmpty' },
        },
      ],
    },
  }
  it('are fields everywhere: guards, analysis, defaults', () => {
    const analysis = analyseSchema(s)
    const field = analysis.nodeById.get('name')
    if (!field) throw new Error('missing')
    expect(isFieldNode(field)).toBe(true)
    expect(isLayoutNode(field)).toBe(false)
    expect(isRepeaterNode(field)).toBe(false)
    expect(isFieldNode(field) && fieldNodeProps(field)).toEqual({
      label: 'Name',
      layout: 'horizontal',
    })
    expect(analysis.names(s.root)).toEqual(['name', 'alerts'])
    expect(analysis.defaults).toEqual({ name: 'Ada' })
    expect(schemaDefaultValues(s, { switch: false })).toEqual({ name: 'Ada', alerts: false })
  })
})

describe('prototype safety', () => {
  it('setPath refuses prototype-reaching segments and never pollutes', () => {
    for (const path of [
      '__proto__.polluted',
      'a.__proto__.polluted',
      'constructor.prototype.polluted',
      'a[0].prototype',
    ]) {
      expect(() => {
        setPath({}, path, true)
      }).toThrow(/not allowed/)
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
  it('getPath reads own properties only', () => {
    expect(getPath({}, 'constructor')).toBeUndefined()
    expect(getPath({ a: {} }, 'a.toString')).toBeUndefined()
    expect(getPath({}, '__proto__')).toBeUndefined()
    expect(getPath({ a: [1, 2] }, 'a.length')).toBe(2)
  })
  it('schemaDefaultValues on an unparsed malicious schema throws instead of polluting', () => {
    const s = {
      version: 1,
      root: { kind: 'text', name: '__proto__.polluted', defaultValue: 'yes' },
    } as const
    expect(() => schemaDefaultValues(s)).toThrow(/not allowed/)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

describe('node helpers', () => {
  it('guards and props', () => {
    const field = byId(schema, 'name')
    expect(isFieldNode(field)).toBe(true)
    expect(isFieldNode(field) && fieldNodeProps(field)).toEqual({ label: 'Name' })
    const repeater = byId(schema, 'guests')
    expect(isRepeaterNode(repeater)).toBe(true)
    expect(isLayoutNode(repeater)).toBe(false)
    expect(isRepeaterNode(repeater) && layoutNodeProps(repeater)).toEqual({
      name: 'guests',
      label: 'Guests',
    })
    const tab = byId(schema, 'you')
    expect(isLayoutNode(tab) && layoutNodeProps(tab)).toEqual({ value: 'you', label: 'You' })
  })
})

describe('path helpers', () => {
  it('segments, join, get, set', () => {
    expect(pathSegments('guests[2].name')).toEqual(['guests', 2, 'name'])
    expect(pathSegments('a.0.b')).toEqual(['a', 0, 'b'])
    expect(joinPath('guests[2]', 'name')).toBe('guests[2].name')
    expect(joinPath('', 'name')).toBe('name')
    expect(joinPath('matrix', '[0]')).toBe('matrix[0]')
    expect(getPath({ a: [{ b: 1 }] }, 'a[0].b')).toBe(1)
    expect(getPath({ a: null }, 'a.b')).toBeUndefined()
    const target: Record<string, unknown> = {}
    setPath(target, 'a.b', 1)
    setPath(target, 'list[1].x', 2)
    expect(target).toEqual({ a: { b: 1 }, list: [undefined, { x: 2 }] })
  })
})
