'use client'

import { Input, SearchIcon, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <Input
        aria-label="Search stops"
        placeholder="Search stops"
        leading={<SearchIcon />}
        type="search"
      />
      <Input aria-label="Fare" numeric leading="£" trailing="GBP" placeholder="0.00" />
      <Input aria-label="Booking reference" size="sm" defaultValue="BAY-40Q" />
      <Input aria-label="Booking reference" invalid defaultValue="BAY-4" />
    </Stack>
  )
}
