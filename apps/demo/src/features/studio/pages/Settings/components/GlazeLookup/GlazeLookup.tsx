import { useOptions } from '@mitcsutt/kiln-forms'
import { Input, List, SearchIcon, Spinner, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { searchGlazes } from '#features/studio/data/members'

const loadGlazes = async ({ query }: { query: string }) =>
  (await searchGlazes(query)).map((glaze) => ({ ...glaze }))

/** A quick search outside any form: `useOptions` debounces, caches and cancels for us. */
export function GlazeLookup() {
  const [query, setQuery] = useState('')
  const { options, status } = useOptions(loadGlazes, { query, minQueryLength: 1 })
  return (
    <Stack gap={3}>
      <Input
        aria-label="Search the glaze shelf"
        placeholder="Search the glaze shelf"
        leading={<SearchIcon />}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
        }}
        trailing={status === 'loading' ? <Spinner size="sm" label="Searching" /> : undefined}
      />
      {status === 'ready' && options.length === 0 ? (
        <Text tone="muted">No glaze by that name.</Text>
      ) : null}
      <List density="compact">
        {options.map((option) => (
          <List.Item key={option.value}>
            <List.Content>
              {option.label}
              <List.Description>{option.description}</List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Stack>
  )
}
