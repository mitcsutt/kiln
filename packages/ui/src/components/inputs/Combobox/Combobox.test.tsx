import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { Field } from '#components/inputs/Field'
import { Combobox, type ComboboxOption } from './Combobox'
import { must } from '#test/must'

const teams: ComboboxOption[] = [
  { value: 'arg', label: 'Argentina', group: 'South America' },
  { value: 'bra', label: 'Brazil', group: 'South America' },
  { value: 'usa', label: 'United States', keywords: ['USA', 'America'], group: 'North America' },
  { value: 'mex', label: 'Mexico', group: 'North America' },
  { value: 'cuw', label: 'Curaçao', group: 'North America' },
  { value: 'aus', label: 'Australia', group: 'Asia', disabled: true },
]

const flat: ComboboxOption[] = [
  { value: 'groceries', label: 'Groceries' },
  { value: 'rent', label: 'Rent', description: 'Paid on the 1st' },
  { value: 'utilities', label: 'Utilities', disabled: true },
  { value: 'transport', label: 'Transport' },
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
    render(<Combobox aria-label="Team" options={teams} />)
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
      <Field label="Team" description="The side you follow" error="Choose a team" required>
        <Combobox options={teams} />
      </Field>,
    )
    const input = screen.getByRole('combobox', { name: /Team/ })
    expect(input).toHaveAccessibleDescription(/The side you follow/)
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    await user.click(input)
    expect(screen.getByRole('listbox', { name: /Team/ })).toBeInTheDocument()
  })

  it('marks aria-multiselectable and aria-selected when multiple', async () => {
    const user = setup()
    render(<Combobox multiple aria-label="Labels" options={flat} defaultValue={['rent']} />)
    await user.click(combobox())
    expect(listbox()).toHaveAttribute('aria-multiselectable', 'true')
    expect(screen.getByRole('option', { name: /Rent/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Groceries' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })
})

describe('Combobox — keyboard', () => {
  it('ArrowDown opens on the first option, then moves and wraps; aria-activedescendant tracks', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    expect(activeOption()).toHaveTextContent('Groceries')
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Rent')
    // Utilities is disabled: skipped.
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Transport')
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Groceries')
    expect(activeOption()).toHaveAttribute('data-active')
  })

  it('ArrowUp opens on the last option and wraps upward', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    combobox().focus()
    await user.keyboard('{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Transport')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Groceries')
    await user.keyboard('{ArrowUp}')
    expect(activeOption()).toHaveTextContent('Transport')
  })

  it('opening starts on the selected option', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} defaultValue="transport" />)
    combobox().focus()
    await user.keyboard('{ArrowDown}')
    expect(activeOption()).toHaveTextContent('Transport')
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
    expect(activeOption()).toHaveTextContent('Transport')
    await user.keyboard('{Home}')
    expect(activeOption()).toHaveTextContent('Groceries')
  })

  it('Enter selects; single closes and shows the label', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Category" options={flat} onValueChange={onValueChange} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('rent')
    expect(combobox()).toHaveValue('Rent')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('Enter in multiple toggles and stays open', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox multiple aria-label="Labels" options={flat} onValueChange={onValueChange} />)
    combobox().focus()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['groceries'])
    expect(combobox()).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['groceries', 'rent'])
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['groceries'])
  })

  it('typing highlights the best match so Enter picks it', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Team" options={teams} onValueChange={onValueChange} />)
    await user.type(combobox(), 'usa')
    expect(activeOption()).toHaveTextContent('United States')
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('usa')
    expect(combobox()).toHaveValue('United States')
  })

  it('Escape closes, and a second Escape clears the query', async () => {
    const user = setup()
    render(<Combobox aria-label="Team" options={teams} />)
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
        aria-label="Team"
        options={teams}
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
        <Combobox aria-label="Team" options={teams} />
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
        defaultValue={['rent', 'transport']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(combobox())
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['rent'])
    expect(
      screen.queryByText('Transport', { selector: '[data-removable] *, [data-removable]' }),
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
        defaultValue={['rent']}
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'gr{Backspace}')
    expect(combobox()).toHaveValue('g')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('focus stays in the input while the list is open and after picking', async () => {
    const user = setup()
    render(<Combobox aria-label="Category" options={flat} />)
    await user.click(combobox())
    expect(combobox()).toHaveFocus()
    await user.click(screen.getByRole('option', { name: 'Groceries' }))
    expect(combobox()).toHaveFocus()
    expect(combobox()).toHaveValue('Groceries')
  })
})

describe('Combobox — selection and filtering', () => {
  it('filters diacritic-folded and ranked, with keywords', async () => {
    const user = setup()
    render(<Combobox aria-label="Team" options={teams} />)
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
    render(<Combobox aria-label="Category" options={flat} defaultValue="rent" />)
    await user.click(combobox())
    expect(screen.getAllByRole('option')).toHaveLength(4)
    expect(screen.getByRole('option', { name: /Rent/ })).toHaveAttribute('aria-selected', 'true')
  })

  it("filter='none' shows the given options as they are", async () => {
    const user = setup()
    render(<Combobox aria-label="Payee" options={flat} filter="none" />)
    await user.type(combobox(), 'zzz')
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('shows the empty message when nothing matches', async () => {
    const user = setup()
    render(<Combobox aria-label="Team" options={teams} emptyMessage="No team by that name" />)
    await user.type(combobox(), 'zzz')
    expect(screen.getByText('No team by that name')).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('shows the loading message (and busy list) while loading with no options', async () => {
    const user = setup()
    const { rerender } = render(
      <Combobox
        aria-label="Payee"
        options={[]}
        filter="none"
        loading
        loadingMessage="Searching payees"
      />,
    )
    await user.type(combobox(), 'wool')
    expect(screen.getByText('Searching payees')).toBeInTheDocument()
    expect(listbox()).toHaveAttribute('aria-busy', 'true')
    rerender(
      <Combobox
        aria-label="Payee"
        options={[{ value: 'w', label: 'Corner Grocer' }]}
        filter="none"
      />,
    )
    expect(screen.queryByText('Searching payees')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Corner Grocer' })).toBeInTheDocument()
  })

  it('while loading, nothing is auto-highlighted and Enter does not commit a stale result', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    const previous = [{ value: 'corner-grocer', label: 'Corner Grocer' }]
    const { rerender } = render(
      <Combobox
        aria-label="Payee"
        options={previous}
        filter="none"
        onValueChange={onValueChange}
      />,
    )
    await user.type(combobox(), 'wo')
    expect(activeOption()).toHaveTextContent('Corner Grocer')
    // A new query is in flight: the list still shows the previous query's results.
    rerender(
      <Combobox
        aria-label="Payee"
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
        aria-label="Payee"
        options={[{ value: 'wox', label: 'Woxford Cafe' }]}
        filter="none"
        onValueChange={onValueChange}
      />,
    )
    expect(activeOption()).toHaveTextContent('Woxford Cafe')
  })

  it('selects with the mouse and ignores disabled options', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox aria-label="Category" options={flat} onValueChange={onValueChange} />)
    await user.click(combobox())
    await user.click(screen.getByRole('option', { name: 'Utilities' }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('option', { name: 'Transport' }))
    expect(onValueChange).toHaveBeenCalledWith('transport')
  })

  it('is controlled', async () => {
    const user = setup()
    function Controlled() {
      const [value, setValue] = useState<string | null>('rent')
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
    expect(combobox()).toHaveValue('Rent')
    combobox().focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(screen.getByText('transport')).toBeInTheDocument()
    expect(combobox()).toHaveValue('Transport')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(combobox()).toHaveValue('')
  })

  it('reverts unmatched text to the chosen label on blur (not creatable)', async () => {
    const user = setup()
    render(<Combobox aria-label="Team" options={teams} defaultValue="mex" />)
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
        aria-label="Team"
        options={teams}
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
        aria-label="Team"
        options={teams}
        defaultValue="mex"
        clearable
        clearLabel="Clear team"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Clear team' }))
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(combobox()).toHaveValue('')
    expect(combobox()).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear team' })).not.toBeInTheDocument()
  })

  it('maxSelected disables the remaining options', async () => {
    const user = setup()
    render(
      <Combobox
        multiple
        aria-label="Labels"
        options={flat}
        maxSelected={1}
        defaultValue={['rent']}
      />,
    )
    await user.click(combobox())
    expect(screen.getByRole('option', { name: 'Groceries' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('option', { name: /Rent/ })).not.toHaveAttribute('aria-disabled')
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
        defaultValue={['rent', 'transport']}
        removeLabel={(label) => `Remove label ${label}`}
        onValueChange={onValueChange}
      />,
    )
    expect(screen.getByRole('list')).toHaveTextContent('RentTransport')
    await user.click(screen.getByRole('button', { name: 'Remove label Rent' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['transport'])
    expect(combobox()).toHaveFocus()
  })

  it('clears the query after each pick', async () => {
    const user = setup()
    render(<Combobox multiple aria-label="Labels" options={flat} />)
    await user.type(combobox(), 'tra{Enter}')
    expect(combobox()).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Remove Transport' })).toBeInTheDocument()
  })
})

describe('Combobox — creatable', () => {
  it('commits free text on Enter (single)', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Payee" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'Corner bakery{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('Corner bakery')
    expect(combobox()).toHaveValue('Corner bakery')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
  })

  it('commits free text on blur', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Payee" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'Corner bakery')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith('Corner bakery')
  })

  it('a typed label that matches an option picks that option', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Payee" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'rent{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('rent')
    expect(combobox()).toHaveValue('Rent')
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
    await user.type(combobox(), 'Holiday{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(['Holiday'])
    await user.type(combobox(), 'Gifts')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith(['Holiday', 'Gifts'])
    expect(screen.getByRole('button', { name: 'Remove Gifts' })).toBeInTheDocument()
  })

  it('an arrowed-to option still wins over the typed text', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    render(<Combobox creatable aria-label="Payee" options={flat} onValueChange={onValueChange} />)
    await user.type(combobox(), 'r')
    // Ranked: Rent (prefix) first. Committing the text would give 'r'.
    await user.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('rent')
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
        defaultValue={['rent', 'transport']}
      />,
    )
    expect(hidden(view.container, 'labels')).toEqual(['rent', 'transport'])
    view.unmount()
    const { container: single, unmount } = render(
      <Combobox aria-label="Team" name="team" options={teams} defaultValue="mex" />,
    )
    expect(hidden(single, 'team')).toEqual(['mex'])
    unmount()
    const { container: empty } = render(<Combobox aria-label="Team" name="team" options={teams} />)
    expect(hidden(empty, 'team')).toEqual([''])
  })

  it('submits through FormData', () => {
    const { container } = render(
      <form>
        <Combobox
          multiple
          aria-label="Labels"
          name="labels"
          options={flat}
          defaultValue={['rent', 'groceries']}
        />
      </form>,
    )
    const data = new FormData(must(container.querySelector('form')))
    expect(data.getAll('labels')).toEqual(['rent', 'groceries'])
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
          defaultValue={['rent']}
          onBlur={onBlur}
        />
        <button type="button">After</button>
      </>,
    )
    await user.click(combobox())
    await user.tab({ shift: true }) // to the chip's remove button
    expect(screen.getByRole('button', { name: 'Remove Rent' })).toHaveFocus()
    expect(onBlur).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'After' }))
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('readOnly and disabled never open or change', async () => {
    const user = setup()
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Combobox aria-label="Team" options={teams} readOnly onValueChange={onValueChange} />,
    )
    expect(combobox()).toHaveAttribute('readonly')
    await user.click(combobox())
    await user.keyboard('{ArrowDown}')
    expect(combobox()).toHaveAttribute('aria-expanded', 'false')
    rerender(<Combobox aria-label="Team" options={teams} disabled onValueChange={onValueChange} />)
    expect(combobox()).toBeDisabled()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('announces the result count politely, debounced', async () => {
    const user = setup()
    render(<Combobox aria-label="Team" options={teams} />)
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
        <Combobox aria-label="Team" options={teams} />
      </div>,
    )
    await user.click(combobox())
    expect(screen.getByTestId('scope')).toContainElement(listbox())
  })

  it('works with fake timers too (live region uses setTimeout)', () => {
    vi.useFakeTimers()
    try {
      render(<Combobox aria-label="Team" options={teams} defaultOpen />)
      act(() => {
        vi.advanceTimersByTime(600)
      })
      expect(screen.getByRole('status')).toHaveTextContent('6 options available')
    } finally {
      vi.useRealTimers()
    }
  })
})
