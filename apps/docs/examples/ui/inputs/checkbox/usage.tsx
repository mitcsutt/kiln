'use client'

import { Checkbox, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const LEGS = ['Harbour Square to Kelso Bay', 'Kelso Bay to Marram Point']

export default function Usage() {
  const [chosen, setChosen] = useState<string[]>([LEGS[0] ?? ''])
  const all = chosen.length === LEGS.length
  return (
    <Stack gap={3}>
      <Inline gap={3}>
        <Checkbox
          aria-label="Select both legs"
          checked={all ? true : chosen.length ? 'indeterminate' : false}
          onCheckedChange={() => {
            setChosen(all ? [] : LEGS)
          }}
        />
        <Text weight="medium">Both legs</Text>
      </Inline>
      {LEGS.map((leg) => (
        <Inline key={leg} gap={3}>
          <Checkbox
            aria-label={leg}
            checked={chosen.includes(leg)}
            onCheckedChange={(checked) => {
              setChosen((current) =>
                checked === true ? [...current, leg] : current.filter((item) => item !== leg),
              )
            }}
          />
          <Text>{leg}</Text>
        </Inline>
      ))}
    </Stack>
  )
}
