import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef, useState } from 'react'
import { must } from '#test/must'
import { CommandPalette, type CommandAction, type CommandPaletteProps } from './CommandPalette'

const go = vi.fn<(page: string) => void>()
const goTo = (page: string) => () => {
  go(page)
}

function makeActions(): CommandAction[] {
  return [
    { id: 'invoices', label: 'Invoices', group: 'Pages', onSelect: goTo('invoices') },
    {
      id: 'clients',
      label: 'Clients',
      group: 'Pages',
      description: '42 active accounts',
      onSelect: goTo('clients'),
    },
    {
      id: 'reports',
      label: 'Reports',
      group: 'Pages',
      keywords: ['analytics'],
      onSelect: goTo('reports'),
    },
    {
      id: 'theme',
      label: 'Toggle dark mode',
      group: 'Settings',
      keywords: ['theme'],
      shortcut: 'mod+shift+l',
      onSelect: goTo('theme'),
    },
    { id: 'archive', label: 'Archive workspace', group: 'Settings', disabled: true },
    {
      id: 'switch',
      label: 'Switch project',
      group: 'Settings',
      placeholder: 'Search projects',
      actions: [
        { id: 'harbour', label: 'Harbour Square refit', onSelect: goTo('harbour') },
        { id: 'kelso', label: 'Kelso Bay pier', onSelect: goTo('kelso') },
      ],
    },
  ]
}

function Palette(props: Partial<CommandPaletteProps>) {
  return (
    <CommandPalette
      actions={makeActions()}
      trigger={<button type="button">Search</button>}
      {...props}
    />
  )
}

async function openPalette() {
  await userEvent.click(screen.getByRole('button', { name: 'Search' }))
  return screen.getByRole('combobox')
}

const visibleLabels = () =>
  screen.getAllByRole('option').map((option) => option.getAttribute('aria-label'))

beforeEach(() => {
  go.mockClear()
})

describe('CommandPalette', () => {
  it('opens from the trigger as a named dialog with focus in the search box', async () => {
    render(<Palette />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const input = await openPalette()
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    expect(input).toHaveFocus()
    expect(input).toHaveAccessibleName('Command palette')
    expect(input).toHaveAttribute('placeholder', 'Search')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
  })

  it('lists actions in labelled groups, in order', async () => {
    render(<Palette />)
    await openPalette()
    const groups = within(screen.getByRole('listbox')).getAllByRole('group')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAccessibleName('Pages')
    expect(groups[1]).toHaveAccessibleName('Settings')
    expect(visibleLabels()).toEqual([
      'Invoices',
      'Clients',
      'Reports',
      'Toggle dark mode',
      'Archive workspace',
      'Switch project',
    ])
  })

  it('filters and ranks like Combobox, marking the matched text', async () => {
    render(<Palette />)
    const input = await openPalette()
    await userEvent.type(input, 'analytics')
    expect(visibleLabels()).toEqual(['Reports'])
    await userEvent.clear(input)
    await userEvent.type(input, 'mode')
    expect(visibleLabels()).toEqual(['Toggle dark mode'])
    const mark = must(screen.getByRole('option').querySelector('mark'))
    expect(mark).toHaveTextContent('mode')
    // A description match lists the action without marking the label.
    await userEvent.clear(input)
    await userEvent.type(input, 'active accounts')
    expect(visibleLabels()).toEqual(['Clients'])
    const description = screen.getByRole('option')
    expect(description.querySelector('mark')).toBeNull()
  })

  it('highlights the first result, so Enter runs the best match and closes', async () => {
    const onAction = vi.fn()
    render(<Palette onAction={onAction} />)
    const trigger = screen.getByRole('button', { name: 'Search' })
    const input = await openPalette()
    await userEvent.type(input, 'cli')
    const option = screen.getByRole('option', { name: 'Clients' })
    expect(option).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', option.id)
    await userEvent.keyboard('{Enter}')
    expect(go).toHaveBeenCalledWith('clients')
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'clients' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('moves with the arrow keys, Home and End, wrapping and skipping disabled actions', async () => {
    render(<Palette />)
    const input = await openPalette()
    const active = () =>
      must(document.getElementById(must(input.getAttribute('aria-activedescendant')))).textContent
    expect(active()).toBe('Invoices')
    await userEvent.keyboard('{ArrowUp}')
    expect(active()).toMatch(/^Switch project/)
    await userEvent.keyboard('{ArrowUp}')
    // "Archive workspace" is disabled, so it's skipped.
    expect(active()).toMatch(/^Toggle dark mode/)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(active()).toBe('Invoices')
    await userEvent.keyboard('{End}')
    expect(active()).toMatch(/^Switch project/)
    await userEvent.keyboard('{Home}')
    expect(active()).toBe('Invoices')
    expect(screen.getByRole('option', { name: 'Archive workspace' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('runs an action on click, but never a disabled one', async () => {
    render(<Palette />)
    await openPalette()
    await userEvent.click(screen.getByRole('option', { name: 'Archive workspace' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('option', { name: 'Reports' }))
    expect(go).toHaveBeenCalledWith('reports')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows an action’s shortcut as keys, and reads it as the description', async () => {
    render(<Palette />)
    await openPalette()
    const option = screen.getByRole('option', { name: 'Toggle dark mode' })
    // jsdom isn't an Apple platform, so `mod` is Control.
    expect(option).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+L')
    expect(option).toHaveAccessibleDescription('Control Shift L')
    expect(Array.from(option.querySelectorAll('kbd')).map((kbd) => kbd.textContent)).toEqual([
      'Ctrl',
      'Shift',
      'L',
    ])
    expect(screen.getByRole('option', { name: 'Clients' })).toHaveAccessibleDescription(
      '42 active accounts',
    )
  })

  it('opens and closes with its page-wide shortcut, and only with the exact keys', async () => {
    render(<Palette shortcut="mod+k" />)
    await userEvent.keyboard('{Shift>}{Control>}k{/Control}{/Shift}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveFocus()
    await userEvent.keyboard('{Control>}k{/Control}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('returns focus to where it was when the shortcut opened it without a trigger', async () => {
    render(
      <>
        <input aria-label="Notes" />
        <CommandPalette shortcut="mod+k" actions={makeActions()} />
      </>,
    )
    const notes = screen.getByRole('textbox', { name: 'Notes' })
    notes.focus()
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('combobox')).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(notes).toHaveFocus()
  })

  it.each([
    ['a timer', (focus: () => void) => setTimeout(focus)],
    ['an animation frame', (focus: () => void) => requestAnimationFrame(focus)],
  ])('leaves focus where an action moved it after %s', async (_, defer) => {
    render(
      <>
        <input aria-label="Notes" />
        <input aria-label="Comment" />
        <CommandPalette
          shortcut="mod+k"
          actions={[
            {
              id: 'comment',
              label: 'Add comment',
              onSelect: () => {
                defer(() => {
                  screen.getByRole('textbox', { name: 'Comment' }).focus()
                })
              },
            },
          ]}
        />
      </>,
    )
    screen.getByRole('textbox', { name: 'Notes' }).focus()
    await userEvent.keyboard('{Control>}k{/Control}')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveFocus()
    })
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.getByRole('textbox', { name: 'Comment' })).toHaveFocus()
  })

  it('has no page-wide shortcut unless asked', async () => {
    render(<Palette />)
    await userEvent.keyboard('{Control>}k{/Control}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens a nested page, and returns with Backspace, Escape or the back button', async () => {
    render(<Palette />)
    const input = await openPalette()
    await userEvent.type(input, 'switch')
    await userEvent.keyboard('{Enter}')
    expect(input).toHaveValue('')
    expect(input).toHaveAccessibleName('Switch project')
    expect(input).toHaveAttribute('placeholder', 'Search projects')
    expect(visibleLabels()).toEqual(['Harbour Square refit', 'Kelso Bay pier'])

    // Backspace only goes back once the search is empty.
    await userEvent.type(input, 'k')
    await userEvent.keyboard('{Backspace}')
    expect(input).toHaveAccessibleName('Switch project')
    await userEvent.keyboard('{Backspace}')
    expect(input).toHaveAccessibleName('Command palette')

    // Escape on a page goes back a level instead of closing.
    await userEvent.click(screen.getByRole('option', { name: 'Switch project' }))
    expect(input).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(input).toHaveAccessibleName('Command palette')
    expect(input).toHaveFocus()

    await userEvent.click(screen.getByRole('option', { name: 'Switch project' }))
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(input).toHaveAccessibleName('Command palette')
    expect(input).toHaveFocus()

    // A nested action runs like any other.
    await userEvent.click(screen.getByRole('option', { name: 'Switch project' }))
    await userEvent.type(input, 'kelso{Enter}')
    expect(go).toHaveBeenCalledWith('kelso')
  })

  it('lists a nested page from the current actions, so results arriving later show up', async () => {
    const withProjects = (projects: CommandAction[]): CommandAction[] => [
      { id: 'invoices', label: 'Invoices' },
      { id: 'switch', label: 'Switch project', actions: projects },
    ]
    const { rerender } = render(<Palette actions={withProjects([])} filter="none" loading />)
    const input = await openPalette()
    await userEvent.click(screen.getByRole('option', { name: 'Switch project' }))
    expect(input).toHaveAccessibleName('Switch project')
    expect(screen.queryAllByRole('option')).toHaveLength(0)

    rerender(
      <Palette
        actions={withProjects([{ id: 'kelso', label: 'Kelso Bay pier', onSelect: goTo('kelso') }])}
        filter="none"
      />,
    )
    expect(input).toHaveAccessibleName('Switch project')
    expect(visibleLabels()).toEqual(['Kelso Bay pier'])

    // When the open page's action is gone, the palette falls back to the top level.
    rerender(<Palette actions={[{ id: 'invoices', label: 'Invoices' }]} filter="none" />)
    expect(input).toHaveAccessibleName('Command palette')
    expect(visibleLabels()).toEqual(['Invoices'])
  })

  it('closes on Escape at the top level and starts fresh when it opens again', async () => {
    render(<Palette />)
    const input = await openPalette()
    await userEvent.click(screen.getByRole('option', { name: 'Switch project' }))
    await userEvent.type(input, 'har')
    await userEvent.keyboard('{Escape}{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    const again = await openPalette()
    expect(again).toHaveValue('')
    expect(again).toHaveAccessibleName('Command palette')
  })

  it('lists recent actions first while the search is empty, nested ones included', async () => {
    render(<Palette recent={['kelso', 'reports', 'gone']} />)
    await openPalette()
    const recent = screen.getByRole('group', { name: 'Recent' })
    expect(
      within(recent)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Kelso Bay pier', 'Reports'])
    // The recent row is first, so Enter runs it.
    await userEvent.keyboard('{Enter}')
    expect(go).toHaveBeenCalledWith('kelso')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    await openPalette()
    await userEvent.type(screen.getByRole('combobox'), 'rep')
    expect(screen.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument()
  })

  it('caps the results at `limit`', async () => {
    render(<Palette limit={2} />)
    await openPalette()
    expect(visibleLabels()).toEqual(['Invoices', 'Clients'])
  })

  it('says when nothing matches, and when results are loading', async () => {
    const { rerender } = render(<Palette emptyMessage="Nothing by that name" />)
    const input = await openPalette()
    await userEvent.type(input, 'zzz')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('Nothing by that name')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    rerender(<Palette actions={[]} filter="none" loading loadingMessage="Searching records…" />)
    expect(screen.getByText('Searching records…')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-busy', 'true')
    expect(screen.queryByText('Nothing by that name')).not.toBeInTheDocument()
  })

  it('lists actions as given with filter="none"', async () => {
    render(
      <Palette
        filter="none"
        actions={[
          { id: 'inv-1042', label: 'INV-1042', description: 'Northwind Studio, $1,820.00' },
        ]}
      />,
    )
    const input = await openPalette()
    await userEvent.type(input, 'northwind')
    expect(visibleLabels()).toEqual(['INV-1042'])
  })

  it('announces the result count politely after typing settles', async () => {
    render(<Palette />)
    const input = await openPalette()
    await userEvent.type(input, 'repo')
    const status = screen.getByRole('status')
    await waitFor(() => {
      expect(status).toHaveTextContent('1 result')
    })
  })

  it('can be controlled: open and query', async () => {
    const onQueryChange = vi.fn()
    function Controlled() {
      const [open, setOpen] = useState(false)
      const [query, setQuery] = useState('')
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true)
            }}
          >
            Open
          </button>
          <CommandPalette
            actions={makeActions()}
            open={open}
            onOpenChange={setOpen}
            query={query}
            onQueryChange={(next) => {
              onQueryChange(next)
              setQuery(next)
            }}
          />
          <output>{open ? `open:${query}` : 'closed'}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await userEvent.type(screen.getByRole('combobox'), 'inv')
    expect(screen.getByText('open:inv')).toBeInTheDocument()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => {
      expect(screen.getByText('closed')).toBeInTheDocument()
    })
    expect(onQueryChange).toHaveBeenLastCalledWith('')
  })

  it('forwards the ref to the dialog and spreads props onto it', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <CommandPalette
        ref={ref}
        actions={makeActions()}
        trigger={<button type="button">Search</button>}
        data-testid="palette"
        label="Go to"
      />,
    )
    await openPalette()
    const dialog = screen.getByRole('dialog', { name: 'Go to' })
    expect(ref.current).toBe(dialog)
    expect(dialog).toHaveAttribute('data-testid', 'palette')
  })

  it('opens in the theme of the trigger’s scope', async () => {
    render(
      <div data-theme="ledger" data-mode="dark">
        <Palette />
      </div>,
    )
    await openPalette()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-theme', 'ledger')
    expect(dialog).toHaveAttribute('data-mode', 'dark')
  })

  it('opens with defaultOpen and no trigger', () => {
    render(<CommandPalette actions={makeActions()} defaultOpen />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveFocus()
  })
})
