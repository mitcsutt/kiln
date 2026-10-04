'use client'

import { useOptions } from '@mitcsutt/kiln-forms'
import { Input, List, Spinner, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

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

export default function Usage() {
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
}
