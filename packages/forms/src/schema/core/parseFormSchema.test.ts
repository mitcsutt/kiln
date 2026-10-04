import { describe, expect, it } from 'vitest'
import {
  parseFormSchema,
  PATTERN_NOT_ALLOWED,
  type SchemaIssue,
} from '#schema/core/parseFormSchema'
import { testRegistryNames } from '#schema/core/__fixtures__/registry'
import { storySchemas } from '#schema/core/__fixtures__/schemas'

const registry = testRegistryNames

function issues(json: unknown, reg = registry): readonly SchemaIssue[] {
  const result = parseFormSchema(json, reg)
  return result.ok ? [] : result.issues
}
const wrap = (root: unknown) => ({ version: 1, root })
const field = (extra: Record<string, unknown> = {}) => ({
  kind: 'text',
  name: 'name',
  label: 'Name',
  ...extra,
})

describe('parseFormSchema — accepts', () => {
  it.each(Object.entries(storySchemas))('%s (and its JSON round-trip)', (_name, schema) => {
    const json: unknown = JSON.parse(JSON.stringify(schema))
    expect(json).toEqual(schema) // §10.10: registry-only schemas round-trip unchanged
    // Fixtures are trusted (some use `pattern`, e.g. the league entry's confirmation code).
    const result = parseFormSchema(json, registry, { allowPatterns: true })
    expect(result.ok ? [] : result.issues).toEqual([])
    expect(result.ok && result.schema).toBe(json)
  })

  it('takes registry objects or name arrays; layouts add to the defaults', () => {
    const json = wrap({
      layout: 'timeline',
      children: [{ layout: 'section', title: 'Still there', children: [] }],
    })
    expect(parseFormSchema(json, { kinds: [], layouts: { timeline: () => null } }).ok).toBe(true)
    expect(parseFormSchema(json, { kinds: [] }).ok).toBe(false)
  })

  it('allows a review to re-render fields shown elsewhere', () => {
    const json = wrap({
      layout: 'stack',
      children: [field(), { layout: 'review', children: [field()] }],
    })
    expect(issues(json)).toEqual([])
  })

  it('accepts a field node carrying a layout prop', () => {
    const json = wrap({
      layout: 'stack',
      children: [
        field({ layout: 'horizontal' }),
        field({ name: 'b', kind: 'switch', layout: 'inline' }),
      ],
    })
    expect(issues(json)).toEqual([])
    expect(issues(wrap(field({ layout: 'horizontal', content: 'text' })))).toEqual([
      { path: 'root', message: 'Node has more than one of kind, content' },
    ])
  })

  it('rejects prototype-reaching path segments', () => {
    const json = wrap({
      layout: 'stack',
      children: [
        field({ name: '__proto__.polluted' }),
        field({ name: 'constructor' }),
        field({
          name: 'a.prototype',
          when: { field: 'x.__proto__', op: 'truthy' },
          resets: ['__proto__'],
        }),
        field({ name: 'list', kind: 'tags', rules: [{ rule: 'unique', by: 'constructor' }] }),
      ],
    })
    expect(issues(json)).toEqual([
      { path: 'root.children[0].name', message: 'Path segment "__proto__" is not allowed' },
      { path: 'root.children[1].name', message: 'Path segment "constructor" is not allowed' },
      { path: 'root.children[2].when.field', message: 'Path segment "__proto__" is not allowed' },
      { path: 'root.children[2].name', message: 'Path segment "prototype" is not allowed' },
      { path: 'root.children[2].resets[0]', message: 'Path segment "__proto__" is not allowed' },
      {
        path: 'root.children[3].rules[0].by',
        message: 'Path segment "constructor" is not allowed',
      },
    ])
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('allows the same name in different repeater item scopes', () => {
    const json = wrap({
      layout: 'stack',
      children: [
        field(),
        {
          layout: 'repeater',
          name: 'guests',
          label: 'Guests',
          newItem: { name: '' },
          item: [field()],
        },
        {
          layout: 'repeater',
          name: 'hosts',
          label: 'Hosts',
          newItem: { name: '' },
          item: [field()],
        },
      ],
    })
    expect(issues(json)).toEqual([])
  })
})

describe('parseFormSchema — rejects with precise paths', () => {
  const cases: [string, unknown, SchemaIssue[]][] = [
    ['not an object', 'form', [{ path: '', message: 'Expected a schema object' }]],
    [
      'wrong version, no root',
      { version: 2 },
      [
        { path: 'version', message: 'Expected version 1' },
        { path: 'root', message: 'Schema needs a root node' },
      ],
    ],
    [
      'unknown field kind',
      wrap({
        layout: 'stack',
        children: [
          field(),
          field({ name: 'email' }),
          { kind: 'phone', name: 'phone', label: 'Phone' },
        ],
      }),
      [{ path: 'root.children[2].kind', message: 'Unknown field kind "phone"' }],
    ],
    [
      'unknown layout',
      wrap({ layout: 'carousel', children: [] }),
      [{ path: 'root.layout', message: 'Unknown layout "carousel"' }],
    ],
    [
      'node without a discriminant',
      wrap({ layout: 'stack', children: [{ name: 'x', label: 'X' }] }),
      [{ path: 'root.children[0]', message: 'Node needs one of kind, layout, content or custom' }],
    ],
    [
      'node with two discriminants',
      wrap({ layout: 'stack', content: 'text', text: 'x', children: [] }),
      [{ path: 'root', message: 'Node has more than one of layout, content' }],
    ],
    [
      'duplicate field names in a scope',
      wrap({
        layout: 'grid',
        children: [field(), { layout: 'section', title: 'Again', children: [field()] }],
      }),
      [{ path: 'root.children[1].children[0].name', message: 'Duplicate field name "name"' }],
    ],
    [
      'duplicate node ids',
      wrap({ layout: 'stack', children: [field({ id: 'a' }), field({ name: 'b', id: 'a' })] }),
      [{ path: 'root.children[1].id', message: 'Duplicate node id "a"' }],
    ],
    [
      'unknown rule and bad rule arguments',
      wrap(
        field({
          rules: [
            { rule: 'luhn' },
            { rule: 'minLength', value: -1 },
            { rule: 'pattern', value: '(' },
            { rule: 'minDate', value: 'next week' },
            { rule: 'step', value: 0 },
            { rule: 'max', value: '10' },
          ],
        }),
      ),
      [
        { path: 'root.rules[0].rule', message: 'Unknown rule "luhn"' },
        {
          path: 'root.rules[1].value',
          message: 'Rule "minLength" needs a whole number of 0 or more',
        },
        // Literal patterns are off by default; `untrusted.test.tsx` covers `Invalid pattern` with allowPatterns.
        { path: 'root.rules[2].rule', message: PATTERN_NOT_ALLOWED },
        {
          path: 'root.rules[3].value',
          message: 'Rule "minDate" needs an ISO date (YYYY-MM-DD) or "today"',
        },
        { path: 'root.rules[4].value', message: 'Rule "step" needs a number above 0' },
        { path: 'root.rules[5].value', message: 'Rule "max" needs a number' },
      ],
    ],
    [
      'unknown validator in warnRules',
      wrap(field({ warnRules: [{ rule: 'custom', validator: 'isFunny' }] })),
      [{ path: 'root.warnRules[0].validator', message: 'Unknown validator "isFunny"' }],
    ],
    [
      'bad conditions',
      wrap(
        field({
          when: {
            all: [
              { field: 'age', op: 'between', value: 1 },
              { field: 'age', op: 'gt', value: '3' },
              { foo: 1 },
            ],
          },
          disabledWhen: { context: 'mode', op: 'gt', value: 1 },
          requiredWhen: { field: 'tags', op: 'in', value: 'a' },
          excludeWhen: { not: { field: '', op: 'empty' } },
          readOnlyWhen: { field: 'role', op: 'eq' },
        }),
      ),
      [
        { path: 'root.when.all[0].op', message: 'Unknown condition operator "between"' },
        { path: 'root.when.all[1].value', message: 'Operator "gt" needs a number value' },
        {
          path: 'root.when.all[2]',
          message: 'Condition needs one of field, context, all, any or not',
        },
        { path: 'root.disabledWhen.op', message: 'Unknown condition operator "gt"' },
        { path: 'root.readOnlyWhen.value', message: 'Operator "eq" needs a JSON value' },
        { path: 'root.excludeWhen.not.field', message: 'Expected a non-empty string' },
        { path: 'root.requiredWhen.value', message: 'Operator "in" needs an array value' },
      ],
    ],
    [
      'unknown loader, computer and bad dependency lists',
      wrap(
        field({
          optionsFrom: { loader: 'players', deps: 'league' },
          compute: { computer: 'sum' },
          resets: [1],
        }),
      ),
      [
        { path: 'root.optionsFrom.loader', message: 'Unknown loader "players"' },
        { path: 'root.optionsFrom.deps', message: 'Expected an array of field names' },
        { path: 'root.resets', message: 'Expected an array of field names' },
        { path: 'root.compute.computer', message: 'Unknown computer "sum"' },
        { path: 'root.compute.from', message: 'Expected an array of field names' },
      ],
    ],
    [
      'repeater without newItem or item',
      wrap({ layout: 'repeater', name: 'guests', label: 'Guests' }),
      [
        { path: 'root', message: 'Repeater needs newItem (the value of an added item)' },
        { path: 'root.item', message: 'Expected an array of item nodes' },
      ],
    ],
    [
      'repeater item errors use item paths',
      wrap({
        layout: 'repeater',
        name: 'guests',
        newItem: [],
        item: [field(), field({ kind: 'phone' })],
      }),
      [
        { path: 'root.label', message: 'Repeater needs a label' },
        { path: 'root.newItem', message: 'Expected a JSON object' },
        { path: 'root.item[1].kind', message: 'Unknown field kind "phone"' },
        { path: 'root.item[1].name', message: 'Duplicate field name "name"' },
      ],
    ],
    [
      'repeater columns: width is ui TableColumnWidth (fill | min), header is text',
      wrap({
        layout: 'repeater',
        name: 'guests',
        label: 'Guests',
        variant: 'table',
        newItem: { name: '' },
        item: [field()],
        columns: [
          { header: 'Name', width: 'fill' },
          { header: 'Age', width: 'narrow' },
          { width: 'min' },
          'Diet',
        ],
      }),
      [
        {
          path: 'root.columns[1].width',
          message: 'Unknown column width "narrow" (expected "fill" or "min")',
        },
        { path: 'root.columns[2].header', message: 'Column needs a header (text)' },
        { path: 'root.columns[3]', message: 'Expected a column object' },
      ],
    ],
    [
      'repeater columns not an array',
      wrap({
        layout: 'repeater',
        name: 'guests',
        label: 'Guests',
        newItem: { name: '' },
        item: [field()],
        columns: { header: 'Name' },
      }),
      [{ path: 'root.columns', message: 'Expected an array of columns' }],
    ],
    [
      'unknown content and missing text',
      wrap({
        layout: 'stack',
        children: [
          { content: 'image' },
          { content: 'heading', level: 1 },
          { content: 'alert', text: 'x', tone: 'warning' },
        ],
      }),
      [
        { path: 'root.children[0].content', message: 'Unknown content "image"' },
        { path: 'root.children[1].text', message: 'Content "heading" needs text' },
        { path: 'root.children[1].level', message: 'Expected 2, 3 or 4' },
        { path: 'root.children[2].tone', message: 'Unknown tone "warning"' },
      ],
    ],
    [
      'unknown custom node, bad props, stray keys',
      wrap({
        layout: 'stack',
        children: [
          { custom: 'leaderboard' },
          { custom: 'teamPreview', props: [1], teamId: 'riverside' },
        ],
      }),
      [
        { path: 'root.children[0].custom', message: 'Unknown custom node "leaderboard"' },
        { path: 'root.children[1].props', message: 'Expected a JSON object' },
        {
          path: 'root.children[1].teamId',
          message: 'Unexpected key "teamId" (put custom node data in props)',
        },
      ],
    ],
    [
      'layout missing required text and children',
      wrap({ layout: 'tabs', children: [{ layout: 'tab', value: 'a' }] }),
      [
        { path: 'root.label', message: 'Layout "tabs" needs a label (text)' },
        { path: 'root.children[0].label', message: 'Layout "tab" needs a label (text)' },
        { path: 'root.children[0].children', message: 'Expected an array of child nodes' },
      ],
    ],
    [
      'non-JSON props, bad options, bad whenHidden',
      wrap(
        field({
          onBlur: () => undefined,
          when: undefined,
          options: [{ value: 'a' }, { value: { x: 1 }, label: 'X' }],
          whenHidden: 'drop',
          defaultValue: new Date(0),
          placeholder: Number.NaN,
        }),
      ),
      [
        { path: 'root.defaultValue', message: 'Expected a JSON value' },
        { path: 'root.whenHidden', message: 'Expected "prune", "keep" or "reset"' },
        {
          path: 'root.options[0]',
          message: 'Option needs a value (string, number or boolean) and a label',
        },
        {
          path: 'root.options[1]',
          message: 'Option needs a value (string, number or boolean) and a label',
        },
        { path: 'root.onBlur', message: 'Event handler prop "onBlur" is not allowed in a schema' },
        {
          path: 'root.placeholder',
          message:
            'Expected a JSON value (functions, objects with methods and values nested over 64 levels are not allowed)',
        },
      ],
    ],
    [
      'field name with spaces and a bad id',
      wrap({
        layout: 'stack',
        children: [field({ name: 'first name' }), field({ name: 'b', id: 3 })],
      }),
      [
        { path: 'root.children[0].name', message: 'Expected a field name (no spaces)' },
        { path: 'root.children[1].id', message: 'Expected a non-empty string' },
      ],
    ],
  ]

  it.each(cases)('%s', (_name, json, expected) => {
    expect(issues(json)).toEqual(expected)
  })

  it('covers at least 15 malformed cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(15)
  })

  it('reports every issue, not just the first', () => {
    const json = wrap({
      layout: 'stack',
      children: [
        { kind: 'phone', name: 'a' },
        { layout: 'carousel', children: [] },
        { custom: 'x' },
      ],
    })
    expect(issues(json).map((issue) => issue.path)).toEqual([
      'root.children[0].kind',
      'root.children[1].layout',
      'root.children[2].custom',
    ])
  })
})
