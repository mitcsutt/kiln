'use client'

import { Rating, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={4}>
      <Rating aria-label="Rate your crossing" defaultValue={4} clearable />
      <Rating aria-label="Rate the café" defaultValue={3} max={5} size="sm" readOnly />
    </Stack>
  )
}
