import { Amount, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={3} align="start">
      <Amount value={1234.5} />
      <Amount value={42} currency="GBP" locale="en-GB" />
      <Amount value={-86.2} currency="EUR" locale="de-DE" />
      <Amount value={-1234.5} accounting />
      <Amount value={312.75} showSign tone="auto" />
      <Amount value={2450000} compact />
      <Amount value={96} currency="GBP" locale="en-GB" size="display-sm" />
    </Stack>
  )
}
