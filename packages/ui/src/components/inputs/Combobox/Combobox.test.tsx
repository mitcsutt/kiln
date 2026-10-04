import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { Combobox, type ComboboxOption } from './Combobox'
import { must } from '#test/must'

const countries: ComboboxOption[] = [
  { value: 'arg', label: 'Argentina', group: 'South America' },
  { value: 'bra', label: 'Brazil', group: 'South America' },
  { value: 'usa', label: 'United States', keywords: ['USA', 'America'], group: 'North America' },
  { value: 'mex', label: 'Mexico', group: 'North America' },
  { value: 'cuw', label: 'Curaçao', group: 'North America' },
  { value: 'aus', label: 'Australia', group: 'Asia', disabled: true },
]

const flat: ComboboxOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'billing', label: 'Billing', description: 'Invoices and payments' },
  { value: 'hosting', label: 'Hosting', disabled: true },
  { value: 'support', label: 'Support' },
]

function setup() {
  return userEvent.setup()
}

const combobox = () => screen.getByRole('combobox')
const listbox = () => screen.getByRole('listbox')
const activeOption = () => {
  const id = combobox().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id) : null
}

describe('Combobox — ARIA', () => {
  it('renders an ARIA 1.2 combobox and forwards the ref to the input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Combobox ref={ref} aria-label="Category" options={flat} />)
    const input = combobox()
    expect(ref.current).toBe(input)
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-controls', `${input.id}-listbox`)
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('links the listbox, options and groups', async () => {
    const user = setup()
    render(<Combobox aria-label="Country" options={countries} />)
    await user.click(combobox())
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    const list = listbox()
    expect(list.id).toBe(combobox().getAttribute('aria-controls'))
    expect(list).not.toHaveAttribute('aria-multiselectable')
    const groups = within(list).getAllByRole('group')
    expect(
      groups
        .map((group) => group.getAttribute('aria-labelledby'))
        .map((id) => document.getElementById(must(id))?.textContent),
    ).toEqual(['South America', 'North America', 'Asia'])
    expect(within(must(groups[0])).getAllByRole('option')).toHaveLength(2)
    expect(screen.getByRole('option', { name: 'Australia' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('option', { name: 'Brazil' })).toHaveAttribute('aria-selected', 'false')
  })

  it('is labelled by a surrounding Field (input and listbox)', async () => {
    const user = setup()
    render(
      <Field label="Country" description="Where you are based" error="Choose a country" required>
        <Combobox options={countries} />
      </Field>,
    )
    const input = screen.getByRole('combobox', { name: /Country/ })
    expect(input).toHaveAccessibleDescription(/Where you are based/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    await user.click(input)
    expect(screen.getByRole('listbox', { name: /Country/ })).toBeInTheDocument()
  })

  it('marks aria-multiselectable and aria-selected when multiple', async () => {
    const user = setup()
    render(<Combobox multiple aria-label="Labels" options={flat} defaultValue={['billing']} />)
    await user.click(combobox())
    expect(listbox()).toHaveAttribute('aria-multiselectable', 'true')
    expect(screen.getByRole('option', { name: /Billing/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Design' })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('Combobox — keyboard', () => {
  it('ArrowDown opens on the first option, then moves and wraps; aria-activedescendant tracks', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    expect(activeOption()).toHaveTextContent('Design')
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Billing')
    // Hosting is disabled: skipped.
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Support')
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Design')
    expect(activeOption()).toHaveAttribute('data-active')
  })

  it('ArrowUp opens on the last option and wraps upward', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Support')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Design')
    await user.keyboard('{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Support')
  })

  it('opening starts on the selected option', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} defaultValue="support" />)
    combobox().focus()
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Support')
  })

  it('Alt+ArrowDown opens without moving the highlight', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    expect(combobox()).not.toHaveAttribute('aria-activedescendant')
  })

  it('Home and End jump within the open list', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}{End}')
    expect(activeOption()).toHaveTextContent('Support')
    await user.keyboard('{Home}')
    expect(activeOption()).toHaveTextContent('Design')
  })

  it('Enter selects; single closes and shows the label', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Category" options={flat} onValueChange={onValueChange} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('billing')
    expect(combobox()).toHaveValue('Billing')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Enter in multiple toggles and stays open', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox multiple aria-label="Labels" options={flat} onValueChange={onValueChange} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['design'])
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['design', 'billing'])
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['design'])
  })

  it('typing highlights the best match so Enter picks it', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Country" options={countries} onValueChange={onValueChange} />)
    await user.type(combobox(), 'usa')
    expect(activeOption()).toHaveTextContent('United States')
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('usa')
    expect(combobox()).toHaveValue('United States')
  })

  it('Escape closes, and a second Escape clears the query', async () => {
    const user = setup()
    render(<Combobox aria-label="Country" options={countries} />)
    await user.type(combobox(), 'bra')
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
    expect(combobox()).toHaveValue('bra')
    await user.keyboard('{Escape}')
    expect(combobox()).toHaveValue('')
  })

  it('Escape closing the list does not clear the value', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Country"
        options={countries}
        defaultValue="mex"
        onValueChange={onValueChange}
      />,
    )
    combobox().focus()
    await user.keyboard('{ArrowDown}{Escape}')
    expect(combobox()).toHaveValue('Mexico')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('Tab closes the list and moves focus on in document order', async () => {
    const user = setup()
    render(
      <>
        <Combobox aria-label="Country" options={countries} />
        <button type="button">Next</button>
      </>,
    )
    combobox().focus()
    await user.keyboard('{ArrowDown}')
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
  })

  it('Backspace on an empty query removes the last chip', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        aria-label="Labels"
        options={flat}
        defaultValue={['billing', 'support']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(combobox())
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['billing'])
    expect(
      screen.queryByText('Support', { selector: '[data-removable] *, [data-removable]' }),
    ).not.toBeInTheDocument()
  })

  it('Backspace with text edits the text, not the chips', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        aria-label="Labels"
        options={flat}
        defaultValue={['billing']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'de{Backspace}')
    expect(combobox()).toHaveValue('d')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('focus stays in the input while the list is open and after picking', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    await user.click(combobox())
    expect(combobox()).toHaveFocus()
    await user.click(screen.getByRole('option', { name: 'Design' }))
    expect(combobox()).toHaveFocus()
    expect(combobox()).toHaveValue('Design')
  })
})

describe('Combobox — selection and filtering', () => {
  it('filters diacritic-folded and ranked, with keywords', async () => {
    const user = setup()
    render(<Combobox aria-label="Country" options={countries} />)
    await user.type(combobox(), 'curacao')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Curaçao'])
    await user.clear(combobox())
    await user.type(combobox(), 'america')
    // Keyword prefix (United States) is the only match; group labels never match.
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'United States',
    ])
  })

  it('shows all options again after a pick (single), with the chosen one checked', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} defaultValue="billing" />)
    await user.click(combobox())
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(screen.getByRole('option', { name: /Billing/ })).toHaveAttribute('aria-selected', 'true')
  })

  it("filter='none' shows the given options as they are", async () => {
    const user = setup()
    render(<Combobox aria-label="Client" options={flat} filter="none" />)
    await user.type(combobox(), 'zzz')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('shows the empty message when nothing matches', async () => {
    const user = setup()
    render(
      <Combobox aria-label="Country" options={countries} emptyMessage="No country by that name" />,
    )
    await user.type(combobox(), 'zzz')
    expect(screen.getByText('No country by that name')).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('shows the loading message (and busy list) while loading with no options', async () => {
    const user = setup()
    const { rerender } = render(
      <Combobox
        aria-label="Client"
        options={[]}
        filter="none"
        loading
        loadingMessage="Searching clients"
      />,
    )
    await user.type(combobox(), 'nort')
    expect(screen.getByText('Searching clients')).toBeInTheDocument()
    expect(listbox()).toHaveAttribute('aria-busy', 'true')
    rerender(
      <Combobox
        aria-label="Client"
        options={[{ value: 'w', label: 'Northwind Studio' }]}
        filter="none"
      />,
    )
    expect(screen.queryByText('Searching clients')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Northwind Studio' })).toBeInTheDocument()
  })

  it('while loading, nothing is auto-highlighted and Enter does not commit a stale result', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    const previous = [{ value: 'northwind', label: 'Northwind Studio' }]
    const { rerender } = render(
      <Combobox
        aria-label="Client"
        options={previous}
        filter="none"
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'wo')
    expect(activeOption()).toHaveTextContent('Northwind Studio')
    // A new query is in flight: the list still shows the previous query's results.
    rerender(
      <Combobox
        aria-label="Client"
        options={previous}
        filter="none"
        loading
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'x')
    expect(combobox()).not.toHaveAttribute('aria-activedescendant')
    await user.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    // Results arrive: the best match is highlighted again.
    rerender(
      <Combobox
        aria-label="Client"
        options={[{ value: 'wox', label: 'Woxford Labs' }]}
        filter="none"
        onValueChange={onValueChange}
      />,
    )
    expect(activeOption()).toHaveTextContent('Woxford Labs')
  })

  it('selects with the mouse and ignores disabled options', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Category" options={flat} onValueChange={onValueChange} />)
    await user.click(combobox())
    await user.click(screen.getByRole('option', { name: 'Hosting' }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('option', { name: 'Support' }))
    expect(onValueChange).toHaveBeenCalledWith('support')
  })

  it('is controlled', async () => {
    const user = setup()
    function Controlled() {
      const [value, setValue] = useState<string | null>('billing')
      return (
        <>
          <Combobox aria-label="Category" options={flat} value={value} onValueChange={setValue} />
          <button
            type="button"
            onClick={() => {
              setValue(null)
            }}
          >
            Reset
          </button>
          <output>{value ?? 'none'}</output>
        </>
      )
    }
    render(<Controlled />)
    expect(combobox()).toHaveValue('Billing')
    combobox().focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(screen.getByText('support')).toBeInTheDocument()
    expect(combobox()).toHaveValue('Support')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(combobox()).toHaveValue('')
  })

  it('reverts unmatched text to the chosen label on blur (not creatable)', async () => {
    const user = setup()
    render(<Combobox aria-label="Country" options={countries} defaultValue="mex" />)
    await user.clear(combobox())
    await user.type(combobox(), 'Spai')
    await user.tab()
    expect(combobox()).toHaveValue('Mexico')
  })

  it('clearing the text and leaving clears a single value', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Country"
        options={countries}
        defaultValue="mex"
        onValueChange={onValueChange}
      />,
    )
    await user.clear(combobox())
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('clearable: the clear button empties the value and refocuses the input', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        aria-label="Country"
        options={countries}
        defaultValue="mex"
        clearable
        clearLabel="Clear country"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear country' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(combobox()).toHaveValue('')
    expect(combobox()).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear country' })).not.toBeInTheDocument()
  })

  it('maxSelected disables the remaining options', async () => {
    const user = setup()
    render(
      <Combobox
        multiple
        aria-label="Labels"
        options={flat}
        maxSelected={1}
        defaultValue={['billing']}
      />,
    )
    await user.click(combobox())
    expect(screen.getByRole('option', { name: 'Design' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('option', { name: /Billing/ })).not.toHaveAttribute('aria-disabled')
  })
})

describe('Combobox — multiple chips', () => {
  it('renders chosen values as removable Tags and removes with the button', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        aria-label="Labels"
        options={flat}
        defaultValue={['billing', 'support']}
        removeLabel={(label) => `Remove label ${label}`}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('list')).toHaveTextContent('BillingSupport')
    await user.click(screen.getByRole('button', { name: 'Remove label Billing' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['support'])
    expect(combobox()).toHaveFocus()
  })

  it('clears the query after each pick', async () => {
    const user = setup()
    render(<Combobox multiple aria-label="Labels" options={flat} />)
    await user.type(combobox(), 'sup{Enter}')
    expect(combobox()).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Remove Support' })).toBeInTheDocument()
  })
})

describe('Combobox — creatable', () => {
  it('commits free text on Enter (single)', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Client" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'Paperkite Press{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('Paperkite Press')
    expect(combobox()).toHaveValue('Paperkite Press')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
  })

  it('commits free text on blur', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Client" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'Paperkite Press')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith('Paperkite Press')
  })

  it('a typed label that matches an option picks that option', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Client" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'billing{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('billing')
    expect(combobox()).toHaveValue('Billing')
  })

  it('multiple: Enter and blur add chips', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(
      <Combobox
        multiple
        creatable
        aria-label="Labels"
        options={flat}
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'Research{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Research'])
    await user.type(combobox(), 'Urgent')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(['Research', 'Urgent'])
    expect(screen.getByRole('button', { name: 'Remove Urgent' })).toBeInTheDocument()
  })

  it('an arrowed-to option still wins over the typed text', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Client" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'b')
    // Ranked: Billing (prefix) first. Committing the text would give 'b'.
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('billing')
  })
})

describe('Combobox — form integration', () => {
  it('renders one hidden input per value for name', () => {
    const hidden = (container: HTMLElement, name: string) =>
      [...container.querySelectorAll<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)].map(
        (input) => input.value,
      )
    const view = render(
      <Combobox
        multiple
        aria-label="Labels"
        name="labels"
        options={flat}
        defaultValue={['billing', 'support']}
      />,
    )
    expect(hidden(view.container, 'labels')).toEqual(['billing', 'support'])
    view.unmount()
    const { container: single, unmount } = render(
      <Combobox aria-label="Country" name="country" options={countries} defaultValue="mex" />,
    )
    expect(hidden(single, 'country')).toEqual(['mex'])
    unmount()
    const { container: empty } = render(
      <Combobox aria-label="Country" name="country" options={countries} />,
    )
    expect(hidden(empty, 'country')).toEqual([''])
  })

  it('submits through FormData', () => {
    const { container } = render(
      <form>
        <Combobox
          multiple
          aria-label="Labels"
          name="labels"
          options={flat}
          defaultValue={['billing', 'design']}
        />
      </form>,
    )
    const data = new FormData(must(container.querySelector('form')))
    expect(data.getAll('labels')).toEqual(['billing', 'design'])
  })

  it('onBlur fires once focus leaves the whole control, not when moving to a chip', async () => {
    const user = setup()
    const onBlur = vi.fn()
    render(
      <>
        <Combobox
          multiple
          aria-label="Labels"
          options={flat}
          defaultValue={['billing']}
          onBlur={onBlur}
        />
        <button type="button">After</button>
      </>,
    )
    await user.click(combobox())
    await user.tab({ shift: true }) // to the chip's remove button
    expect(screen.getByRole('button', { name: 'Remove Billing' })).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'After' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('readOnly and disabled never open or change', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Combobox aria-label="Country" options={countries} readOnly onValueChange={onValueChange} />,
    )
    expect(combobox()).toHaveAttribute('readonly')
    await user.click(combobox())
    await user.keyboard('{ArrowDown}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
    rerender(
      <Combobox aria-label="Country" options={countries} disabled onValueChange={onValueChange} />,
    )
    expect(combobox()).toBeDisabled()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('announces the result count politely, debounced', async () => {
    const user = setup()
    render(<Combobox aria-label="Country" options={countries} />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    await user.type(combobox(), 'a')
    expect(status).toHaveTextContent('')
    await waitFor(() => expect(status).toHaveTextContent(/options available/), { timeout: 1500 })
    await user.type(combobox(), 'rgen')
    await waitFor(() => expect(status).toHaveTextContent('1 option available'), { timeout: 1500 })
  })

  it('portals the list into the nearest theme scope', async () => {
    const user = setup()
    render(
      <div data-theme="fiesta" data-testid="scope">
        <Combobox aria-label="Country" options={countries} />
      </div>,
    )
    await user.click(combobox())
    expect(screen.getByTestId('scope')).toContainElement(listbox())
  })

  it('works with fake timers too (live region uses setTimeout)', () => {
    vi.useFakeTimers()
    try {
      render(<Combobox aria-label="Country" options={countries} defaultOpen />)
      act(() => {
        vi.advanceTimersByTime(600)
      })
      expect(screen.getByRole('status')).toHaveTextContent('6 options available')
    } finally {
      vi.useRealTimers()
    }
  })
})
