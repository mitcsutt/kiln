import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Inline, Stack, Swatch, Table, Tag, TagList, Text, ToggleChip } from '@mitcsutt/kiln-ui'
import { expect } from 'storybook/test'

const meta = {
  title: 'UI/Display/Swatch',
  component: Swatch,
  args: { color: 3, size: 'md' },
} satisfies Meta<typeof Swatch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8] as const

/** Every categorical slot at each size, beside text so the em sizing shows. */
export const SlotsAndSizes: Story = {
  render: () => (
    <Stack gap={3}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Inline key={size} gap={2} align="center">
          {SLOTS.map((slot) => (
            <Swatch key={slot} color={slot} size={size} />
          ))}
          <Text size="sm">{size}</Text>
        </Inline>
      ))}
    </Stack>
  ),
}

/**
 * The hosts come first: `Badge`, `Tag`, `ToggleChip` and `Indicator` take a `swatch` and size it
 * to their text, so a team or label looks the same in a filter chip, a tag and a badge.
 */
export const OnHosts: Story = {
  tags: ['docs'],
  render: function OnHosts() {
    return (
      <Stack gap={3}>
        <Inline gap={2}>
          <ToggleChip swatch={3} defaultPressed>
            Platform
          </ToggleChip>
          <ToggleChip swatch={6}>Payments</ToggleChip>
          <ToggleChip swatch={1}>Field ops</ToggleChip>
        </Inline>
        <TagList aria-label="Teams">
          <Tag swatch={3}>Platform</Tag>
          <Tag swatch={6}>Payments</Tag>
          <Tag swatch={1}>Field ops</Tag>
        </TagList>
        <Inline gap={2}>
          <Badge swatch={3}>Platform</Badge>
          <Badge swatch={6} size="md">
            Payments
          </Badge>
        </Inline>
      </Stack>
    )
  },
}

/**
 * Where there's no host, like a table cell, use `Swatch` on its own beside the name it stands for.
 * A colour that comes from data, such as one a user picked for a label, can be any CSS colour.
 */
export const InATable: Story = {
  tags: ['docs'],
  render: function InATable() {
    const labels = [
      { name: 'Needs design', color: '#b4387a', issues: 14 },
      { name: 'Good first issue', color: '#2f7d4f', issues: 9 },
      { name: 'Blocked upstream', color: '#8a6d1c', issues: 3 },
    ]
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Label</Table.HeaderCell>
            <Table.HeaderCell align="end">Open issues</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {labels.map((label) => (
            <Table.Row key={label.name}>
              <Table.Cell>
                <Inline gap={2} align="center">
                  <Swatch color={label.color} />
                  {label.name}
                </Inline>
              </Table.Cell>
              <Table.Cell align="end">{label.issues}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  },
}

/** With a `label`, the swatch is an image with that name; without one it's hidden from screen readers. */
export const Labelled: Story = {
  args: { color: 5, label: 'Billing team' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Billing team' })).toBeVisible()
  },
}
