import { Inline, StatusDot } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={5}>
      <StatusDot tone="positive" label="Good service" />
      <StatusDot tone="caution" label="Minor delays" />
      <StatusDot tone="critical" label="Suspended" />
      <StatusDot tone="neutral" label="Not running today" />
      <StatusDot tone="info" label="Planned works" labelHidden size="sm" />
    </Inline>
  )
}
