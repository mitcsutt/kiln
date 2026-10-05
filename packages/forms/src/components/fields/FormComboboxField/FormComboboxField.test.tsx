import { act, fireEvent, render, screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentType, ReactNode } from 'react'
import { Form } from '#components/form/Form'
import { FormComboboxField } from '#components/fields/FormComboboxField'
import type { OptionsLoader } from '#hooks/useOptions'
import { runFieldConformance } from '#test/conformance'
import { renderForm } from '#test/renderForm'
import { kit } from '#kit/defaultKit'

const cities: { value: string; label: string }[] = [
  { value: 'lis', label: 'Lisbon' },
  { value: 'osl', label: 'Oslo' },
  { value: 'rom', label: 'Rome' },
]

const labelOf = (value: string | null) => cities.find((c) => c.value === value)?.label ?? ''

/** Picks an option like a user would; `null` has no option (no `emptyOption` here) — clear the text instead. */
const pickOption = async (user: UserEvent, control: HTMLElement, value: string | null) => {
  if (value === null) {
    await user.click(control)
    await user.clear(control)
    await user.tab()
    return
  }
  await user.click(control)
  await user.click(await screen.findByRole('option', { name: labelOf(value) }))
}

runFieldConformance<string | null>('combobox', {
  build: (props) => <FormComboboxField {...props} options={cities} placeholder="Search cities" />,
  valid: 'osl',
  invalid: null,
  interact: pickOption,
  shown: labelOf,
  viewText: 'Oslo',
})

type AppFieldLike = ComponentType<{ name: string; children: () => ReactNode }>

/** A bare harness that binds `FormComboboxField` through `AppField` directly. */
function mountCombobox(build: () => ReactNode) {
  function Harness() {
    const form = kit.useAppForm({ defaultValues: { city: null as string | null } })
    const AppField = form.AppField as unknown as AppFieldLike
    return (
      <Form form={form} aria-label="Test form">
        <AppField name="city">{build}</AppField>
      </Form>
    )
  }
  render(<Harness />)
  return screen.getByRole('combobox', { name: 'City' })
}

describe('FormComboboxField', () => {
  it('keeps the option value type and renders the chosen label', async () => {
    const { form, user } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="city">
            {() => <FormComboboxField label="City" options={cities} placeholder="Search" />}
          </AppField>
        )
      },
      { defaultValues: { city: 'lis' } },
    )
    const input = screen.getByRole('combobox', { name: 'City' })
    await pickOption(user, input, 'rom')
    expect(form.state.values.city).toBe('rom')
    expect(input).toHaveValue('Rome')
  })

  it('creatable: typed free text becomes the value', async () => {
    const { form, user } = renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="city">
            {() => (
              <FormComboboxField label="City" options={cities} creatable placeholder="Search" />
            )}
          </AppField>
        )
      },
      { defaultValues: { city: null as string | null } },
    )
    const input = screen.getByRole('combobox', { name: 'City' })
    await user.type(input, 'Vienna')
    await user.tab()
    expect(form.state.values.city).toBe('Vienna')
  })

  it('view mode never calls the loader, and shows a label for a value not in the (never-fetched) result', () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="city">
            {() => <FormComboboxField label="City" loadOptions={loader} />}
          </AppField>
        )
      },
      { defaultValues: { city: 'tyo' }, formProps: { mode: 'view' } },
    )
    expect(loader).not.toHaveBeenCalled()
    // Not in `cities`, and the loader was never asked — falls back to the raw value, never
    // "Not provided" for a value that's actually there.
    expect(screen.getByText('tyo')).toBeInTheDocument()
  })

  it('view mode prefers a label already known (static `options`, or seen while editing) over the raw value', () => {
    const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
    renderForm(
      (f) => {
        const AppField = f.AppField as unknown as AppFieldLike
        return (
          <AppField name="city">
            {() => <FormComboboxField label="City" options={cities} loadOptions={loader} />}
          </AppField>
        )
      },
      { defaultValues: { city: 'osl' }, formProps: { mode: 'view' } },
    )
    expect(loader).not.toHaveBeenCalled()
    expect(screen.getByText('Oslo')).toBeInTheDocument()
  })

  describe('async options (useOptions)', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('debounces query changes, aborts the superseded request, and caches by query', async () => {
      const calls: string[] = []
      const signals: AbortSignal[] = []
      const loader = vi.fn<OptionsLoader<string>>(({ query, signal }) => {
        calls.push(query)
        signals.push(signal)
        return Promise.resolve(
          cities.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
        )
      })
      const input = mountCombobox(() => (
        <FormComboboxField label="City" loadOptions={loader} placeholder="Search" />
      ))

      // The first load is not debounced.
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)
      expect(calls).toEqual([''])

      // Each change is suppression-checked on a real microtask (not the fake clock) before it
      // reaches `useOptions` — `await act(() => Promise.resolve())` flushes it, same as a real event loop tick.
      fireEvent.change(input, { target: { value: 'm' } })
      await act(() => Promise.resolve())
      fireEvent.change(input, { target: { value: 'me' } })
      await act(() => Promise.resolve())
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
      expect(calls).toEqual(['', 'me'])
      // The superseded (empty-query) request was aborted when "me" was requested.
      expect(signals[0]?.aborted).toBe(true)

      // Back to a cached query ('') — no third request.
      fireEvent.change(input, { target: { value: '' } })
      await act(() => Promise.resolve())
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)
    })

    it('does not re-query the loader for the label a pick writes back into the box', async () => {
      const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
      const input = mountCombobox(() => (
        <FormComboboxField label="City" loadOptions={loader} placeholder="Search" />
      ))
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)

      fireEvent.click(input)
      const option = screen.getByRole('option', { name: 'Oslo' })
      fireEvent.click(option)
      expect(input).toHaveValue('Oslo')

      // The pick wrote "Oslo" back into the box (known ui behaviour) — not a new search.
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)
    })

    it('does not re-query the loader when a creatable commit (Enter) rewrites the typed text to a matching option’s label', async () => {
      // `commitText` (ui) calls `setQuery(label)` *before* `setValues(value)` for this path — the
      // reverse of a click-pick — so the fix must suppress both orders.
      const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
      const input = mountCombobox(() => (
        <FormComboboxField label="City" loadOptions={loader} creatable placeholder="Search" />
      ))
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)

      // Typed in a different case than the option's label ("oslo" vs "Oslo"): a genuine
      // search for the typed text first.
      fireEvent.change(input, { target: { value: 'oslo' } })
      await act(() => Promise.resolve())
      await act(() => {
        vi.advanceTimersByTime(250)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)

      // Enter folds "oslo" to the existing "Oslo" option and commits it — rewriting the box.
      fireEvent.keyDown(input, { key: 'Enter' })
      await act(() => Promise.resolve())
      expect(input).toHaveValue('Oslo')

      // The rewritten label is the commit's echo, not a new search.
      await act(() => {
        vi.advanceTimersByTime(300)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)
    })

    it('reloads when a `reloadOn` sibling changes', async () => {
      const loader = vi.fn<OptionsLoader<string>>(() => Promise.resolve(cities))
      function Harness() {
        const form = kit.useAppForm({
          defaultValues: { country: 'a', city: null as string | null },
        })
        const AppField = form.AppField as unknown as AppFieldLike
        return (
          <Form form={form} aria-label="Test form">
            <AppField name="city">
              {() => (
                <FormComboboxField
                  label="City"
                  loadOptions={loader}
                  reloadOn={['country']}
                  placeholder="Search"
                />
              )}
            </AppField>
            <button
              type="button"
              onClick={() => {
                form.setFieldValue('country', 'b')
              }}
            >
              Switch country
            </button>
          </Form>
        )
      }
      render(<Harness />)
      await act(() => {
        vi.advanceTimersByTime(0)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(1)
      act(() => {
        screen.getByRole('button', { name: 'Switch country' }).click()
      })
      // Every load after the first is debounced (250ms).
      await act(() => {
        vi.advanceTimersByTime(250)
        return Promise.resolve()
      })
      expect(loader).toHaveBeenCalledTimes(2)
    })
  })
})
