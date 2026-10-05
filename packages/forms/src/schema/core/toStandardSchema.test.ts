import { describe, expect, it } from 'vitest'
import type { StandardSchemaV1 } from '@tanstack/react-form'
import { defaultMessages } from '#runtime/messages'
import { defineValidator } from '#schema/core/registry'
import { toStandardSchema } from '#schema/core/toStandardSchema'
import type { UntypedFormSchema } from '#schema/core/types'
import {
  emptyProjectSignup,
  projectSignupSchema,
  type ProjectSignup,
} from '#schema/core/__fixtures__/schemas'
import { testValidators } from '#schema/core/__fixtures__/registry'

type Result =
  | { value: unknown; issues?: undefined }
  | { issues: readonly { message: string; path?: readonly unknown[] }[] }

async function run(schema: StandardSchemaV1<unknown, unknown>, value: unknown): Promise<Result> {
  return await schema['~standard'].validate(value)
}
function issuesOf(result: Result) {
  return result.issues?.map((issue) => [issue.path?.join('.'), issue.message]) ?? []
}

const schema: UntypedFormSchema = {
  version: 1,
  root: {
    layout: 'stack',
    children: [
      {
        kind: 'text',
        name: 'name',
        label: 'Name',
        rules: [{ rule: 'required', message: 'Enter your name' }],
      },
      { kind: 'number', name: 'age', label: 'Age', rules: [{ rule: 'min', value: 16 }] },
      {
        layout: 'section',
        title: 'Company',
        when: { field: 'type', op: 'eq', value: 'business' },
        children: [
          { kind: 'text', name: 'company', label: 'Company', rules: [{ rule: 'required' }] },
        ],
      },
      {
        kind: 'text',
        name: 'vat',
        label: 'VAT',
        rules: [{ rule: 'required' }],
        excludeWhen: { field: 'type', op: 'neq', value: 'business' },
      },
      {
        kind: 'text',
        name: 'locked',
        label: 'Locked',
        rules: [{ rule: 'required' }],
        disabledWhen: { context: 'mode', op: 'eq', value: 'edit' },
      },
      {
        kind: 'text',
        name: 'ref',
        label: 'Ref',
        rules: [{ rule: 'required' }],
        readOnlyWhen: { field: 'type', op: 'eq', value: 'personal' },
      },
      {
        kind: 'text',
        name: 'phone',
        label: 'Phone',
        requiredWhen: { field: 'type', op: 'eq', value: 'business' },
      },
      { kind: 'checkbox', name: 'agree', label: 'I agree', required: true },
      { kind: 'text', name: 'nickname', label: 'Nickname', warnRules: [{ rule: 'required' }] },
      {
        layout: 'repeater',
        name: 'guests',
        label: 'Guests',
        newItem: { name: '' },
        rules: [{ rule: 'maxItems', value: 2 }],
        item: [
          {
            kind: 'text',
            name: 'name',
            label: 'Name',
            rules: [{ rule: 'required', message: 'Enter the guest’s name' }],
          },
          {
            kind: 'number',
            name: 'age',
            label: 'Age',
            rules: [{ rule: 'min', value: 0 }],
            when: { field: 'type', op: 'eq', value: 'business' },
          },
        ],
      },
    ],
  },
}

const valid = {
  name: 'Ada',
  age: 30,
  type: 'personal',
  locked: 'x',
  ref: '',
  agree: true,
  nickname: '',
  guests: [{ name: 'Grace', age: -1 }],
}
/** `valid` as the output carries it: only active fields (`type` is no field; `ref` is read-only; guest `age` is hidden). */
const validOutput = {
  name: 'Ada',
  age: 30,
  locked: 'x',
  agree: true,
  nickname: '',
  guests: [{ name: 'Grace' }],
}

describe('toStandardSchema', () => {
  it('is a Standard Schema v1 (sync when no async validators)', () => {
    const standard = toStandardSchema(schema)
    expect(standard['~standard'].version).toBe(1)
    expect(standard['~standard'].vendor).toBe('@mitcsutt/kiln-forms')
    const result = standard['~standard'].validate(valid)
    expect(result).not.toBeInstanceOf(Promise)
    expect(result).toEqual({ value: validOutput })
  })

  it('reports issues with array paths', async () => {
    const result = await run(toStandardSchema(schema), {
      ...valid,
      name: '',
      age: 12,
      agree: false,
      guests: [{ name: '' }, { name: 'x' }, { name: 'y' }],
    })
    expect(issuesOf(result)).toEqual([
      ['name', 'Enter your name'],
      ['age', 'Enter 16 or more'],
      ['agree', 'Enter a value'],
      ['guests', 'Choose 2 or fewer'],
      ['guests.0.name', 'Enter the guest’s name'],
    ])
    expect(result.issues?.[4]?.path).toEqual(['guests', 0, 'name'])
  })

  it('validates visible, active fields only', async () => {
    const business = { ...valid, type: 'business', ref: '' }
    expect(issuesOf(await run(toStandardSchema(schema), business))).toEqual([
      ['company', 'Enter a value'],
      ['vat', 'Enter a value'],
      ['ref', 'Enter a value'],
      ['phone', 'Enter a value'],
      ['guests.0.age', 'Enter 0 or more'],
    ])
    // disabledWhen via context
    const editing = toStandardSchema(schema, { context: { mode: 'edit' } })
    expect(issuesOf(await run(editing, { ...valid, locked: '' }))).toEqual([])
    expect(issuesOf(await run(toStandardSchema(schema), { ...valid, locked: '' }))).toEqual([
      ['locked', 'Enter a value'],
    ])
  })

  it('uses messages overrides and custom empties', async () => {
    const standard = toStandardSchema(schema, {
      messages: { rules: { ...defaultMessages.rules, required: 'Needed' } },
      empties: {},
    })
    expect(issuesOf(await run(standard, { ...valid, name: '', agree: false }))).toEqual([
      ['name', 'Enter your name'],
    ])
    const strict = toStandardSchema(schema, {
      messages: { rules: { ...defaultMessages.rules, required: 'Needed' } },
    })
    expect(issuesOf(await run(strict, { ...valid, agree: false }))).toEqual([['agree', 'Needed']])
  })

  it('runs async custom validators and returns a promise', async () => {
    const s: UntypedFormSchema = {
      version: 1,
      root: {
        kind: 'text',
        name: 'email',
        rules: [{ rule: 'email' }, { rule: 'custom', validator: 'uniqueEmail' }],
      },
    }
    const standard = toStandardSchema(s, { validators: testValidators })
    const pending = standard['~standard'].validate({ email: 'taken@example.com' })
    expect(pending).toBeInstanceOf(Promise)
    expect(issuesOf(await run(standard, { email: 'taken@example.com' }))).toEqual([
      ['email', 'That email is already entered'],
    ])
    expect(await run(standard, { email: 'new@example.com' })).toEqual({
      value: { email: 'new@example.com' },
    })
    // a sync failure skips the async check
    expect(issuesOf(await run(standard, { email: 'nope' }))).toEqual([
      ['email', 'Enter an email address, like name@example.com'],
    ])
  })

  it('sync custom validators and args', async () => {
    const even = defineValidator<number>((value, { args }) =>
      value % Number(args) === 0 ? null : 'Must divide by {validator}',
    )
    const s: UntypedFormSchema = {
      version: 1,
      root: { kind: 'number', name: 'n', rules: [{ rule: 'custom', validator: 'even', args: 2 }] },
    }
    expect(issuesOf(await run(toStandardSchema(s, { validators: { even } }), { n: 3 }))).toEqual([
      ['n', 'Must divide by even'],
    ])
  })

  it('applies the project sign-up fixture end to end', async () => {
    const standard = toStandardSchema(projectSignupSchema, {
      validators: testValidators,
      context: { mode: 'create', role: 'owner' },
    })
    const entry: ProjectSignup = {
      ...emptyProjectSignup,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      project: 'atlas',
      fee: 45,
      paid: true,
      address: { line1: '1 Main St', city: 'Leeds', postcode: 'LS1 4AP' },
    }
    expect(await run(standard, entry)).toEqual({ value: entry })
    const bad = await run(standard, {
      ...entry,
      name: '',
      email: 'taken@example.com',
      age: 12,
      address: { ...entry.address, postcode: 'nope' },
    })
    expect(issuesOf(bad)).toEqual([
      ['name', 'Enter your name'],
      ['age', 'You must be 16 or over'],
      ['address.postcode', 'Enter a full UK postcode, like SW1A 1AA'],
      ['email', 'That email is already entered'],
    ])
    // readOnlyWhen (context mode=edit) skips email entirely
    const editing = toStandardSchema(projectSignupSchema, {
      validators: testValidators,
      context: { mode: 'edit', role: 'member' },
    })
    expect(issuesOf(await run(editing, { ...entry, email: 'taken@example.com' }))).toEqual([])
  })

  it('validates a field node carrying a layout prop', async () => {
    const s: UntypedFormSchema = {
      version: 1,
      root: {
        layout: 'rows',
        children: [
          { kind: 'text', name: 'name', layout: 'horizontal', rules: [{ rule: 'required' }] },
        ],
      },
    }
    expect(issuesOf(await run(toStandardSchema(s), { name: '' }))).toEqual([
      ['name', 'Enter a value'],
    ])
  })

  it('minItems fails on an empty array (onboarding fixture)', async () => {
    const s: UntypedFormSchema = {
      version: 1,
      root: {
        kind: 'checkboxGroup',
        name: 'interests',
        rules: [{ rule: 'minItems', value: 1, message: 'Choose at least one' }],
      },
    }
    expect(issuesOf(await run(toStandardSchema(s), { interests: [] }))).toEqual([
      ['interests', 'Choose at least one'],
    ])
  })

  describe('client and server agree on the active field set', () => {
    it('a static `excluded` / `disabled` field is neither validated nor in the output', async () => {
      const s: UntypedFormSchema = {
        version: 1,
        root: {
          layout: 'stack',
          children: [
            { kind: 'text', name: 'name', rules: [{ rule: 'required' }] },
            { kind: 'text', name: 'nick', excluded: true, rules: [{ rule: 'required' }] },
            { kind: 'text', name: 'code', disabled: true, rules: [{ rule: 'required' }] },
          ],
        },
      }
      expect(await run(toStandardSchema(s), { name: 'Ada', nick: '', code: '' })).toEqual({
        value: { name: 'Ada' },
      })
    })

    it('a static `readOnly` field and a `compute` field are neither validated nor in the output', async () => {
      const s: UntypedFormSchema = {
        version: 1,
        root: {
          layout: 'stack',
          children: [
            { kind: 'text', name: 'name' },
            { kind: 'number', name: 'fee', readOnly: true, rules: [{ rule: 'max', value: 10 }] },
            {
              kind: 'number',
              name: 'total',
              compute: { computer: 'sum', from: ['fee'] },
              rules: [{ rule: 'max', value: 100 }],
            },
          ],
        },
      }
      expect(await run(toStandardSchema(s), { name: 'Ada', fee: 11, total: 101 })).toEqual({
        value: { name: 'Ada' },
      })
    })

    const priced = (flag: 'readOnlyWhen' | 'disabledWhen'): UntypedFormSchema => ({
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'checkbox', name: 'locked', label: 'Locked' },
          {
            kind: 'number',
            name: 'price',
            label: 'Price',
            rules: [{ rule: 'max', value: 100 }],
            [flag]: { field: 'locked', op: 'truthy' },
          },
        ],
      },
    })

    it.each(['readOnlyWhen', 'disabledWhen'] as const)(
      'flipping `%s` in the input drops the value: `price: 999999` never reaches the output',
      async (flag) => {
        expect(await run(toStandardSchema(priced(flag)), { locked: true, price: 999999 })).toEqual({
          value: { locked: true },
        })
        expect(
          issuesOf(await run(toStandardSchema(priced(flag)), { locked: false, price: 999999 })),
        ).toEqual([['price', 'Enter 100 or less']])
        expect(await run(toStandardSchema(priced(flag)), { locked: false, price: 50 })).toEqual({
          value: { locked: false, price: 50 },
        })
      },
    )

    it('a legitimately read-only, required, empty field passes on the server (as on the client)', async () => {
      const s: UntypedFormSchema = {
        version: 1,
        root: {
          layout: 'stack',
          children: [
            { kind: 'select', name: 'mode', options: [{ value: 'edit', label: 'Edit' }] },
            {
              kind: 'text',
              name: 'ref',
              required: true,
              readOnlyWhen: { field: 'mode', op: 'eq', value: 'edit' },
            },
          ],
        },
      }
      expect(await run(toStandardSchema(s), { mode: 'edit', ref: '' })).toEqual({
        value: { mode: 'edit' },
      })
      expect(issuesOf(await run(toStandardSchema(s), { mode: 'create', ref: '' }))).toEqual([
        ['ref', 'Enter a value'],
      ])
    })

    it.each(['readOnly', 'disabled'] as const)(
      'a field inside a `section` with `%s: true` is neither validated nor in the output',
      async (flag) => {
        const s: UntypedFormSchema = {
          version: 1,
          root: {
            layout: 'stack',
            children: [
              { kind: 'text', name: 'name', rules: [{ rule: 'required' }] },
              {
                layout: 'section',
                title: 'Account',
                [flag]: true,
                children: [
                  { kind: 'text', name: 'ref', required: true },
                  {
                    layout: 'stack',
                    children: [
                      { kind: 'number', name: 'limit', rules: [{ rule: 'max', value: 10 }] },
                    ],
                  },
                  {
                    layout: 'repeater',
                    name: 'tags',
                    label: 'Tags',
                    newItem: { tag: '' },
                    rules: [{ rule: 'minItems', value: 1 }],
                    item: [{ kind: 'text', name: 'tag', required: true }],
                  },
                ],
              },
            ],
          },
        }
        expect(
          await run(toStandardSchema(s), { name: 'Ada', ref: '', limit: 999, tags: [] }),
        ).toEqual({ value: { name: 'Ada' } })
        // Without the flag the same section's fields are validated.
        const open = JSON.parse(
          JSON.stringify(s).replace(`"${flag}":true,`, ''),
        ) as UntypedFormSchema
        expect(
          issuesOf(
            await run(toStandardSchema(open), { name: 'Ada', ref: '', limit: 999, tags: [] }),
          ),
        ).toEqual([
          ['ref', 'Enter a value'],
          ['limit', 'Enter 10 or less'],
          ['tags', 'Choose at least 1'],
        ])
      },
    )

    it('a `review` copy of a field adds no rule and no output', async () => {
      const s: UntypedFormSchema = {
        version: 1,
        root: {
          layout: 'stack',
          children: [
            {
              layout: 'section',
              title: 'Locked',
              readOnly: true,
              children: [{ kind: 'text', name: 'a', required: true }],
            },
            { layout: 'review', children: [{ kind: 'text', name: 'a', required: true }] },
          ],
        },
      }
      expect(await run(toStandardSchema(s), { a: '' })).toEqual({ value: {} })
      expect(await run(toStandardSchema(s), { a: 'evil' })).toEqual({ value: {} })
    })

    it('a section’s `excluded` is not inherited: FormSection has no such prop, so the client keeps the field', async () => {
      const s: UntypedFormSchema = {
        version: 1,
        root: {
          layout: 'section',
          title: 'S',
          excluded: true,
          children: [{ kind: 'text', name: 'a', required: true }],
        },
      }
      expect(issuesOf(await run(toStandardSchema(s), { a: '' }))).toEqual([['a', 'Enter a value']])
      expect(await run(toStandardSchema(s), { a: 'x' })).toEqual({ value: { a: 'x' } })
    })

    it('drops unknown keys and hidden fields (no pass-through), keeping one object per repeater item', async () => {
      const result = await run(toStandardSchema(schema), {
        ...valid,
        injected: '<script>',
        guests: [{ name: 'Grace', age: -1, admin: true }],
      })
      expect(result).toEqual({ value: validOutput })
    })
  })

  it('checks a field rendered twice once', async () => {
    const s: UntypedFormSchema = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          { kind: 'text', name: 'name', rules: [{ rule: 'required' }] },
          {
            layout: 'review',
            children: [{ kind: 'text', name: 'name', rules: [{ rule: 'required' }] }],
          },
        ],
      },
    }
    expect(issuesOf(await run(toStandardSchema(s), { name: '' }))).toEqual([
      ['name', 'Enter a value'],
    ])
  })
})
