import { Inline, Text, VisuallyHidden } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={2}>
      <Text numeric weight="strong">
        4.2
      </Text>
      <Text tone="muted" aria-hidden="true">
        ★
      </Text>
      <VisuallyHidden>out of 5, from 318 passenger reviews</VisuallyHidden>
    </Inline>
  )
}
