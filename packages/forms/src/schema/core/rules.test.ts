import { describe, expect, it, vi } from 'vitest'
import { defaultMessages, mergeMessages } from '#core/runtime/messages'
import { defineValidator } from '#schema/core/registry'
import { compileRules, todayIso, withRequired } from '#schema/core/rules'
import type { NamedValidator, UntypedRule } from '#schema/core/types'

const base = {
  validators: {} as Record<string, NamedValidator>,
  messages: defaultMessages,
  empty: '' as unknown,
}

function first(rules: readonly UntypedRule[], value: unknown, ctx: Partial<typeof base> = {}) {
  return compileRules(rules, { ...base, ...ctx }).sync?.(value, {})
}
const message = (rules: readonly UntypedRule[], value: unknown, ctx: Partial<typeof base> = {}) =>
  first(rules, value, ctx)?.message

describe('compileRules — built-in rules', () => {
  // [rule, failing value, passing value, expected default message]
  const table: [UntypedRule, unknown, unknown, string][] = [
    [{ rule: 'required' }, '', 'x', 'Enter a value'],
    [{ rule: 'minLength', value: 3 }, 'ab', 'abc', 'Enter at least 3 characters'],
    [{ rule: 'maxLength', value: 3 }, 'abcd', 'abc', 'Enter 3 characters or fewer'],
    [
      { rule: 'pattern', value: '^GB\\d{3}$' },
      'GB12',
      'GB123',
      'Enter a value in the right format',
    ],
    [{ rule: 'email' }, 'ada@', 'ada@example.com', 'Enter an email address, like name@example.com'],
    [
      { rule: 'url' },
      'example.com',
      'https://example.com',
      'Enter a web address, like https://example.com',
    ],
    [{ rule: 'min', value: 16 }, 15, 16, 'Enter 16 or more'],
    [{ rule: 'max', value: 10 }, 11, 10, 'Enter 10 or less'],
    [{ rule: 'step', value: 0.5 }, 1.25, 1.5, 'Enter a multiple of 0.5'],
    [{ rule: 'integer' }, 1.5, 2, 'Enter a whole number'],
    [{ rule: 'minItems', value: 2 }, ['a'], ['a', 'b'], 'Choose at least 2'],
    [{ rule: 'maxItems', value: 1 }, ['a', 'b'], ['a'], 'Choose 1 or fewer'],
    [{ rule: 'unique' }, ['a', 'a'], ['a', 'b'], 'Each entry must be different'],
    [
      { rule: 'minDate', value: '2026-06-11' },
      '2026-06-10',
      '2026-06-11',
      'Enter a date on or after 2026-06-11',
    ],
    [
      { rule: 'maxDate', value: '2026-07-19' },
      '2026-07-20',
      '2026-07-19',
      'Enter a date on or before 2026-07-19',
    ],
  ]
  it.each(table)('%j', (rule, bad, good, expected) => {
    const error = first([rule], bad)
    expect(error).toEqual({ message: expected, code: rule.rule, params: { value: rule.value } })
    expect(first([rule], good)).toBeUndefined()
  })

  it('every rule but required skips empty values (count rules still judge [])', () => {
    const countRules = ['minItems', 'maxItems', 'unique']
    for (const [rule] of table.slice(1)) {
      const empties: unknown[] = countRules.includes(rule.rule)
        ? ['', null, undefined]
        : ['', null, undefined, []]
      for (const empty of empties) expect(first([rule], empty)).toBeUndefined()
    }
  })

  it('count rules evaluate an empty array', () => {
    expect(first([{ rule: 'minItems', value: 1, message: 'Choose at least one' }], [])).toEqual({
      message: 'Choose at least one',
      code: 'minItems',
      params: { value: 1 },
    })
    expect(first([{ rule: 'minItems', value: 0 }], [])).toBeUndefined()
    expect(first([{ rule: 'maxItems', value: 0 }], [])).toBeUndefined()
    expect(first([{ rule: 'unique' }], [])).toBeUndefined()
  })

  it('required: empty, whitespace and the kind empty fail', () => {
    for (const value of ['', '   ', null, undefined, []])
      expect(message([{ rule: 'required' }], value)).toBe('Enter a value')
    expect(first([{ rule: 'required' }], false, { empty: false })?.code).toBe('required')
    expect(first([{ rule: 'required' }], true, { empty: false })).toBeUndefined()
    expect(first([{ rule: 'required' }], false)).toBeUndefined()
    expect(first([{ rule: 'required' }], 0)).toBeUndefined()
  })

  it('first failing rule wins, in order', () => {
    const rules: UntypedRule[] = [
      { rule: 'minLength', value: 5 },
      { rule: 'pattern', value: '^\\d+$' },
    ]
    expect(first(rules, 'ab')?.code).toBe('minLength')
    expect(first(rules, 'abcdef')?.code).toBe('pattern')
  })

  it('pattern flags; g/y flags do not make it stateful', () => {
    expect(first([{ rule: 'pattern', value: '^ab$', flags: 'i' }], 'AB')).toBeUndefined()
    const rules: UntypedRule[] = [{ rule: 'pattern', value: 'a', flags: 'g' }]
    const sync = compileRules(rules, base).sync
    expect(sync?.('a', {})).toBeUndefined()
    expect(sync?.('a', {})).toBeUndefined()
  })

  it('unique by key path', () => {
    const rule: UntypedRule = { rule: 'unique', by: 'email' }
    expect(first([rule], [{ email: 'a@x.com' }, { email: 'a@x.com' }])?.code).toBe('unique')
    expect(first([rule], [{ email: 'a@x.com' }, { email: 'b@x.com' }])).toBeUndefined()
    expect(first([{ rule: 'unique' }], [{ a: 1 }, { a: 1 }])?.code).toBe('unique')
  })

  it('dates compare on their common prefix and accept "today"', () => {
    expect(first([{ rule: 'maxDate', value: '2026-07-19' }], '2026-07-19T21:00')).toBeUndefined()
    expect(first([{ rule: 'minDate', value: '2026-07-19T10:00' }], '2026-07-19T09:00')?.code).toBe(
      'minDate',
    )
    const today = todayIso()
    expect(first([{ rule: 'minDate', value: 'today' }], today)).toBeUndefined()
    expect(first([{ rule: 'minDate', value: 'today' }], '2000-01-01')?.message).toBe(
      `Enter a date on or after ${today}`,
    )
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('rules on the wrong value type pass (types catch those)', () => {
    expect(first([{ rule: 'min', value: 3 }], 'abc')).toBeUndefined()
    expect(first([{ rule: 'minLength', value: 3 }], 1)).toBeUndefined()
  })

  it('an invalid pattern throws at compile time', () => {
    expect(() => compileRules([{ rule: 'pattern', value: '(' }], base)).toThrow()
  })
})

describe('compileRules — messages', () => {
  it('literal message with {value} interpolation', () => {
    expect(
      message([{ rule: 'min', value: 16, message: 'Players must be {value} or over' }], 12),
    ).toBe('Players must be 16 or over')
  })

  it('$key messages resolve against messages', () => {
    expect(message([{ rule: 'required', message: '$rules.min' }], '')).toBe('Enter {value} or more')
    expect(message([{ rule: 'minLength', value: 4, message: '$rules.minItems' }], 'ab')).toBe(
      'Choose at least 4',
    )
    expect(message([{ rule: 'required', message: '$nope.missing' }], '')).toBe('$nope.missing')
  })

  it('kit / form message overrides are used', () => {
    const messages = mergeMessages({
      rules: { ...defaultMessages.rules, required: 'This is needed', email: 'Check the email' },
    })
    expect(message([{ rule: 'required' }], '', { messages })).toBe('This is needed')
    expect(message([{ rule: 'email' }], 'x', { messages })).toBe('Check the email')
  })
})

describe('compileRules — custom validators', () => {
  const postcode = defineValidator<string>((value, { args }) => {
    const strict = (args as { strict?: boolean } | undefined)?.strict
    if (strict && value !== value.toUpperCase()) return 'Use capital letters'
    return /^[A-Z]{1,2}\d/i.test(value) ? null : 'Enter a full UK postcode'
  })
  const validators = { postcode }

  it('sync validator: message, args, values', () => {
    const seen: unknown[] = []
    const spy = defineValidator((value, ctx) => {
      seen.push(value, ctx.values)
      return undefined
    })
    const rules: UntypedRule[] = [
      { rule: 'custom', validator: 'postcode', args: { strict: true } },
      { rule: 'custom', validator: 'spy' },
    ]
    const { sync, async } = compileRules(rules, { ...base, validators: { postcode, spy } })
    expect(async).toBeUndefined()
    expect(sync?.('ls1 4ap', {})).toEqual({
      message: 'Use capital letters',
      code: 'custom',
      params: { validator: 'postcode' },
    })
    expect(sync?.('LS1 4AP', { all: true })).toBeUndefined()
    expect(seen).toEqual(['LS1 4AP', { all: true }])
  })

  it('rule message overrides the validator message; skips empty values', () => {
    const rules: UntypedRule[] = [
      { rule: 'custom', validator: 'postcode', message: 'Postcode not recognised' },
    ]
    expect(message(rules, '123', { validators })).toBe('Postcode not recognised')
    expect(first(rules, '', { validators })).toBeUndefined()
  })

  it('unknown validator throws at compile time', () => {
    expect(() => compileRules([{ rule: 'custom', validator: 'missing' }], base)).toThrow(
      /Unknown validator "missing"/,
    )
  })

  it('a sync validator returning a promise throws a helpful error', () => {
    const sneaky = defineValidator(() => Promise.resolve('late') as unknown as string)
    const { sync } = compileRules([{ rule: 'custom', validator: 'sneaky' }], {
      ...base,
      validators: { sneaky },
    })
    expect(() => sync?.('x', {})).toThrow(/async: true/)
  })

  it('async validators run in the async channel with values, args and signal', async () => {
    const calls: unknown[] = []
    const unique = defineValidator<string>(
      async (value, ctx) => {
        calls.push([value, ctx.values, ctx.args, ctx.signal instanceof AbortSignal])
        await Promise.resolve()
        return value === 'taken@example.com' ? 'That email is already entered' : null
      },
      { async: true },
    )
    const compiled = compileRules(
      [{ rule: 'required' }, { rule: 'custom', validator: 'unique', args: ['x'] }],
      { ...base, validators: { unique } },
    )
    expect(compiled.sync?.('taken@example.com', {})).toBeUndefined()
    const signal = new AbortController().signal
    await expect(compiled.async?.('taken@example.com', { v: 1 }, signal)).resolves.toEqual({
      message: 'That email is already entered',
      code: 'custom',
      params: { validator: 'unique' },
    })
    await expect(compiled.async?.('free@example.com', {}, signal)).resolves.toBeUndefined()
    await expect(compiled.async?.('', {}, signal)).resolves.toBeUndefined()
    expect(calls[0]).toEqual(['taken@example.com', { v: 1 }, ['x'], true])
    expect(calls).toHaveLength(2)
  })

  it('async: abort resolves undefined and stops later validators', async () => {
    const controller = new AbortController()
    const second = vi.fn(() => 'never shown')
    const slow = defineValidator(
      (_value, { signal }) =>
        new Promise<string>((resolve) => {
          signal?.addEventListener('abort', () => {
            resolve('too late')
          })
        }),
      { async: true },
    )
    const compiled = compileRules(
      [
        { rule: 'custom', validator: 'slow' },
        { rule: 'custom', validator: 'second' },
      ],
      { ...base, validators: { slow, second: defineValidator(second, { async: true }) } },
    )
    const pending = compiled.async?.('x', {}, controller.signal)
    controller.abort()
    await expect(pending).resolves.toBeUndefined()
    expect(second).not.toHaveBeenCalled()
    await expect(compiled.async?.('x', {}, controller.signal)).resolves.toBeUndefined()
  })
})

describe('compileRules — shape', () => {
  it('no rules → no validators', () => {
    expect(compileRules([], base)).toEqual({})
  })
})

describe('withRequired', () => {
  it('prepends required once', () => {
    const rules: UntypedRule[] = [{ rule: 'email' }]
    expect(withRequired(rules, true)).toEqual([{ rule: 'required' }, { rule: 'email' }])
    expect(withRequired(rules, false)).toBe(rules)
    const already: UntypedRule[] = [{ rule: 'required', message: 'x' }]
    expect(withRequired(already, true)).toBe(already)
    expect(withRequired(undefined, true)).toEqual([{ rule: 'required' }])
  })
})
