/**
 * A disabled control submits nothing in native FormData, including our own hidden inputs.
 * Checked across every ui choice / composite control, bare and as a `*Field`. readOnly must
 * still submit (a native readonly input does).
 */
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CheckboxGroup } from '#components/inputs/CheckboxGroup'
import { CheckboxGroupField } from '#components/inputs/CheckboxGroupField'
import { ChipGroupField } from '#components/inputs/ChipGroupField'
import { ChoiceCards } from '#components/inputs/ChoiceCards'
import { ChoiceCardsField } from '#components/inputs/ChoiceCardsField'
import { Combobox } from '#components/inputs/Combobox'
import { ComboboxField } from '#components/inputs/ComboboxField'
import { RadioGroupField } from '#components/inputs/RadioGroupField'
import { RangeSlider } from '#components/inputs/RangeSlider'
import { RangeSliderField } from '#components/inputs/RangeSliderField'
import { Rating } from '#components/inputs/Rating'
import { RatingField } from '#components/inputs/RatingField'
import { SegmentedField } from '#components/inputs/SegmentedField'
import { Slider } from '#components/inputs/Slider'
import { SliderField } from '#components/inputs/SliderField'
import { TagsField } from '#components/inputs/TagsField'
import { TagsInput } from '#components/inputs/TagsInput'
import { must } from '#test/must'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
]

interface State {
  disabled?: boolean
  readOnly?: boolean
}
const cases: Record<string, (s: State) => ReactNode> = {
  CheckboxGroup: (s) => (
    <CheckboxGroup aria-label="Pick" name="pick" options={options} defaultValue={['a']} {...s} />
  ),
  CheckboxGroupField: (s) => (
    <CheckboxGroupField label="Pick" name="pick" options={options} defaultValue={['a']} {...s} />
  ),
  RadioGroupField: (s) => (
    <RadioGroupField label="Pick" name="pick" options={options} defaultValue="a" {...s} />
  ),
  ChoiceCards: (s) => (
    <ChoiceCards
      type="single"
      aria-label="Pick"
      name="pick"
      options={options}
      defaultValue="a"
      {...s}
    />
  ),
  ChoiceCardsField: (s) => (
    <ChoiceCardsField
      type="single"
      label="Pick"
      name="pick"
      options={options}
      defaultValue="a"
      {...s}
    />
  ),
  ChipGroupField: (s) => (
    <ChipGroupField
      type="multiple"
      label="Pick"
      name="pick"
      options={options}
      defaultValue={['a']}
      {...s}
    />
  ),
  SegmentedField: (s) => (
    <SegmentedField label="Pick" name="pick" options={options} defaultValue="a" {...s} />
  ),
  Slider: (s) => <Slider aria-label="Pick" name="pick" defaultValue={4} {...s} />,
  SliderField: (s) => <SliderField label="Pick" name="pick" defaultValue={4} {...s} />,
  RangeSlider: (s) => <RangeSlider aria-label="Pick" name="pick" defaultValue={[2, 8]} {...s} />,
  RangeSliderField: (s) => (
    <RangeSliderField label="Pick" name="pick" defaultValue={[2, 8]} {...s} />
  ),
  Rating: (s) => <Rating aria-label="Pick" name="pick" defaultValue={3} {...s} />,
  RatingField: (s) => <RatingField label="Pick" name="pick" defaultValue={3} {...s} />,
  Combobox: (s) => (
    <Combobox aria-label="Pick" name="pick" options={options} defaultValue="a" {...s} />
  ),
  ComboboxField: (s) => (
    <ComboboxField label="Pick" name="pick" options={options} defaultValue="a" {...s} />
  ),
  TagsInput: (s) => <TagsInput aria-label="Pick" name="pick" defaultValue={['a']} {...s} />,
  TagsField: (s) => <TagsField label="Pick" name="pick" defaultValue={['a']} {...s} />,
}

function submitted(node: ReactNode): string[] {
  const { container, unmount } = render(<form>{node}</form>)
  const form = must(container.querySelector('form'))
  const values = new FormData(form).getAll('pick').map(String)
  unmount()
  return values
}

/**
 * The bare controls once rendered `<input type="hidden">` without `disabled`,
 * so a disabled control still posted its value. Every emitted hidden input now carries the
 * control's `disabled`; the Fieldset-based *Fields also get it from `<fieldset disabled>`.
 */
describe('native FormData from ui choice controls', () => {
  for (const [name, build] of Object.entries(cases)) {
    it(`${name}: enabled submits its value`, () => {
      expect(submitted(build({})).length).toBeGreaterThan(0)
    })
    it(`${name}: readOnly still submits its value`, () => {
      expect(submitted(build({ readOnly: true })).length).toBeGreaterThan(0)
    })
    it(`${name}: disabled submits nothing`, () => {
      expect(submitted(build({ disabled: true }))).toEqual([])
    })
  }
})
