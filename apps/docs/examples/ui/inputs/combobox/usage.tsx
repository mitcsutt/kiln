'use client'

import { Combobox, Stack } from '@mitcsutt/kiln-ui'

const STOPS = [
  'Harbour Square',
  'Kelso Bay Pier',
  'Marram Point',
  'Northpoint Library',
  'Old Quay',
  'Ferry Lane',
  'Lifeboat Station',
].map((stop) => ({ value: stop.toLowerCase().replace(/ /g, '-'), label: stop }))

export default function Usage() {
  return (
    <Stack gap={4}>
      <Combobox aria-label="From" options={STOPS} placeholder="Type a stop" clearable />
      <Combobox
        aria-label="Favourite stops"
        options={STOPS}
        multiple
        defaultValue={['old-quay']}
        maxSelected={3}
        placeholder="Add up to three"
      />
    </Stack>
  )
}
