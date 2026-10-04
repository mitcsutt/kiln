/**
 * The multiSelect loader path (component mode `loadOptions`, which is also what schema
 * `optionsFrom` maps to — A.9), and the same path on FormComboboxField.
 *
 * An async search replaces the loader result, so the field maps its value through
 * `useOptionMapping(result.options, { retain })`: a selected value missing from the current result
 * still round-trips. Without `retain`, `toUi` turns such a value into `''` and `fromUi('')` → null
 * is filtered out on change, so earlier picks would lose their chip label and a new pick would drop
 * them from the value.
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Form } from '#components/Form'
import type { OptionsLoader } from '#core/hooks/useOptions'
import { kit } from '#kit'
import { defineLoader } from '#schema/core/registry'
import { renderForm } from '#test/renderForm'

const cities = [
  { value: 'osl', label: 'Oslo' },
  { value: 'lis', label: 'Lisbon' },
  { value: 'par', label: 'Paris' },
]
const loader: OptionsLoader<string> = ({ query }) =>
  Promise.resolve(cities.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())))

async function settle() {
  await act(() => {
    vi.advanceTimersByTime(400)
    return Promise.resolve()
  })
  await act(() => Promise.resolve())
}

function setup(initial: string[] = []) {
  return renderForm(
    (f) => (
      <f.MultiSelectField name="cities" label="Cities" loadOptions={loader} placeholder="Search" />
    ),
    {
      defaultValues: { cities: initial },
    },
  )
}

async function search(text: string) {
  const input = screen.getByRole('combobox', { name: 'Cities' })
  fireEvent.change(input, { target: { value: text } })
  await settle()
  return input
}

async function pick(label: string) {
  const option = screen.getByRole('option', { name: new RegExp(label) })
  fireEvent.click(option)
  await settle()
}

describe('FormMultiSelectField with loadOptions keeps earlier picks', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('a default value shows its chip before any search (baseline)', async () => {
    setup(['lis'])
    await settle()
    expect(screen.getByRole('button', { name: /Lisbon/ })).toBeInTheDocument()
  })

  it('picks a loaded option (baseline)', async () => {
    const { form } = setup()
    await settle()
    await search('osl')
    await pick('Oslo')
    expect(form.state.values.cities).toEqual(['osl'])
  })

  it('a second pick from a different search keeps the first', async () => {
    const { form } = setup()
    await settle()
    await search('osl')
    await pick('Oslo')
    await search('par')
    await pick('Paris')
    expect(form.state.values.cities).toEqual(['osl', 'par'])
  })

  it('a selected value outside the current result still shows its label chip', async () => {
    setup(['lis'])
    await settle()
    await search('osl')
    // The chip's remove button is named after the option's label.
    expect(screen.getByRole('button', { name: /Lisbon/ })).toBeInTheDocument()
  })
})

describe('schema optionsFrom on multiSelect (same path, A.9)', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  const loaderKit = kit.extend({ loaders: { cities: defineLoader<string>(loader) } })
  interface V {
    cities: string[]
  }
  const schema = loaderKit.defineFormSchema<V>()({
    version: 1,
    root: {
      layout: 'stack',
      children: [
        { kind: 'multiSelect', name: 'cities', label: 'Cities', optionsFrom: { loader: 'cities' } },
      ],
    },
  })

  it('a second pick from a different search keeps the first and the default', async () => {
    const holder: { values?: () => V } = {}
    function Harness() {
      const form = loaderKit.useAppForm<V>({ defaultValues: { cities: ['lis'] } })
      holder.values = () => form.state.values
      return (
        <Form form={form} aria-label="Schema form">
          <loaderKit.SchemaForm form={form} schema={schema} />
        </Form>
      )
    }
    render(<Harness />)
    await settle()
    await search('osl')
    await pick('Oslo')
    await search('par')
    await pick('Paris')
    expect(holder.values?.().cities).toEqual(['lis', 'osl', 'par'])
    expect(screen.getByRole('button', { name: /Lisbon/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Oslo/ })).toBeInTheDocument()
  })
})

describe('FormComboboxField keeps its value mid-search', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  it('the hidden input still posts the chosen value while a search excludes it', async () => {
    const { container, form } = renderForm(
      (f) => <f.ComboboxField name="city" label="City" loadOptions={loader} />,
      { defaultValues: { city: 'lis' } },
    )
    await settle()
    const input = screen.getByRole('combobox', { name: 'City' })
    fireEvent.change(input, { target: { value: 'osl' } })
    await settle()
    expect(
      container.querySelector<HTMLInputElement>('input[type="hidden"][name="city"]')?.value,
    ).toBe('lis')
    expect(form.state.values.city).toBe('lis')
  })
})
