import { Heatmap, TimeSeries } from '@mitcsutt/kiln-charts'
import { DragHandle, GridLayout } from '@mitcsutt/kiln-dnd'
import { Alert, Card, Inline, Page, Stack, Text } from '@mitcsutt/kiln-ui'

import { PageHeader } from '#components/PageHeader'
import type { KilnRoom as KilnRoomData } from '#features/firings/data/kilns'

import { ControllerLog } from './components/ControllerLog'
import { ControllerPanel } from './components/ControllerPanel'
import { HeatZones } from './components/HeatZones'
import { KilnCard } from './components/KilnCard'
import { useLiveReadings } from './hooks/useLiveReadings'

const LAYOUT = [
  { i: 'k1', x: 0, y: 0, w: 4, h: 3 },
  { i: 'k2', x: 4, y: 0, w: 4, h: 3 },
  { i: 'k3', x: 8, y: 0, w: 4, h: 3 },
  { i: 'curve', x: 0, y: 3, w: 8, h: 4 },
  { i: 'zones', x: 8, y: 3, w: 4, h: 4 },
  { i: 'controller', x: 0, y: 7, w: 5, h: 6 },
  { i: 'usage', x: 5, y: 7, w: 7, h: 3 },
  { i: 'log', x: 5, y: 10, w: 7, h: 3 },
]

/** The kiln room, live: drag the panels into the order your shift needs. */
export function KilnRoom({ room }: { room: KilnRoomData }) {
  const readings = useLiveReadings(room.kilns)
  return (
    <Page>
      <PageHeader
        kicker="Kiln room"
        title="Live firings"
        description="Temperatures update every two seconds. Panels move by drag, or by keyboard from their handles."
        theme="flightdeck"
      />
      <Alert tone="caution" title="Kiln 2 is behind its plan">
        It&apos;s 52°C under the planned curve at 09:30. Check the bottom element before the next
        segment.
      </Alert>
      <GridLayout label="Kiln room panels" defaultLayout={LAYOUT} columns={{ base: 1, sm: 12 }}>
        {room.kilns.map((kiln) => {
          const reading = readings[kiln.id]
          return (
            <GridLayout.Item key={kiln.id} id={kiln.id} label={kiln.name}>
              <KilnCard
                kiln={{ ...kiln, status: reading?.status ?? kiln.status }}
                temperature={reading?.temperature ?? kiln.temperature}
              />
            </GridLayout.Item>
          )
        })}
        <GridLayout.Item id="curve" label="Firing curve">
          <Card variant="outline" padding={4}>
            <Stack gap={3}>
              <Inline justify="between" align="center">
                <Text weight="strong">Kiln 2 firing curve</Text>
                <DragHandle />
              </Inline>
              <TimeSeries
                data={room.curve.map((point) => ({ ...point }))}
                x="time"
                label="Kiln 2, planned and actual temperature"
                series={[
                  { key: 'actual', label: 'Actual' },
                  { key: 'planned', label: 'Planned', variant: 'dashed', color: 'neutral' },
                ]}
                height={220}
              />
            </Stack>
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="zones" label="Zones">
          <Card variant="outline" padding={4}>
            <Stack gap={3}>
              <Inline justify="between" align="center">
                <Text weight="strong">Zones</Text>
                <DragHandle />
              </Inline>
              <HeatZones />
            </Stack>
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="controller" label="Controller">
          <ControllerPanel />
        </GridLayout.Item>
        <GridLayout.Item id="usage" label="Kiln use">
          <Card variant="outline" padding={4}>
            <Stack gap={3}>
              <Inline justify="between" align="center">
                <Text weight="strong">Firings by day, last four weeks</Text>
                <DragHandle />
              </Inline>
              <Heatmap
                data={room.usage.map((cell) => ({ ...cell }))}
                x="day"
                pivot={{ by: 'slot', value: 'firings' }}
                columns={['Night', 'Morning', 'Afternoon', 'Evening']}
                label="Firings by day and time of day"
              />
            </Stack>
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="log" label="Controller frame">
          <ControllerLog log={room.log} />
        </GridLayout.Item>
      </GridLayout>
    </Page>
  )
}
