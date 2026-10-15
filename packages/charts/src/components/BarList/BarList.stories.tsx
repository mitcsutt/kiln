import { BarList } from '@mitcsutt/kiln-charts'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Charts/Presets/BarList',
  component: BarList,
  args: {
    data: [
      { page: '/docs/install', views: 3120 },
      { page: '/pricing', views: 1840 },
      { page: '/changelog', views: 960 },
      { page: '/docs/themes', views: 720 },
    ],
    pivot: { by: 'page', value: 'views' },
    label: 'Top pages by views, last 7 days',
  },
} satisfies Meta<typeof BarList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Long rows with `pivot`: each item's name and amount, ranked, with a bar against the largest. */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <BarList
      data={[
        { page: '/pricing', views: 1840 },
        { page: '/docs/install', views: 3120 },
        { page: '/changelog', views: 960 },
        { page: '/docs/themes', views: 720 },
        { page: '/blog/release-notes-2-4', views: 410 },
      ]}
      pivot={{ by: 'page', value: 'views' }}
      label="Top pages by views, last 7 days"
    />
  ),
}

/** `max` keeps the top few; `color` takes any theme colour. */
export const TopFew: Story = {
  name: 'Top three',
  tags: ['docs'],
  render: () => (
    <BarList
      data={[{ harbour: 128, quay: 342, riverside: 211, northgate: 97, docklands: 156 }]}
      labels={{
        harbour: 'Harbour Street',
        quay: 'Quay Road',
        riverside: 'Riverside',
        northgate: 'Northgate',
        docklands: 'Docklands',
      }}
      max={3}
      color="cat-3"
      label="Busiest stops, Saturday"
    />
  ),
}
