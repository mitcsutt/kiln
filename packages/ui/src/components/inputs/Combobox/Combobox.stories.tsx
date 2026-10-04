import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { useEffect, useState } from 'react'
import { Stack } from '#components/layout/Stack'
import { filterOptions } from '#components/inputs/internal/filterOptions'
import { Combobox, type ComboboxOption } from './Combobox'
import { projectLabels, clients, countries } from './storyData'

const meta = {
  title: 'UI/Inputs/Combobox',
  component: Combobox,
  args: {
    'aria-label': 'Country',
    options: countries,
    placeholder: 'Search countries',
    clearable: true,
    disabled: false,
    invalid: false,
    size: 'md',
  },
  argTypes: { options: { control: false } },
  render: (args) => (
    <Stack style={{ maxInlineSize: '24rem' }}>
      <Combobox {...args} />
    </Stack>
  ),
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

/** Type "usa", "holland" or "cote" — keywords and accents both match. */
/** Type to filter, then pick: the input shows the chosen option's label. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const input = within(storyRoot(canvasElement)).getByRole('combobox', { name: 'Country' })
    await userEvent.type(input, 'zeal')
    await userEvent.click(await screen.findByRole('option', { name: /New Zealand/ }))
    await expect(input).toHaveValue('New Zealand')
  },
}

export const Country: Story = {
  args: { defaultValue: 'aus' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={3} style={{ maxInlineSize: '24rem' }}>
      <Combobox {...args} aria-label="Country, small" size="sm" />
      <Combobox {...args} aria-label="Country, medium" size="md" />
      <Combobox {...args} aria-label="Country, large" size="lg" />
    </Stack>
  ),
}

export const Invalid: Story = {
  args: { invalid: true },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'nzl' },
}

/** Chosen values become chips; Backspace on an empty box removes the last one. */
export const Multiple: Story = {
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <Combobox
        aria-label="Countries you ship to"
        options={args.options}
        size={args.size}
        multiple
        maxSelected={4}
        placeholder="Up to four countries"
        defaultValue={['aus', 'nzl']}
      />
    </Stack>
  ),
}

/** Free text is allowed: anything typed becomes a label when you press Enter or move on. */
export const CreatableLabels: Story = {
  render: (args) => (
    <Stack style={{ maxInlineSize: '28rem' }}>
      <Combobox
        aria-label="Labels"
        options={projectLabels}
        size={args.size}
        multiple
        creatable
        placeholder="Add or create a label"
        defaultValue={['design']}
      />
    </Stack>
  ),
}

/* A fake server: filters, then answers after a delay. */
function searchClients(query: string, signal: AbortSignal): Promise<readonly ComboboxOption[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(filterOptions(clients, query).slice(0, 8))
    }, 600)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

function AsyncClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    query: string
    options: readonly ComboboxOption[]
  } | null>(null)
  const [client, setClient] = useState<string | null>(null)
  const searchable = query.trim().length >= 2

  useEffect(() => {
    if (!searchable) return
    const controller = new AbortController()
    const debounce = setTimeout(() => {
      searchClients(query, controller.signal)
        .then((found) => {
          setResults({ query, options: found })
        })
        .catch(() => undefined)
    }, 250)
    return () => {
      clearTimeout(debounce)
      controller.abort()
    }
  }, [query, searchable])

  // Results belong to the query they answered; anything else is still loading.
  const options = searchable && results?.query === query ? results.options : []
  const loading = searchable && results?.query !== query

  return (
    <Stack gap={2} style={{ maxInlineSize: '24rem' }}>
      <Combobox
        aria-label="Client"
        options={options}
        filter="none"
        loading={loading}
        loadingMessage="Searching clients…"
        emptyMessage={searchable ? 'No client by that name' : 'Type two letters to search'}
        creatable
        clearable
        placeholder="Who are you billing?"
        value={client}
        onValueChange={setClient}
        onInputValueChange={setQuery}
      />
    </Stack>
  )
}

/** Async-ready: `filter="none"`, `loading`, and the loader's results as `options`. */
export const Client: Story = {
  render: () => <AsyncClient />,
}
