/**
 * ErrorSummary link text for every field kind.
 *
 * `ErrorSummary` names each invalid field with `registration.getLabel()`, which reads the visible
 * label from the DOM. Group fields render a ui `Fieldset`, so their name is its legend rather than
 * a `label[for]` or `#${id}-label`; without that lookup the summary would fall back to the field's
 * *path* ("reason: Choose one") instead of its label.
 */
import { screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { ErrorSummary } from '#components/form/ErrorSummary'
import { SubmitButton } from '#components/form/SubmitButton'
import { FormSection } from '#components/layouts/FormSection'
import { renderForm } from '#test/renderForm'
import { must } from '#test/must'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
]
const invalid = () => 'Fix this'

type F = Parameters<Parameters<typeof renderForm<Record<string, unknown>>>[0]>[0]
type Build = (f: F) => ReactNode
const v = { onSubmit: invalid } as never
const n = 'pick' as never

/** kind → [default value, field element]. Every field is labelled "Pick one". */
const cases: Record<string, [unknown, Build]> = {
  text: ['', (f) => <f.TextField name={n} label="Pick one" validators={v} />],
  textarea: ['', (f) => <f.TextareaField name={n} label="Pick one" validators={v} />],
  number: [null, (f) => <f.NumberField name={n} label="Pick one" validators={v} />],
  amount: [null, (f) => <f.AmountField name={n} label="Pick one" currency="GBP" validators={v} />],
  password: [
    '',
    (f) => <f.PasswordField name={n} label="Pick one" autoComplete="new-password" validators={v} />,
  ],
  select: [
    null,
    (f) => <f.SelectField name={n} label="Pick one" options={options as never} validators={v} />,
  ],
  checkbox: [false, (f) => <f.CheckboxField name={n} label="Pick one" validators={v} />],
  switch: [false, (f) => <f.SwitchField name={n} label="Pick one" validators={v} />],
  date: ['', (f) => <f.DateField name={n} label="Pick one" validators={v} />],
  color: ['', (f) => <f.ColorField name={n} label="Pick one" validators={v} />],
  oneTimeCode: ['', (f) => <f.OneTimeCodeField name={n} label="Pick one" validators={v} />],
  combobox: [
    null,
    (f) => <f.ComboboxField name={n} label="Pick one" options={options as never} validators={v} />,
  ],
  multiSelect: [
    [],
    (f) => (
      <f.MultiSelectField name={n} label="Pick one" options={options as never} validators={v} />
    ),
  ],
  tags: [[], (f) => <f.TagsField name={n} label="Pick one" validators={v} />],
  file: [[], (f) => <f.FileField name={n} label="Pick one" validators={v} />],
  slider: [0, (f) => <f.SliderField name={n} label="Pick one" validators={v} />],
  radio: [
    null,
    (f) => <f.RadioField name={n} label="Pick one" options={options as never} validators={v} />,
  ],
  segmented: [
    null,
    (f) => <f.SegmentedField name={n} label="Pick one" options={options as never} validators={v} />,
  ],
  choiceCards: [
    null,
    (f) => (
      <f.ChoiceCardsField name={n} label="Pick one" options={options as never} validators={v} />
    ),
  ],
  multiChoiceCards: [
    [],
    (f) => (
      <f.MultiChoiceCardsField
        name={n}
        label="Pick one"
        options={options as never}
        validators={v}
      />
    ),
  ],
  checkboxGroup: [
    [],
    (f) => (
      <f.CheckboxGroupField name={n} label="Pick one" options={options as never} validators={v} />
    ),
  ],
  chips: [
    [],
    (f) => <f.ChipsField name={n} label="Pick one" options={options as never} validators={v} />,
  ],
  rating: [null, (f) => <f.RatingField name={n} label="Pick one" validators={v} />],
  range: [[0, 100], (f) => <f.RangeField name={n} label="Pick one" validators={v} />],
  dateRange: [
    { start: '', end: '' },
    (f) => <f.DateRangeField name={n} label="Pick one" validators={v} />,
  ],
}

async function summaryText(kind: string): Promise<string> {
  const [value, build] = cases[kind] ?? [null, () => null]
  const { user, unmount } = renderForm<Record<string, unknown>>(
    (f) => (
      <>
        <ErrorSummary />
        {build(f)}
        <SubmitButton>Save</SubmitButton>
      </>
    ),
    { defaultValues: { pick: value } },
  )
  await user.click(screen.getByRole('button', { name: 'Save' }))
  const alert = await screen.findByRole('alert', {}, { timeout: 2000 }).catch(() => null)
  const summary =
    alert ??
    (await waitFor(() =>
      must(screen.getByText('There is a problem').closest<HTMLElement>('[tabindex="-1"]')),
    ))
  const text = within(summary)
    .getAllByRole('listitem')
    .map((li) => li.textContent)
    .join(' | ')
  unmount()
  return text
}

// Radio, choiceCards, multiChoiceCards, checkboxGroup, chips (fieldset legend) and dateRange (its
// group legend, not the inner "Start date") are named by their legend, never by their path.
describe('ErrorSummary names every field kind by its label', () => {
  for (const kind of Object.keys(cases)) {
    it(`${kind}: summary says "Pick one: Fix this"`, async () => {
      const text = await summaryText(kind)
      expect(text).toBe('Pick one: Fix this')
    })
  }

  it('inside a FormSection fieldset, each field reads its own label/legend, not the section legend', async () => {
    const { user } = renderForm<Record<string, unknown>>(
      (f) => (
        <>
          <ErrorSummary />
          <FormSection as="fieldset" title="Your details">
            <f.TextField name={'name' as never} label="Full name" validators={v} />
            <f.RadioField
              name={'pick' as never}
              label="Pick one"
              options={options as never}
              validators={v}
            />
          </FormSection>
          <SubmitButton>Save</SubmitButton>
        </>
      ),
      { defaultValues: { name: '', pick: null } },
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    const heading = await screen.findByText('There is a problem')
    const summary = must(heading.closest<HTMLElement>('[tabindex="-1"]'))
    const items = within(summary)
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(items).toEqual(['Full name: Fix this', 'Pick one: Fix this'])
  })
})
