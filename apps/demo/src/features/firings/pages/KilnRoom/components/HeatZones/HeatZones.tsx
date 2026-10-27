import { ChartFrame, ChartTooltip } from '@mitcsutt/kiln-charts'

const ZONES = [
  { zone: 'Top', reading: 1052 },
  { zone: 'Middle', reading: 1048 },
  { zone: 'Bottom', reading: 1031 },
]
const MAX = 1300

/**
 * A chart Kiln doesn't have: kiln 2's three thermocouples as bars inside `ChartFrame`, which still
 * gives it a label, a summary, a data table for screen readers and the theme's colours.
 */
export function HeatZones() {
  return (
    <ChartFrame
      label="Kiln 2 zones"
      summary="The bottom of kiln 2 runs 21°C cooler than the top."
      table={{ columns: ['Zone', '°C'], rows: ZONES.map((z) => [z.zone, String(z.reading)]) }}
      height={140}
      legend={
        <ChartTooltip
          title="Spread"
          items={ZONES.map((z, index) => ({
            label: z.zone,
            value: `${String(z.reading)}°C`,
            color: `cat-${String(index + 1)}` as 'cat-1',
          }))}
        />
      }
    >
      {({ width, height }) => (
        <svg width={width} height={height} aria-hidden>
          {ZONES.map((z, index) => {
            const barHeight = (z.reading / MAX) * height
            return (
              <rect
                key={z.zone}
                x={(index * width) / ZONES.length + 12}
                width={width / ZONES.length - 24}
                y={height - barHeight}
                height={barHeight}
                fill={`var(--color-cat-${String(index + 1)})`}
                stroke={`var(--color-cat-${String(index + 1)}-stroke)`}
              />
            )
          })}
        </svg>
      )}
    </ChartFrame>
  )
}
