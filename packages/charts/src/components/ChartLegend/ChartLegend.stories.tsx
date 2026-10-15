import { ChartLegend } from '@mitcsutt/kiln-charts'
import { Stack } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

const meta = {
  title: 'Charts/Building blocks/ChartLegend',
  component: ChartLegend,
  args: {
    items: [
      { key: 'online', label: 'Online', color: 'cat-1' },
      { key: 'store', label: 'In store', color: 'cat-2' },
      { key: 'phone', label: 'By phone', color: 'cat-3' },
    ],
  },
} satisfies Meta<typeof ChartLegend>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * A list of series names and colours. With `onToggleSeries`, each is a button that shows or hides
 * its series.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const [hidden, setHidden] = useState<string[]>(['phone'])
    const items = [
      { key: 'online', label: 'Online', color: 'cat-1' as const },
      { key: 'store', label: 'In store', color: 'cat-2' as const },
      { key: 'phone', label: 'By phone', color: 'cat-3' as const },
    ]
    return (
      <Stack gap={5}>
        <ChartLegend
          items={items.map((item) => ({ ...item, hidden: hidden.includes(item.key) }))}
          onToggleSeries={(key) => {
            setHidden((keys) =>
              keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
            )
          }}
        />
        <ChartLegend
          aria-label="Target and actual"
          items={[
            { key: 'actual', label: 'Actual', color: 'accent', shape: 'line' },
            { key: 'target', label: 'Target', color: 'neutral', shape: 'dashed' },
          ]}
        />
      </Stack>
    )
  },
}
