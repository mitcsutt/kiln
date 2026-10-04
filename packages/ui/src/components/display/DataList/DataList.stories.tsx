import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { DataList } from './DataList'

const meta = {
  title: 'UI/Display/DataList',
  component: DataList,
  args: { orientation: 'horizontal', divided: false },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <DataList {...args}>
        <DataList.Item label="Role">Design and build</DataList.Item>
        <DataList.Item label="Stack">React, Postgres, server-sent events</DataList.Item>
        <DataList.Item label="Timeline">May – July 2026</DataList.Item>
        <DataList.Item label="Users">8 clubs, 112 matches</DataList.Item>
      </DataList>
    </Stack>
  ),
} satisfies Meta<typeof DataList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Match facts — values line up on one column however long the label. */
export const MatchFacts: Story = {
  args: { divided: true },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <DataList {...args}>
        <DataList.Item label="Venue">Harbour Park, pitch 2</DataList.Item>
        <DataList.Item label="Kick-off">Sun 14 June, 10:30</DataList.Item>
        <DataList.Item label="Division">Two</DataList.Item>
        <DataList.Item label="Captains">Kofi (Harbour Hawks) v Mei (Millpond FC)</DataList.Item>
      </DataList>
    </Stack>
  ),
}

/** Vertical: a meta strip under a heading. */
export const MetaStrip: Story = {
  args: { orientation: 'vertical', divided: true },
  render: (args) => (
    <DataList {...args}>
      <DataList.Item label="Pay cycle">Fortnightly</DataList.Item>
      <DataList.Item label="Next pay">Thu 2 Oct</DataList.Item>
      <DataList.Item label="Net pay">$3,725.00</DataList.Item>
      <DataList.Item label="Account">Everyday ··4821</DataList.Item>
    </DataList>
  ),
}
