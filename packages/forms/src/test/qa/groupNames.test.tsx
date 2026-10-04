/**
 * A Fieldset-based group field names itself on one grouping element only.
 *
 * Group fields render `<fieldset><legend>Days</legend>`. If the inner `role="group"` /
 * `"radiogroup"` were labelled by the same legend, a screen reader entering the control would hear
 * the name twice ("Days, group, Days, group"). Radio, choiceCards (radiogroup), checkboxGroup,
 * chips and multiChoiceCards (group) keep the fieldset/legend (§11.1) and leave the inner group
 * unnamed: a radiogroup inside a named fieldset needs no name of its own. Segmented, rating, range
 * and dateRange name one element only.
 */
import { screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { renderForm } from '#test/renderForm'

const o = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
]
type F = Parameters<Parameters<typeof renderForm<Record<string, unknown>>>[0]>[0]
const n = 'pick' as never
const cases: Record<string, [unknown, (f: F) => ReactNode, boolean]> = {
  radio: [null, (f) => <f.RadioField name={n} label="Pick one" options={o as never} />, true],
  choiceCards: [
    null,
    (f) => <f.ChoiceCardsField name={n} label="Pick one" options={o as never} />,
    true,
  ],
  checkboxGroup: [
    [],
    (f) => <f.CheckboxGroupField name={n} label="Pick one" options={o as never} />,
    true,
  ],
  chips: [[], (f) => <f.ChipsField name={n} label="Pick one" options={o as never} />, true],
  multiChoiceCards: [
    [],
    (f) => <f.MultiChoiceCardsField name={n} label="Pick one" options={o as never} />,
    true,
  ],
  segmented: [
    null,
    (f) => <f.SegmentedField name={n} label="Pick one" options={o as never} />,
    false,
  ],
  rating: [null, (f) => <f.RatingField name={n} label="Pick one" />, false],
  dateRange: [{ start: '', end: '' }, (f) => <f.DateRangeField name={n} label="Pick one" />, false],
}

describe('a group field exposes its name on one grouping element', () => {
  for (const [kind, [value, build, doubled]] of Object.entries(cases)) {
    it(`${kind}${doubled ? ' (legend names the fieldset, inner group unnamed)' : ''}`, () => {
      renderForm<Record<string, unknown>>((f) => build(f), { defaultValues: { pick: value } })
      const named = [
        ...screen.queryAllByRole('group', { name: 'Pick one' }),
        ...screen.queryAllByRole('radiogroup', { name: 'Pick one' }),
      ]
      expect(named).toHaveLength(1)
    })
  }
})
