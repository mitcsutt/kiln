import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Button,
  CalendarIcon,
  ClockIcon,
  CommandPalette,
  MoonIcon,
  PlusIcon,
  Stack,
  Text,
  UsersIcon,
  type CommandAction,
} from '@mitcsutt/kiln-ui'
import { useEffect, useState } from 'react'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Stage } from '#components/overlays/_story/StoryKit'

const noop = () => undefined

// The search box keeps focus and drives the list (aria-activedescendant), scrolling the
// highlighted row into view, so the results never need a tab stop of their own. axe sees a
// scrolling region with nothing focusable in it, so this rule is off for the open stories whose
// results outgrow their stage.
const resultsScroll = {
  a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
}

const ACTIONS: CommandAction[] = [
  { id: 'invoices', label: 'Invoices', group: 'Pages', icon: <CalendarIcon />, onSelect: noop },
  {
    id: 'clients',
    label: 'Clients',
    group: 'Pages',
    description: '42 active accounts',
    icon: <UsersIcon />,
    onSelect: noop,
  },
  { id: 'timesheets', label: 'Timesheets', group: 'Pages', icon: <ClockIcon />, onSelect: noop },
  {
    id: 'new-invoice',
    label: 'New invoice',
    group: 'Actions',
    keywords: ['bill', 'create'],
    shortcut: 'mod+i',
    icon: <PlusIcon />,
    onSelect: noop,
  },
  {
    id: 'dark-mode',
    label: 'Toggle dark mode',
    group: 'Actions',
    keywords: ['theme', 'night'],
    shortcut: 'mod+shift+l',
    icon: <MoonIcon />,
    onSelect: noop,
  },
  {
    id: 'export',
    label: 'Export ledger as CSV',
    group: 'Actions',
    description: 'Everything from 1 July to today',
    onSelect: noop,
  },
  {
    id: 'close-year',
    label: 'Close the financial year',
    group: 'Actions',
    description: 'Opens on 1 July',
    disabled: true,
  },
  {
    id: 'switch-project',
    label: 'Switch project',
    group: 'Actions',
    placeholder: 'Search projects',
    actions: [
      { id: 'harbour', label: 'Harbour Square refit', description: 'Delft & Rowe', onSelect: noop },
      { id: 'kelso', label: 'Kelso Bay pier', description: 'Kelso Council', onSelect: noop },
      {
        id: 'marram',
        label: 'Marram Point visitor centre',
        description: 'Coastal Trust',
        onSelect: noop,
      },
    ],
  },
]

const meta = {
  title: 'UI/Overlays/CommandPalette',
  component: CommandPalette,
  args: {
    actions: ACTIONS,
    label: 'Command palette',
    placeholder: 'Search pages and actions',
    emptyMessage: 'Nothing matches that',
    shortcut: 'mod+k',
  },
  argTypes: { actions: { control: false } },
} satisfies Meta<typeof CommandPalette>

export default meta
type Story = StoryObj<typeof meta>

/** Click the button or press Ctrl-K (Command-K on a Mac), type "dark" and press Enter. */
export const Playground: Story = {
  render: (args) => (
    <CommandPalette
      {...args}
      trigger={
        <Button variant="outline" tone="neutral">
          Search
        </Button>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(storyRoot(canvasElement)).getByRole('button', { name: 'Search' })
    await userEvent.click(trigger)
    const input = await screen.findByRole('combobox', { name: 'Command palette' })
    await expect(input).toHaveFocus()
    await userEvent.type(input, 'dark')
    const option = screen.getByRole('option', { name: 'Toggle dark mode' })
    await expect(option).toHaveAttribute('aria-selected', 'true')
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** Open, grouped, with icons, descriptions, shortcuts and a disabled action. */
export const Open: Story = {
  render: (args) => (
    <Stage size="lg">
      {(container) => (
        <CommandPalette {...args} shortcut={undefined} container={container} defaultOpen />
      )}
    </Stage>
  ),
}

/** A search that matches mid-label marks the word it matched. */
export const Searching: Story = {
  render: (args) => (
    <Stage>
      {(container) => (
        <CommandPalette
          {...args}
          shortcut={undefined}
          container={container}
          defaultOpen
          defaultQuery="inv"
        />
      )}
    </Stage>
  ),
}

/** Enter on "Switch project" opens its page; Backspace in the empty box goes back. */
export const NestedPage: Story = {
  parameters: resultsScroll,
  render: (args) => (
    <Stage>
      {(container) => (
        <CommandPalette {...args} shortcut={undefined} container={container} defaultOpen />
      )}
    </Stage>
  ),
  play: async () => {
    const input = await screen.findByRole('combobox', { name: 'Command palette' })
    await userEvent.type(input, 'switch')
    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveAccessibleName('Switch project')
    // The panel fades in from opacity 0, so wait out the entry animation.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Back' })).toBeVisible())
    await expect(screen.getAllByRole('option')).toHaveLength(3)
    await userEvent.keyboard('{Backspace}')
    await expect(input).toHaveAccessibleName('Command palette')
  },
}

export const NothingMatches: Story = {
  render: (args) => (
    <Stage>
      {(container) => (
        <CommandPalette
          {...args}
          shortcut={undefined}
          container={container}
          defaultOpen
          defaultQuery="payroll"
        />
      )}
    </Stage>
  ),
}

export const Loading: Story = {
  render: (args) => (
    <Stage>
      {(container) => (
        <CommandPalette
          {...args}
          actions={[]}
          filter="none"
          loading
          loadingMessage="Searching invoices…"
          shortcut={undefined}
          container={container}
          defaultOpen
          defaultQuery="north"
        />
      )}
    </Stage>
  ),
}

/** Recent actions sit above the rest while the search is empty. */
export const WithRecent: Story = {
  parameters: resultsScroll,
  render: (args) => (
    <Stage>
      {(container) => (
        <CommandPalette
          {...args}
          recent={['kelso', 'export']}
          shortcut={undefined}
          container={container}
          defaultOpen
        />
      )}
    </Stage>
  ),
}

/* ─── Docs ───────────────────────────────────────────────────────────────── */

/**
 * Give it the actions and a way to open it: a `trigger` button, a page-wide `shortcut`, or both.
 * Here Control-K (Command-K on a Mac) opens it too. Actions with a `group` are listed under that
 * heading, and each action's `shortcut` is shown beside it.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [last, setLast] = useState('Nothing yet')
    const run = (label: string) => () => {
      setLast(label)
    }
    return (
      <Stack gap={3}>
        <CommandPalette
          shortcut="mod+k"
          placeholder="Search pages and actions"
          trigger={
            <Button variant="outline" tone="neutral">
              Search
            </Button>
          }
          actions={[
            { id: 'invoices', label: 'Invoices', group: 'Pages', onSelect: run('Invoices') },
            { id: 'clients', label: 'Clients', group: 'Pages', onSelect: run('Clients') },
            {
              id: 'new-invoice',
              label: 'New invoice',
              group: 'Actions',
              keywords: ['bill'],
              shortcut: 'mod+i',
              onSelect: run('New invoice'),
            },
            {
              id: 'dark-mode',
              label: 'Toggle dark mode',
              group: 'Actions',
              keywords: ['theme'],
              shortcut: 'mod+shift+l',
              onSelect: run('Toggle dark mode'),
            },
          ]}
        />
        <Text size="sm">Last run: {last}</Text>
      </Stack>
    )
  },
}

/**
 * An action with its own `actions` opens them as a page, for a choice that needs a second step.
 * Backspace in an empty search box, Escape or the back button returns to the top.
 */
export const NestedPages: Story = {
  tags: ['docs'],
  render: function NestedPages() {
    const [project, setProject] = useState('Harbour Square refit')
    const projects = ['Harbour Square refit', 'Kelso Bay pier', 'Marram Point visitor centre']
    return (
      <Stack gap={3}>
        <CommandPalette
          trigger={
            <Button variant="outline" tone="neutral">
              Open palette
            </Button>
          }
          actions={[
            {
              id: 'switch-project',
              label: 'Switch project',
              placeholder: 'Search projects',
              actions: projects.map((name) => ({
                id: name,
                label: name,
                onSelect: () => {
                  setProject(name)
                },
              })),
            },
            { id: 'timesheets', label: 'Timesheets', onSelect: () => undefined },
          ]}
        />
        <Text size="sm">Current project: {project}</Text>
      </Stack>
    )
  },
}

const RECORDS = [
  { id: 'inv-1042', label: 'INV-1042', description: 'Northwind Studio, $1,820.00' },
  { id: 'inv-1043', label: 'INV-1043', description: 'Delft & Rowe, $4,310.00' },
  { id: 'inv-1044', label: 'INV-1044', description: 'Kelso Council, $12,900.00' },
  { id: 'inv-1045', label: 'INV-1045', description: 'Northwind Studio, $640.00' },
]

/**
 * For results from your own search, pass `filter="none"`, set `loading` while you fetch, and
 * pass what comes back as `actions`. Here a pretend server searches invoices by client.
 */
export const ResultsFromAServer: Story = {
  tags: ['docs'],
  render: function ResultsFromAServer() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<{ query: string; actions: CommandAction[] }>({
      query: '',
      actions: [],
    })
    useEffect(() => {
      const timer = setTimeout(() => {
        const text = query.trim().toLowerCase()
        setResults({
          query,
          actions: RECORDS.filter(
            (record) =>
              text !== '' && `${record.label} ${record.description}`.toLowerCase().includes(text),
          ).map((record) => ({ ...record, group: 'Invoices' })),
        })
      }, 400)
      return () => {
        clearTimeout(timer)
      }
    }, [query])
    return (
      <CommandPalette
        trigger={
          <Button variant="outline" tone="neutral">
            Find an invoice
          </Button>
        }
        placeholder="Search invoices by number or client"
        filter="none"
        query={query}
        onQueryChange={setQuery}
        loading={query.trim() !== '' && results.query !== query}
        loadingMessage="Searching invoices…"
        emptyMessage={
          query.trim() === '' ? 'Type a client or an invoice number' : 'No invoices match'
        }
        actions={results.query === query ? results.actions : []}
      />
    )
  },
}

/**
 * `recent` lists actions by id above the rest while the search is empty. Record each one in
 * `onAction`, and keep the list wherever suits your app.
 */
export const RecentActions: Story = {
  tags: ['docs'],
  render: function RecentActions() {
    const [recent, setRecent] = useState<string[]>(['clients'])
    return (
      <CommandPalette
        trigger={
          <Button variant="outline" tone="neutral">
            Open palette
          </Button>
        }
        recent={recent}
        onAction={(action) => {
          setRecent((ids) => [action.id, ...ids.filter((id) => id !== action.id)].slice(0, 3))
        }}
        actions={[
          { id: 'invoices', label: 'Invoices', group: 'Pages' },
          { id: 'clients', label: 'Clients', group: 'Pages' },
          { id: 'timesheets', label: 'Timesheets', group: 'Pages' },
          { id: 'reports', label: 'Reports', group: 'Pages' },
        ]}
      />
    )
  },
}
