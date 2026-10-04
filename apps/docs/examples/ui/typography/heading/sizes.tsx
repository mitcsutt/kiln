'use client'

import { Heading, Stack } from '@mitcsutt/kiln-ui'

const SIZES = [
  'display-lg',
  'display-md',
  'display-sm',
  '3xl',
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
] as const

export default function Sizes() {
  return (
    <Stack gap={3}>
      {SIZES.map((size) => (
        <Heading key={size} level={3} size={size}>
          {size}: High water 06:42
        </Heading>
      ))}
    </Stack>
  )
}
