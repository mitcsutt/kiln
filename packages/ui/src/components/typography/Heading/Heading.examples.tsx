import { Heading, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <Heading level={2} size="display-sm">
        Summer timetable
      </Heading>
      <Heading level={3}>Coastal line</Heading>
      <Heading level={4} tone="muted">
        Weekend services
      </Heading>
    </Stack>
  )
}

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

export function Sizes() {
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
