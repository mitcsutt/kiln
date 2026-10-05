import { act, fireEvent, render, screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import { Form } from '#components/form/Form'
import { FormMultiSelectField } from '#components/fields/FormMultiSelectField'
import type { OptionsLoader } from '#hooks/useOptions'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { kit } from '#kit/defaultKit'

const cities: { value: string; label: string }[] = [
  { value: 'lis', label: 'Lisbon' },
  { value: 'osl', label: 'Oslo' },
  { value: 'rom', label: 'Rome' },
]

const labelsOf = (values: readonly string[]) =>
  values.map((v) => cities.find((c) => c.value === v)?.label ?? v).join(', ')

const toggle = async (user: UserEvent, control: HTMLElement, value: string) => {
  await user.click(control)
  await user.click(
    await screen.findByRole('option', { name: cities.find((c) => c.value === value)?.label }),
  )
}

runFieldConformance<readonly string[]>('multiSelect', {
  build: (props) => (
    <FormMultiSelectField {...props} options={cities} placeholder="Search cities" />
  ),
  valid: ['osl'],
  invalid: [],
  interact: async (user, control, value) => {
    // Drive the control to exactly `value` (toggle off anything already chosen, on the rest).
    await user.click(control)
    for (const city of cities) {
      const chosen = value.includes(city.value)
      const option = await screen.findByRole('option', { name: city.label })
      const selected = option.getAttribute('aria-selected') === 'true'
      if (chosen !== selected) await user.click(option)
    }
    await user.keyboard('{Escape}')
  },
  // Chosen values render as removable chips (`role="list"` / `listitem`), not the input's value.
  display: () =>
    screen
      .queryAllByRole('listitem')
      .map((li) => li.textContent)
      .join(', '),
  shown: labelsOf,
  viewText: 'Oslo',
})

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

function mountMultiSelect(build: () => ReactNode) {
  function Harness() {
    const form = kit.useAppForm({ defaultValues: { cities: [] as string[] } })
    const AppField = form.AppField as unknown as AppFieldLike
    return (
      <Form form={form} aria-label="Test form">
        <AppField name="cities">{build}</AppField>
      </Form>
    )
  }
  render(<Harness />)
  return screen.getByRole('combobox', { name: 'Cities' })
}

describe('FormMultiSelectField', () => {
  it('value / onValueChange keep each option’s own type (string[])', async () => {
    const { form, user } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="cities">
            {() => <FormMultiSelectField label="Cities" options={cities} placeholder="Search" />}
          </AppField>
        )
      },
      { defaultValues: { cities: ['rom'] as string[] } },
    )
    await toggle(user, screen.getByRole('combobox', { name: 'Cities' }), 'lis')
    expect(form.state.values.cities).toEqual(['rom', 'lis'])
  })

  it('view mode never calls the loader, and shows labels for values not in the (never-fetched) result', () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="cities">
            {() => <FormMultiSelectField label="Cities" loadOptions={loader} />}
          </AppField>
        )
      },
      { defaultValues: { cities: ['tyo', 'rom'] as string[] }, formProps: { mode: 'view' } },
    )
    expect(loader).not.toHaveBeenCalled()
    // "tyo" isn't in `cities` and the loader was never asked — falls back to the raw value; "rom"
    // isn't known either here (no static `options`), so it also falls back, never "Not provided".
    expect(screen.getByText('tyo, rom')).toBeInTheDocument()
  })

  it('view mode prefers a label already known (static `options`) over the raw value', () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="cities">
            {() => <FormMultiSelectField label="Cities" options={cities} loadOptions={loader} />}
          </AppField>
        )
      },
      { defaultValues: { cities: ['osl', 'lis'] as string[] }, formProps: { mode: 'view' } },
    )
    expect(loader).not.toHaveBeenCalled()
    expect(screen.getByText('Oslo, Lisbon')).toBeInTheDocument()
  })

  describe('async options (useOptions)', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('debounces query changes and aborts the superseded request', async () => {
      const calls: string[] = []
      const signals: AbortSignal[] = []
      const loader = vi.fn<OptionsLoader<string>>(({ query, signal }) => {
        calls.push(query)
        signals.push(signal)
        return Promise.resolve(
          cities.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
        )
      })
      const input = mountMultiSelect(() => (
        <FormMultiSelectField label="Cities" loadOptions={loader} placeholder="Search" />
      ))

      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)

      fireEvent.change(input, { target: { value: 'b' } })
      fireEvent.change(input, { target: { value: 'br' } })
      expect(loader).toHaveBeenCalledTimes(1)
      await act(() => {
        vi.advanceTimersByTime(249)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)
      await act(() => {
        vi.advanceTimersByTime(1)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)
      expect(calls).toEqual(['', 'br'])
      expect(signals[0]?.aborted).toBe(true)
    })

    it('caches a query already loaded', async () => {
      const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
      const input = mountMultiSelect(() => (
        <FormMultiSelectField label="Cities" loadOptions={loader} placeholder="Search" />
      ))
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)

      fireEvent.change(input, { target: { value: 'x' } })
      await act(() => {
        vi.advanceTimersByTime(250)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)

      fireEvent.change(input, { target: { value: '' } })
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)
    })
  })
})
