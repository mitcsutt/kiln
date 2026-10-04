'use client'

import { Quote, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={6}>
      <Quote cite="Marta Lindqvist, commuter since 2009">
        The 07:10 ferry is the only meeting I have never once been late for.
      </Quote>
      <Quote size="sm" cite="Harbour Gazette" citeUrl="https://example.com">
        A timetable you can read at a glance from the back of a crowded pier.
      </Quote>
    </Stack>
  )
}
