import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { Form } from '#components/form/Form'
import { defaultMessages } from '#runtime/messages'
import { kit } from '#kit/defaultKit'
import { testRegistryNames } from '#schema/core/__fixtures__/registry'
import {
  parseFormSchema,
  PATTERN_NOT_ALLOWED,
  SCHEMA_LIMITS,
  type SchemaIssue,
} from '#schema/core/parseFormSchema'
import { defineValidator } from '#schema/core/registry'
import { hasNestedQuantifier, MAX_PATTERN_INPUT, MAX_PATTERN_LENGTH } from '#schema/core/patterns'
import { compileRules } from '#schema/core/rules'
import { toStandardSchema } from '#schema/core/toStandardSchema'
import type { UntypedFormSchema } from '#schema/core/types'
import { resetWarnings } from '#schema/render/warn'

// Hostile, server-driven schemas (§10.8): parse, render and server rules.

const registry = testRegistryNames
const wrap = (root: unknown) => ({ version: 1, root })

function issues(json: unknown): readonly SchemaIssue[] {
  const result = parseFormSchema(json, registry)
  return result.ok ? [] : result.issues
}

/** Renders an untyped schema with the default kit, skipping the parser (defence in depth). */
function renderUntrusted(schema: UntypedFormSchema, defaultValues: Record<string, unknown> = {}) {
  function Harness() {
    const form = kit.useAppForm<Record<string, unknown>>({ defaultValues })
    return (
      <Form form={form} aria-label="Untrusted">
        <kit.SchemaForm form={form} schema={schema as never} />
      </Form>
    )
  }
  return render(<Harness />)
}

const UNBOUNDED =
  'Pattern has more than 2 unbounded or wide quantifiers (*, +, {n,} or a range over 10), which can take polynomial time'
const XSS = '<img id="pwn" src="x" onerror="window.__pwned = true">'

describe('untrusted schemas — props', () => {
  let warn: MockInstance<typeof console.warn>
  let error: MockInstance<typeof console.error>
  beforeEach(() => {
    resetWarnings()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => {
    warn.mockRestore()
    error.mockRestore()
  })

  const injected = { layout: 'stack', dangerouslySetInnerHTML: { __html: XSS }, children: [] }

  it('parseFormSchema rejects a `dangerouslySetInnerHTML` prop with its path', () => {
    const result = parseFormSchema(wrap(injected), registry)
    expect(result.ok).toBe(false)
    expect(issues(wrap(injected))).toEqual([
      {
        path: 'root.dangerouslySetInnerHTML',
        message: 'Prop "dangerouslySetInnerHTML" is not allowed in a schema',
      },
    ])
  })

  it('rejects DOM sinks on layouts, fields and content, each at its own path', () => {
    const json = wrap({
      layout: 'stack',
      style: { color: 'red' },
      onClick: 'alert(1)',
      children: [
        {
          kind: 'text',
          name: 'a',
          label: 'A',
          dangerouslySetInnerHTML: { __html: XSS },
          onFocus: 'x',
          ref: 'r',
          key: 'k',
        },
        { layout: 'section', title: 'S', href: 'javascript:alert(1)', children: [] },
        { layout: 'section', title: 'T', src: ' JaVa\tScRiPt:alert(1)', children: [] },
        { content: 'text', text: 'Hi', className: 'evil', as: 'p' },
        { layout: 'section', title: 'Safe', href: 'https://example.com/help', children: [] },
      ],
    })
    expect(issues(json)).toEqual([
      {
        path: 'root.children[0].dangerouslySetInnerHTML',
        message: 'Prop "dangerouslySetInnerHTML" is not allowed in a schema',
      },
      {
        path: 'root.children[0].onFocus',
        message: 'Event handler prop "onFocus" is not allowed in a schema',
      },
      { path: 'root.children[0].ref', message: 'Prop "ref" is not allowed in a schema' },
      { path: 'root.children[0].key', message: 'Prop "key" is not allowed in a schema' },
      {
        path: 'root.children[1].href',
        message: 'Prop "href" may not use a javascript:, vbscript: or data: URL',
      },
      {
        path: 'root.children[2].src',
        message: 'Prop "src" may not use a javascript:, vbscript: or data: URL',
      },
      {
        path: 'root.children[3].className',
        message: 'Prop "className" is not allowed in a schema',
      },
      { path: 'root.style', message: 'Prop "style" is not allowed in a schema' },
      { path: 'root.onClick', message: 'Event handler prop "onClick" is not allowed in a schema' },
    ])
  })

  it('rejects renderer-owned props a schema could replace (form, validators, listeners)', () => {
    const json = wrap({
      kind: 'text',
      name: 'a',
      label: 'A',
      validators: { onChange: 'x' },
      listeners: {},
      form: 'other',
    })
    expect(issues(json).map((issue) => issue.path)).toEqual([
      'root.validators',
      'root.listeners',
      'root.form',
    ])
  })

  it('the renderer strips the props of a schema that skipped the parser: the HTML never reaches the DOM', () => {
    const { container } = renderUntrusted(wrap(injected) as UntypedFormSchema)
    expect(container.querySelector('#pwn')).toBeNull()
    expect(container.innerHTML).not.toContain('onerror')
  })

  it('strips sinks on a field node too (it renders, without the HTML or the handler)', () => {
    const schema = wrap({
      layout: 'stack',
      children: [
        {
          kind: 'text',
          name: 'a',
          label: 'Your name',
          dangerouslySetInnerHTML: { __html: XSS },
          onFocus: 'alert(1)',
          style: { color: 'red' },
        },
      ],
    }) as UntypedFormSchema
    const { container } = renderUntrusted(schema, { a: '' })
    const input = screen.getByLabelText('Your name')
    expect(input).toBeInTheDocument()
    expect(input).not.toHaveAttribute('style')
    expect(container.querySelector('#pwn')).toBeNull()
  })
})

describe('untrusted schemas — prop key case and field types', () => {
  let error: MockInstance<typeof console.error>
  beforeEach(() => {
    resetWarnings()
    error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => {
    error.mockRestore()
  })

  const EVIL = 'https://evil.example/steal'
  const probes = {
    layout: {
      layout: 'stack',
      Style: { color: 'red' },
      HREF: 'javascript:alert(1)',
      SrcDoc: XSS,
      'xlink:href': 'javascript:alert(1)',
      FORM: 'other',
      children: [] as unknown[],
    },
    text: {
      kind: 'text',
      name: 'a',
      label: 'Your name',
      Style: { color: 'red' },
      onclick: 'alert(1)',
      srcdoc: XSS,
    },
    submit: {
      kind: 'text',
      name: 'b',
      label: 'Go',
      type: 'submit',
      FormAction: EVIL,
      formaction: EVIL,
      formAction: EVIL,
      action: EVIL,
    },
  }

  it('parseFormSchema rejects every probe at its path', () => {
    const json = wrap({ ...probes.layout, children: [probes.text, probes.submit] })
    expect(issues(json)).toEqual([
      { path: 'root.children[0].Style', message: 'Prop "Style" is not a camelCase prop name' },
      {
        path: 'root.children[0].onclick',
        message: 'Event handler prop "onclick" is not allowed in a schema',
      },
      { path: 'root.children[0].srcdoc', message: 'Prop "srcdoc" is not allowed in a schema' },
      { path: 'root.children[1].type', message: 'Field type "submit" is not allowed in a schema' },
      {
        path: 'root.children[1].FormAction',
        message: 'Prop "FormAction" is not a camelCase prop name',
      },
      {
        path: 'root.children[1].formaction',
        message: 'Prop "formaction" is not allowed in a schema',
      },
      {
        path: 'root.children[1].formAction',
        message: 'Prop "formAction" is not allowed in a schema',
      },
      { path: 'root.children[1].action', message: 'Prop "action" is not allowed in a schema' },
      { path: 'root.Style', message: 'Prop "Style" is not a camelCase prop name' },
      { path: 'root.HREF', message: 'Prop "HREF" is not a camelCase prop name' },
      { path: 'root.SrcDoc', message: 'Prop "SrcDoc" is not a camelCase prop name' },
      { path: 'root.xlink:href', message: 'Prop "xlink:href" is not a camelCase prop name' },
      { path: 'root.FORM', message: 'Prop "FORM" is not a camelCase prop name' },
    ])
  })

  it.each(['reset', 'button', 'image', 'file', 'hidden', ' Submit '])(
    'rejects field type %j; allows email',
    (type) => {
      expect(
        issues(wrap({ kind: 'text', name: 'a', label: 'A', type })).map((issue) => issue.path),
      ).toEqual(['root.type'])
      expect(issues(wrap({ kind: 'text', name: 'a', label: 'A', type: 'email' }))).toEqual([])
    },
  )

  it('rendering the untyped probes puts none of them in the DOM', () => {
    const schema = wrap({
      ...probes.layout,
      children: [probes.text, probes.submit],
    }) as UntypedFormSchema
    const { container } = renderUntrusted(schema, { a: '', b: '' })
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    const html = container.innerHTML.toLowerCase()
    for (const needle of [
      'evil.example',
      'formaction',
      'srcdoc',
      'style=',
      'javascript:',
      'xlink',
      'onclick',
      'type="submit"',
      'form="other"',
    ]) {
      expect(html).not.toContain(needle)
    }
    expect(container.querySelector('#pwn')).toBeNull()
  })
})

describe('untrusted schemas — native `pattern` prop', () => {
  it('parseFormSchema rejects a `pattern` prop at its path (any case)', () => {
    const json = wrap({
      layout: 'stack',
      children: [
        { kind: 'text', name: 'a', label: 'A', pattern: '^(a+)+$' },
        { kind: 'text', name: 'b', label: 'B', pAttern: 'x' },
      ],
    })
    expect(issues(json)).toEqual([
      { path: 'root.children[0].pattern', message: 'Prop "pattern" is not allowed in a schema' },
      { path: 'root.children[1].pAttern', message: 'Prop "pAttern" is not allowed in a schema' },
    ])
  })

  it('the renderer strips it: the input has no pattern attribute', () => {
    const schema = wrap({
      layout: 'stack',
      children: [{ kind: 'text', name: 'a', label: 'Code', pattern: '^(a+)+$' }],
    }) as UntypedFormSchema
    renderUntrusted(schema, { a: '' })
    expect(screen.getByLabelText('Code')).not.toHaveAttribute('pattern')
  })
})

describe('untrusted schemas — literal patterns off by default', () => {
  const slowPatterns = [
    '^\\d{0,50}\\d{0,50}\\d{0,50}\\d{0,50}\\d{0,50}\\d{0,50}x$',
    '^a{0,60}a{0,60}a{0,60}b$',
    '^(a{0,99}a{0,99}a{0,99})b$',
  ]
  const withPattern = (value: string, key: 'rules' | 'warnRules' = 'rules') =>
    wrap({ kind: 'text', name: 'a', label: 'A', [key]: [{ rule: 'pattern', value }] })

  it.each(slowPatterns)('rejects %s by default, at the rule, with the advice', (source) => {
    expect(issues(withPattern(source))).toEqual([
      { path: 'root.rules[0].rule', message: PATTERN_NOT_ALLOWED },
    ])
  })

  it.each(slowPatterns)(
    'rejects %s with allowPatterns too (wide bounded ranges count as unbounded)',
    (source) => {
      const result = parseFormSchema(withPattern(source), registry, { allowPatterns: true })
      expect(result.ok ? [] : result.issues).toEqual([
        { path: 'root.rules[0].value', message: UNBOUNDED },
      ])
    },
  )

  it('rejects a harmless literal pattern by default too, in rules and warnRules', () => {
    expect(issues(withPattern('^\\d{4}$'))).toEqual([
      { path: 'root.rules[0].rule', message: PATTERN_NOT_ALLOWED },
    ])
    expect(issues(withPattern('^\\d{4}$', 'warnRules'))).toEqual([
      { path: 'root.warnRules[0].rule', message: PATTERN_NOT_ALLOWED },
    ])
  })

  it('with allowPatterns, an invalid pattern is still an issue', () => {
    const result = parseFormSchema(withPattern('('), registry, { allowPatterns: true })
    expect(result.ok ? [] : result.issues).toEqual([
      { path: 'root.rules[0].value', message: 'Invalid pattern "("' },
    ])
  })

  it('a registered named validator covers the format instead (email), on parse and on the server', async () => {
    const email = defineValidator<string>((value) =>
      /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? undefined : 'Enter an email address',
    )
    const json = wrap({
      kind: 'text',
      name: 'email',
      label: 'Email',
      rules: [{ rule: 'custom', validator: 'email' }],
    })
    const result = parseFormSchema(json, { kinds: ['text'], validators: { email } })
    if (!result.ok) throw new Error(JSON.stringify(result.issues))
    const standard = toStandardSchema(result.schema, { validators: { email } })
    expect(await standard['~standard'].validate({ email: 'ada@example.com' })).toEqual({
      value: { email: 'ada@example.com' },
    })
    const bad = await standard['~standard'].validate({ email: 'ada' })
    expect(bad.issues?.map((issue) => issue.message)).toEqual(['Enter an email address'])
  })
})

describe('untrusted schemas — resource limits', () => {
  /** Parse with literal patterns allowed (a trusted source): the heuristics still apply. */
  const allowed = (json: unknown): readonly SchemaIssue[] => {
    const result = parseFormSchema(json, registry, { allowPatterns: true })
    return result.ok ? [] : result.issues
  }
  const withPattern = (value: string) =>
    wrap({ kind: 'text', name: 'a', label: 'A', rules: [{ rule: 'pattern', value }] })

  it('rejects the catastrophic pattern ^(a+)+$', () => {
    expect(allowed(withPattern('^(a+)+$'))).toEqual([
      {
        path: 'root.rules[0].value',
        message:
          'Pattern repeats a group that contains a quantifier (e.g. "(a+)+"), which can take exponential time',
      },
    ])
  })

  it.each(['(a+)+', '(\\w+\\s?)*', '(x+){10}', '((ab)*c)+', '(?:[a-z]+-?)+$', '(a{1,3})+'])(
    'flags nested quantifier %s',
    (source) => {
      expect(hasNestedQuantifier(source)).toBe(true)
    },
  )

  it.each([
    '^\\d{4}$',
    '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
    '^(\\+44)?\\d+$',
    '^(ab)+$',
    '^[(a+)+]$',
    '\\(a+\\)+',
    '(\\d{3})+',
  ])('accepts %s', (source) => {
    expect(hasNestedQuantifier(source)).toBe(false)
    expect(allowed(withPattern(source))).toEqual([])
  })

  it.each([
    [
      '^(a|a)+b$',
      'Pattern repeats a group that contains an alternation (e.g. "(a|b)+"), which can take exponential time',
    ],
    [
      '^((a|b)c)*$',
      'Pattern repeats a group that contains an alternation (e.g. "(a|b)+"), which can take exponential time',
    ],
    ['^a*a*a*a*b$', UNBOUNDED],
    ['^\\d*\\d*\\d*\\d*\\d*x$', UNBOUNDED],
    ['^a{2,}b+c*$', UNBOUNDED],
    // The canonical slug is rejected too (3 unbounded): schema patterns are for simple formats.
    [
      '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      'Pattern repeats a group that contains a quantifier (e.g. "(a+)+"), which can take exponential time',
    ],
  ])('rejects the slow pattern %s', (source, message) => {
    expect(allowed(withPattern(source))).toEqual([{ path: 'root.rules[0].value', message }])
  })

  it.each([
    ['UK postcode', '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$'],
    ['phone', '^\\+?[0-9 ()-]{7,20}$'],
    ['slug', '^[a-z0-9-]+$'],
    ['hex colour', '^#(?:[0-9a-fA-F]{3}){1,2}$'],
    ['title', '^(Mr|Mrs|Ms|Dr)?$'],
    ['email-ish', '^[^@\\s]+@[^@\\s]+$'],
  ])('still accepts a common format: %s', (_name, source) => {
    expect(allowed(withPattern(source))).toEqual([])
  })

  it(`rejects a pattern over ${String(MAX_PATTERN_LENGTH)} characters`, () => {
    expect(allowed(withPattern('a'.repeat(MAX_PATTERN_LENGTH + 1)))).toEqual([
      {
        path: 'root.rules[0].value',
        message: `Pattern is longer than ${String(MAX_PATTERN_LENGTH)} characters`,
      },
    ])
  })

  it('5000-deep layout nesting returns issues instead of throwing', () => {
    let node: unknown = { kind: 'text', name: 'a', label: 'A' }
    for (let i = 0; i < 5000; i += 1) node = { layout: 'stack', children: [node] }
    let result: ReturnType<typeof parseFormSchema> | undefined
    expect(() => {
      result = parseFormSchema(wrap(node), registry)
    }).not.toThrow()
    expect(result?.ok).toBe(false)
    const found = result && !result.ok ? result.issues : []
    expect(found).toHaveLength(1)
    expect(found[0]?.message).toBe(
      `Nodes are nested more than ${String(SCHEMA_LIMITS.maxDepth)} levels deep`,
    )
  })

  it('a 20,000-deep `not` chain and a 20,000-deep JSON prop return issues instead of throwing', () => {
    let condition: unknown = { field: 'a', op: 'truthy' }
    for (let i = 0; i < 20_000; i += 1) condition = { not: condition }
    let deep: unknown = 'x'
    for (let i = 0; i < 20_000; i += 1) deep = [deep]
    const json = wrap({
      kind: 'text',
      name: 'a',
      label: 'A',
      when: condition,
      defaultValue: deep,
      placeholder: deep,
    })
    expect(() => parseFormSchema(json, registry)).not.toThrow()
    expect(issues(json).map((issue) => issue.path)).toEqual([
      expect.stringMatching(/^root\.when(\.not)+$/),
      'root.defaultValue',
      'root.placeholder',
    ])
  })

  it(`caps the node count at ${String(SCHEMA_LIMITS.maxNodes)}`, () => {
    const children = Array.from({ length: SCHEMA_LIMITS.maxNodes }, () => ({ content: 'divider' }))
    expect(issues(wrap({ layout: 'stack', children: children.slice(1) }))).toEqual([])
    expect(issues(wrap({ layout: 'stack', children }))).toEqual([
      {
        path: `root.children[${String(SCHEMA_LIMITS.maxNodes - 1)}]`,
        message: `Schema has more than ${String(SCHEMA_LIMITS.maxNodes)} nodes`,
      },
    ])
  })

  it(`a value over ${String(MAX_PATTERN_INPUT)} characters fails the pattern rule like maxLength, without running the regex`, () => {
    // A hand-built schema can still carry a catastrophic pattern; the length cap bounds the input.
    const rule = { rule: 'pattern' as const, value: '^(a+)+$' }
    const { sync } = compileRules([rule], { validators: {}, messages: defaultMessages, empty: '' })
    const started = performance.now()
    expect(sync?.(`${'a'.repeat(MAX_PATTERN_INPUT)}!`, {})).toEqual({
      message: `Enter ${String(MAX_PATTERN_INPUT)} characters or fewer`,
      code: 'maxLength',
      params: { value: MAX_PATTERN_INPUT },
    })
    expect(performance.now() - started).toBeLessThan(100)
    // At the cap the pattern still runs (a safe pattern here).
    const ok = compileRules([{ rule: 'pattern', value: '^a+$' }], {
      validators: {},
      messages: defaultMessages,
      empty: '',
    })
    expect(ok.sync?.('a'.repeat(MAX_PATTERN_INPUT), {})).toBeUndefined()
  })

  it('toStandardSchema applies the same cap on the server', async () => {
    const schema: UntypedFormSchema = {
      version: 1,
      root: { kind: 'text', name: 'a', rules: [{ rule: 'pattern', value: '^a+$' }] },
    }
    const result = await toStandardSchema(schema)['~standard'].validate({
      a: 'a'.repeat(MAX_PATTERN_INPUT + 1),
    })
    expect(result.issues?.map((issue) => issue.message)).toEqual([
      `Enter ${String(MAX_PATTERN_INPUT)} characters or fewer`,
    ])
  })
})
