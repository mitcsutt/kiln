import { Delta, Inline } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={5}>
      <Delta direction="up" tone="positive">
        12%
      </Delta>
      <Delta direction="down" tone="critical">
        3 sailings
      </Delta>
      <Delta direction="down" tone="positive">
        4 min delay
      </Delta>
      <Delta direction="flat">No change</Delta>
    </Inline>
  )
}
