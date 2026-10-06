import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, DataList } from '@mitcsutt/kiln-ui'
import { Stack } from '#components/layout/Stack'

const meta = {
  title: 'UI/Display/DataList',
  component: DataList,
  args: { orientation: 'horizontal', divided: false },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <DataList {...args}>
        <DataList.Item label="Owner">Priya Nair</DataList.Item>
        <DataList.Item label="Stack">React, Postgres, server-sent events</DataList.Item>
        <DataList.Item label="Timeline">May – July 2026</DataList.Item>
        <DataList.Item label="Accounts">1,200 migrated</DataList.Item>
      </DataList>
    </Stack>
  ),
} satisfies Meta<typeof DataList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Release facts — values line up on one column however long the label. */
export const ReleaseFacts: Story = {
  args: { divided: true },
  render: (args) => (
    <Stack style={{ maxWidth: '30rem' }}>
      <DataList {...args}>
        <DataList.Item label="Region">Sydney, ap-southeast-2</DataList.Item>
        <DataList.Item label="Started">Thu 14 Nov, 10:30</DataList.Item>
        <DataList.Item label="Release">2.4</DataList.Item>
        <DataList.Item label="Approvers">Tomás (backend) and Hana (mobile app)</DataList.Item>
      </DataList>
    </Stack>
  ),
}

/** Vertical: a meta strip under a heading. */
export const MetaStrip: Story = {
  args: { orientation: 'vertical', divided: true },
  render: (args) => (
    <DataList {...args}>
      <DataList.Item label="Billing cycle">Monthly</DataList.Item>
      <DataList.Item label="Next invoice">Thu 2 Oct</DataList.Item>
      <DataList.Item label="Amount due">$3,725.00</DataList.Item>
      <DataList.Item label="Card">Visa ··4821</DataList.Item>
    </DataList>
  ),
}

/**
 * A sailing's details as label and value pairs, divided by rules.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <DataList divided>
        <DataList.Item label="Departs">Harbour Square, berth 3</DataList.Item>
        <DataList.Item label="Arrives">Kelso Bay Pier, 07:52</DataList.Item>
        <DataList.Item label="Vessel">MV Marram</DataList.Item>
        <DataList.Item label="Status">
          <Badge tone="positive">On time</Badge>
        </DataList.Item>
      </DataList>
    )
  },
}

/**
 * With `orientation="vertical"`, each label sits above its value, for narrow spaces.
 */
export const Vertical: Story = {
  name: 'Stacked',
  tags: ['docs'],
  render: function Vertical() {
    return (
      <DataList orientation="vertical">
        <DataList.Item label="Pass">Annual, all zones</DataList.Item>
        <DataList.Item label="Valid until">31 October 2027</DataList.Item>
        <DataList.Item label="Holder">Ines Varga</DataList.Item>
      </DataList>
    )
  },
}
