'use client'

import { CheckboxField, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <CheckboxField label="Email me my receipts" defaultChecked />
      <CheckboxField
        label="I've read the terms of carriage"
        description="Including the rules for bikes and dogs."
        required
        error="Accept the terms to book"
      />
    </Stack>
  )
}
