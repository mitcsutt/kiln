import { BarList, ChartColorScope, TimeSeries } from '@mitcsutt/kiln-charts'
import { Grid } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Building blocks/ChartColorScope',
  component: ChartColorScope,
} satisfies Meta<typeof ChartColorScope>

export default meta
type Story = StoryObj<typeof meta>

/**
 * `order` colours keys in a fixed order, whichever chart draws first; `colors` pins a colour.
 * Harbour and Quay match across both charts.
 */
export const Usage = {
  tags: ['docs'],
  render: () => (
    <ChartColorScope order={['Harbour', 'Quay', 'Riverside']} colors={{ Docklands: 'cat-8' }}>
      <Grid columns={{ base: 1, md: 2 }} gap={6}>
        <TimeSeries
          data={[
            { day: '2026-03-02', Quay: 18, Harbour: 30, Docklands: 9 },
            { day: '2026-03-03', Quay: 22, Harbour: 26, Docklands: 12 },
            { day: '2026-03-04', Quay: 19, Harbour: 33, Docklands: 14 },
          ]}
          x="day"
          label="Deliveries by depot"
          zoomable={false}
          height={220}
        />
        <TimeSeries
          data={[
            { day: '2026-03-02', Riverside: 3, Harbour: 4 },
            { day: '2026-03-03', Riverside: 5, Harbour: 6 },
            { day: '2026-03-04', Riverside: 2, Harbour: 3 },
          ]}
          x="day"
          label="Late deliveries by depot"
          zoomable={false}
          height={220}
        />
      </Grid>
    </ChartColorScope>
  ),
} satisfies Story

/** A dashboard's charts in one scope: each depot keeps its colour, pinned or not. */
export const Playground: Story = { render: Usage.render }

/** A bar list takes one colour for every bar: amounts, not identities. */
export const NotForBarLists: Story = {
  name: 'Outside the scope',
  render: () => <BarList data={[{ Harbour: 30, Quay: 18 }]} label="Deliveries by depot, Monday" />,
}
