import type { Meta, StoryObj } from '@storybook/react-vite'
import { useOptions } from '@mitcsutt/kiln-forms'
import { Input, List, Spinner, Stack, Text, TextField } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import type { OptionsLoader } from '#hooks'

const meta = {
  title: 'Forms/Hooks/useOptions',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const STATIONS = [
  'Abbey Road',
  'Bank',
  'Brixton',
  'Canada Water',
  'Elephant and Castle',
  'Kentish Town',
  'Liverpool Street',
  'Lisson Grove',
  'Mile End',
  'Wapping',
]

/** Stands in for a search endpoint: honours the abort signal, like a real `fetch`. */
const searchStations: OptionsLoader<string> = ({ query, signal }) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      resolve(
        STATIONS.filter((s) => s.toLowerCase().includes(q)).map((s) => ({ value: s, label: s })),
      )
    }, 200)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Superseded by a newer search', 'AbortError'))
    })
  })

function StationSearch() {
  const [query, setQuery] = useState('')
  const { options, status } = useOptions(searchStations, { query, minQueryLength: 2 })
  return (
    <Stack gap={5}>
      <TextField
        label="Station"
        description="Type two letters or more."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
        }}
      />
      <Text size="sm" tone="muted" aria-live="polite">
        {status === 'loading' ? 'Searching…' : `${String(options.length)} stations`}
      </Text>
      <List aria-label="Matching stations" density="compact">
        {options.map((option) => (
          <List.Item key={option.value}>
            <List.Content>{option.label}</List.Content>
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}

/** A debounced, cached, abortable option loader. Type "li" to search. */
export const Playground: Story = {
  render: () => <StationSearch />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.type(canvas.getByLabelText('Station'), 'li')
    await expect(await canvas.findByText('Liverpool Street')).toBeInTheDocument()
    await expect(canvas.getByText('Lisson Grove')).toBeInTheDocument()
    await expect(canvas.queryByText('Wapping')).not.toBeInTheDocument()
  },
}

const STOPS = ['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Northpoint Library', 'Old Quay']

async function searchStops({ query, signal }: { query: string; signal: AbortSignal }) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 300)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded'))
    })
  })
  return STOPS.filter((stop) => stop.toLowerCase().includes(query.toLowerCase())).map((stop) => ({
    value: stop,
    label: stop,
  }))
}

/**
 * The loader is called with `{ query, values, signal }` and returns options. It's read through a
 * ref, so an inline loader with a new identity each render doesn't refetch; change `deps` to
 * reload. `status` is `idle`, `loading`, `ready` or `error`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [query, setQuery] = useState('')
    const { options, status } = useOptions(searchStops, { query, minQueryLength: 1 })
    return (
      <Stack gap={3}>
        <Input
          aria-label="Search stops"
          placeholder="Search stops"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
          }}
          trailing={status === 'loading' ? <Spinner size="sm" label="Searching" /> : undefined}
        />
        {status === 'ready' && options.length === 0 ? (
          <Text tone="muted">No stops match.</Text>
        ) : null}
        <List density="compact">
          {options.map((option) => (
            <List.Item key={option.value}>{option.label}</List.Item>
          ))}
        </List>
      </Stack>
    )
  },
}
