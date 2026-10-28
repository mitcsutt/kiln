import { Sparkline } from '@mitcsutt/kiln-charts'
import { DragHandle } from '@mitcsutt/kiln-dnd'
import {
  Card,
  Flash,
  Inline,
  LiveIndicator,
  Meter,
  Numeral,
  Progress,
  RelativeTime,
  Stack,
  StatusDot,
  Text,
} from '@mitcsutt/kiln-ui'

import type { Kiln, KilnStatus } from '#features/firings/data/kilns'

const STATUS: Record<
  KilnStatus,
  { tone: 'positive' | 'info' | 'neutral' | 'critical'; label: string }
> = {
  firing: { tone: 'positive', label: 'Firing' },
  cooling: { tone: 'info', label: 'Cooling' },
  idle: { tone: 'neutral', label: 'Idle' },
  fault: { tone: 'critical', label: 'Fault' },
}

/** One kiln at a glance: live temperature, how far through the firing, and the last half hour. */
export function KilnCard({ kiln, temperature }: { kiln: Kiln; temperature: number }) {
  const status = STATUS[kiln.status]
  return (
    <Card variant={kiln.status === 'firing' ? 'live' : 'outline'} padding={4}>
      <Stack gap={3}>
        <Inline gap={2} align="center" justify="between">
          <Text weight="strong">{kiln.name}</Text>
          <DragHandle />
        </Inline>
        <Inline gap={3} align="center">
          <Flash value={kiln.status}>
            <StatusDot tone={status.tone} label={status.label} />
          </Flash>
          {kiln.status === 'firing' ? <LiveIndicator label="Live" size="sm" /> : null}
        </Inline>
        <Inline gap={1} align="baseline">
          <Numeral value={temperature} size="2xl" />
          <Text tone="muted">°C</Text>
        </Inline>
        <Meter
          label="Temperature"
          value={temperature}
          max={kiln.maxTemperature}
          high={kiln.maxTemperature - 100}
          optimum={0}
          valueLabel={
            kiln.status === 'firing' && kiln.setpoint
              ? `Heading for ${String(kiln.setpoint)}°C`
              : 'No setpoint'
          }
        />
        <Progress
          label={kiln.cone ? `Cone ${String(kiln.cone)} programme` : 'No programme'}
          value={kiln.progress}
          showValue
          size="sm"
        />
        <Sparkline
          data={kiln.recent}
          label={`${kiln.name}, last twelve readings`}
          color={kiln.status === 'cooling' ? 'cat-2' : 'cat-1'}
        />
        {kiln.startedAt ? (
          <Text size="xs" tone="muted">
            <RelativeTime date={kiln.startedAt} prefix="Started" />
          </Text>
        ) : null}
      </Stack>
    </Card>
  )
}
