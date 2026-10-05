/**
 * §12 perf acceptance test.
 *
 * A 60-field form: 30 root fields of mixed kinds split over two tabs, a table-free Repeater of
 * 10 rows × 2 fields (20), and 5 `When`s × 2 fields (10). Every field sits in its own
 * `<RenderCounter>` (React `<Profiler>`), as do ErrorSummary and SubmitButton.
 *
 * §12: "typing 10 characters into one text field re-renders exactly that field component 10
 * times and nothing else; submit re-renders only fields whose error visibility changed +
 * summary + submit button."
 *
 * Profiler note: a Profiler fires when anything in its subtree commits, so container layouts
 * (FormTabs, Repeater, When) can't be counted directly. Instead every field below a container is
 * counted, and a container that re-renders its children shows up as those fields re-rendering
 * (Repeater re-runs its render prop; tabs/When pass the same elements, so React bails out).
 */
import { memo, type ReactNode } from 'react'
import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { SubmitButton } from '#components/form/SubmitButton'
import { FormTabs } from '#components/layouts/FormTabs'
import { Repeater } from '#components/layouts/Repeater'
import { When } from '#components/layouts/When'
import { countRenders, RenderCounter, resetRenderCounts } from '#test/perf'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

interface Row {
  label: string
  note: string
}
type Values = Record<string, string | number | boolean | null | Row[]> & {
  show: boolean
  rows: Row[]
}

const KINDS = ['text', 'textarea', 'number', 'checkbox', 'switch', 'select', 'radio'] as const
type Kind = (typeof KINDS)[number]
const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
]

/** 30 root fields: r0…r29, kinds rotating; r0 is the `show` checkbox's neighbour. */
const ROOT = Array.from({ length: 30 }, (_, i) => ({
  name: `r${String(i)}`,
  kind: must(KINDS[i % KINDS.length]),
}))
const WHEN = Array.from({ length: 10 }, (_, i) => `w${String(i)}`)
const ROWS = 10
/** Fields with a required validator (and empty defaults): one per container type. */
const REQUIRED = new Set(['r0', 'r21', 'w0', 'rows[3].label'])

const emptyOf = (kind: Kind) =>
  kind === 'number'
    ? null
    : kind === 'checkbox' || kind === 'switch'
      ? false
      : kind === 'select' || kind === 'radio'
        ? 'a'
        : ''
const required = ({ value }: { value: unknown }) =>
  value === '' || value === null ? 'Enter a value' : undefined

function defaults(): Values {
  const values: Record<string, unknown> = {
    show: true,
    rows: Array.from({ length: ROWS }, (_, i) => ({
      label: i === 3 ? '' : `Row ${String(i + 1)}`,
      note: '',
    })),
  }
  for (const { name, kind } of ROOT)
    values[name] = REQUIRED.has(name)
      ? emptyOf(kind)
      : kind === 'text' || kind === 'textarea'
        ? 'filled'
        : emptyOf(kind)
  for (const name of WHEN) values[name] = REQUIRED.has(name) ? '' : 'filled'
  return values as Values
}

// The fields bind through `never` names: the record type has no literal paths to check against.
type F = Parameters<Parameters<typeof renderForm<Values>>[0]>[0]

function RootField({ form, name, kind }: { form: F; name: string; kind: Kind }) {
  const validators = REQUIRED.has(name) ? { onDynamic: required } : undefined
  const label = `Root ${name}`
  const n = name as never
  let field: ReactNode
  switch (kind) {
    case 'text':
      field = <form.TextField name={n} label={label} validators={validators} />
      break
    case 'textarea':
      field = <form.TextareaField name={n} label={label} validators={validators} />
      break
    case 'number':
      field = <form.NumberField name={n} label={label} />
      break
    case 'checkbox':
      field = <form.CheckboxField name={n} label={label} />
      break
    case 'switch':
      field = <form.SwitchField name={n} label={label} />
      break
    case 'select':
      field = <form.SelectField name={n} label={label} options={options as never} />
      break
    case 'radio':
      field = <form.RadioField name={n} label={label} options={options as never} />
      break
  }
  return <RenderCounter id={name}>{field}</RenderCounter>
}

const Body = memo(function Body({ form }: { form: F }) {
  return (
    <>
      <RenderCounter id="summary">
        <ErrorSummary />
      </RenderCounter>
      <FormTabs label="Sections" defaultValue="basics">
        <FormTabs.Tab value="basics" label="Basics">
          <RenderCounter id="show">
            <form.CheckboxField name={'show' as never} label="Show extras" />
          </RenderCounter>
          {ROOT.slice(0, 20).map((f) => (
            <RootField key={f.name} form={form} {...f} />
          ))}
        </FormTabs.Tab>
        <FormTabs.Tab value="more" label="More">
          {ROOT.slice(20).map((f) => (
            <RootField key={f.name} form={form} {...f} />
          ))}
        </FormTabs.Tab>
      </FormTabs>
      <Repeater
        form={form}
        name={'rows' as never}
        label="Rows"
        newItem={{ label: '', note: '' } as never}
      >
        {(item) => {
          const fields = item.fields as unknown as F
          const labelName = `rows[${String(item.index)}].label`
          return (
            <>
              <RenderCounter id={labelName}>
                <fields.TextField
                  name={'label' as never}
                  label={`Row label ${String(item.index + 1)}`}
                  validators={REQUIRED.has(labelName) ? { onDynamic: required } : undefined}
                />
              </RenderCounter>
              <RenderCounter id={`rows[${String(item.index)}].note`}>
                <fields.TextField
                  name={'note' as never}
                  label={`Row note ${String(item.index + 1)}`}
                />
              </RenderCounter>
            </>
          )
        }}
      </Repeater>
      {[0, 1, 2, 3, 4].map((k) => (
        <When key={k} form={form} is={(v: Values) => v.show}>
          {WHEN.slice(k * 2, k * 2 + 2).map((name) => (
            <RenderCounter key={name} id={name}>
              <form.TextField
                name={name as never}
                label={`Extra ${name}`}
                validators={(REQUIRED.has(name) ? { onDynamic: required } : undefined) as never}
              />
            </RenderCounter>
          ))}
        </When>
      ))}
      <RenderCounter id="submit">
        <SubmitButton>Save</SubmitButton>
      </RenderCounter>
    </>
  )
})

const ALL_FIELDS = [
  'show',
  ...ROOT.map((f) => f.name),
  ...Array.from({ length: ROWS }, (_, i) => [
    `rows[${String(i)}].label`,
    `rows[${String(i)}].note`,
  ]).flat(),
  ...WHEN,
]

function setup() {
  return renderForm<Values>((f) => <Body form={f} />, { defaultValues: defaults() })
}

function counts(ids: readonly string[]): Record<string, number> {
  return Object.fromEntries(
    ids.map((id): [string, number] => [id, countRenders(id)]).filter(([, n]) => n !== 0),
  )
}

const FIELDS_AND_CHROME = [...ALL_FIELDS, 'summary', 'submit']
/** Counts without SubmitButton (its re-renders are asserted on their own). */
const withoutSubmit = (c: Record<string, number>) =>
  Object.fromEntries(Object.entries(c).filter(([id]) => id !== 'submit'))

async function submit(user: ReturnType<typeof setup>['user']) {
  await user.click(screen.getByRole('button', { name: 'Save' }))
  await act(() => Promise.resolve())
}

describe('perf acceptance (§12): 60-field form', () => {
  it('has 61 counted fields (60 + the When toggle)', () => {
    setup()
    expect(ALL_FIELDS).toHaveLength(61)
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      within(screen.getByRole('group', { name: 'Rows' })).getAllByLabelText(/^Row label/),
    ).toHaveLength(10)
  })

  it('typing 10 characters into a root text field re-renders only that field, 10 times', async () => {
    const { user } = setup()
    resetRenderCounts()
    await user.type(screen.getByLabelText('Root r7'), 'abcdefghij')
    expect(withoutSubmit(counts(FIELDS_AND_CHROME))).toEqual({ r7: 10 })
  })

  it('typing 10 characters into a field inside a When re-renders only that field', async () => {
    const { user } = setup()
    resetRenderCounts()
    await user.type(screen.getByLabelText('Extra w5'), 'abcdefghij')
    expect(withoutSubmit(counts(FIELDS_AND_CHROME))).toEqual({ w5: 10 })
  })

  it('typing 10 characters into a Repeater item field re-renders only that field', async () => {
    const { user } = setup()
    resetRenderCounts()
    await user.type(screen.getByLabelText('Row note 6'), 'abcdefghij')
    expect(withoutSubmit(counts(FIELDS_AND_CHROME))).toEqual({ 'rows[5].note': 10 })
  })

  it('typing into a Repeater item field after a submit still re-renders only that field', async () => {
    const { user } = setup()
    await submit(user)
    resetRenderCounts()
    await user.type(screen.getByLabelText('Row note 2'), 'abc')
    expect(withoutSubmit(counts(FIELDS_AND_CHROME))).toEqual({ 'rows[1].note': 3 })
  })

  // SubmitButton only subscribes to `isDefaultValue` through `requireChanges`, so the first
  // keystroke of a pristine form doesn't re-render it.
  it('typing does not re-render SubmitButton (no requireChanges)', async () => {
    const { user } = setup()
    resetRenderCounts()
    await user.type(screen.getByLabelText('Root r7'), 'abcdefghij')
    expect(countRenders('submit')).toBe(0)
  })

  it('switching tabs re-renders no field', async () => {
    const { user } = setup()
    resetRenderCounts()
    await user.click(screen.getByRole('tab', { name: 'More' }))
    expect(counts(FIELDS_AND_CHROME)).toEqual({})
  })

  it('first submit: invalid fields render at most twice, every other field at most once', async () => {
    const { user } = setup()
    resetRenderCounts()
    await submit(user)
    const after = counts(FIELDS_AND_CHROME)
    const invalid = ['r0', 'r21', 'w0', 'rows[3].label']
    for (const id of invalid) expect(after[id], id).toBeLessThanOrEqual(2)
    for (const id of ALL_FIELDS.filter((n) => !invalid.includes(n)))
      expect(after[id] ?? 0, id).toBeLessThanOrEqual(1)
    expect(after.summary).toBeGreaterThan(0)
    // With an ErrorSummary on the form, focus goes to the summary (§11.5).
    await waitFor(() => {
      expect(document.activeElement?.textContent).toContain('There is a problem')
    })
  })

  it('a second submit re-renders no field — only summary + submit button', async () => {
    const { user } = setup()
    await submit(user)
    resetRenderCounts()
    await submit(user)
    expect(Object.keys(counts(FIELDS_AND_CHROME)).sort()).toEqual(
      ['submit', 'summary'].filter((id) => countRenders(id) > 0).sort(),
    )
    expect(Object.keys(counts(ALL_FIELDS))).toEqual([])
  })

  // Known gap, kept as an expected failure (A.10): §12 says submit re-renders only fields whose
  // error visibility changed, but TanStack's `handleSubmit` marks every untouched field touched
  // and `useField` subscribes to `isTouched`, so all 61 fields (incl. all 20 Repeater item fields)
  // re-render once. Nothing in the binding can avoid it without replacing `useField`.
  it.fails('first submit re-renders only the 4 invalid fields + summary + submit', async () => {
    const { user } = setup()
    resetRenderCounts()
    await submit(user)
    expect(Object.keys(counts(ALL_FIELDS)).sort()).toEqual(
      ['r0', 'r21', 'rows[3].label', 'w0'].sort(),
    )
  })
})
