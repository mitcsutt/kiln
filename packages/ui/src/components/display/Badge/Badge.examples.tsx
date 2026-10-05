import { Badge, Inline, Stack } from '@mitcsutt/kiln-ui'

const TONES = ['neutral', 'accent', 'positive', 'caution', 'critical', 'info'] as const

export function Usage() {
  return (
    <Stack gap={3}>
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <Inline key={variant} gap={2}>
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant}>
              {tone}
            </Badge>
          ))}
        </Inline>
      ))}
      <Inline gap={2}>
        <Badge tone="positive" dot>
          Live
        </Badge>
        <Badge tone="critical" size="sm">
          3 delayed
        </Badge>
      </Inline>
    </Stack>
  )
}
