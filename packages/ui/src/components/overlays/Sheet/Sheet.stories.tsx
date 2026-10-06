import type { Meta, StoryObj } from '@storybook/react-vite'
import { Amount, Button, DataList, Sheet, Stack } from '@mitcsutt/kiln-ui'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Muted, Row, Stage, Strong } from '#components/overlays/_story/StoryKit'
import type { SheetContentProps } from './Sheet'

const meta = {
  title: 'UI/Overlays/Sheet',
  component: Sheet.Content,
  args: {
    side: 'bottom',
    size: 'md',
    title: 'Your order',
    description: 'Noor · 6 items · $142.00',
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['right', 'left', 'bottom'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof Sheet.Content>

export default meta
type Story = StoryObj<typeof meta>

const ITEMS = [
  { item: 'Desk lamp', detail: 'Brass · 1', price: '$64.00' },
  { item: 'Dot-grid notebook', detail: 'A5 · 2', price: '$28.00' },
  { item: 'Mechanical pencil', detail: '0.5 mm · 1', price: '$18.00' },
  { item: 'Pencil leads', detail: 'HB · 2', price: '$8.00' },
  { item: 'Eraser', detail: 'Plastic · 3', price: '$6.00' },
  { item: 'Shipping', detail: 'Standard', price: '$18.00' },
]

function YourOrder({ defaultOpen, ...args }: SheetContentProps & { defaultOpen?: boolean }) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <Sheet.Trigger asChild>
        <Button variant="outline" tone="neutral">
          Your order
        </Button>
      </Sheet.Trigger>
      <Sheet.Content {...args}>
        <Stack gap={0}>
          {ITEMS.map((t) => (
            <Row
              key={t.item}
              label={
                <Stack gap={0}>
                  <Strong>{t.item}</Strong>
                  <Muted>{t.detail}</Muted>
                </Stack>
              }
              value={t.price}
            />
          ))}
        </Stack>
        <Sheet.Footer>
          <Sheet.Close asChild>
            <Button>Done</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  )
}

/** Click the trigger. Focus trap, Escape and focus return included. */
export const Playground: Story = {
  render: (args) => <YourOrder {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(storyRoot(canvasElement)).getByRole('button', { name: 'Your order' })
    await userEvent.click(trigger)
    const sheet = await screen.findByRole('dialog', { name: 'Your order' })
    await userEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** The phone pattern: a bottom sheet with a grab handle (visual only — Escape, the scrim or Done close it). */
export const BottomOnMobile: Story = {
  render: (args) => (
    <Stage size="lg">
      {(container) => <YourOrder {...args} container={container} defaultOpen />}
    </Stage>
  ),
}

/**
 * One sheet, two shapes: `side={{ base: 'bottom', md: 'right' }}` is a bottom sheet on
 * phones and a right-hand drawer from 48em, sliding in from whichever edge it sits on.
 * Resize the frame across 768px.
 */
export const ResponsiveSide: Story = {
  args: {
    side: { base: 'bottom', md: 'right' },
    size: 'md',
    title: 'Your order',
    description: 'Noor · 6 items · $142.00',
  },
  argTypes: { side: { control: 'object' } },
  render: (args) => (
    <Stage size="lg">
      {(container) => <YourOrder {...args} container={container} defaultOpen />}
    </Stage>
  ),
}

/** A side panel for filters or detail on larger screens. */
export const Side: Story = {
  args: {
    side: 'right',
    size: 'sm',
    title: 'September',
    description: '$3,412.80 invoiced across five clients',
  },
  render: (args) => (
    <Stage size="lg">
      {(container) => (
        <Sheet defaultOpen>
          <Sheet.Trigger asChild>
            <Button variant="outline" tone="neutral">
              Month summary
            </Button>
          </Sheet.Trigger>
          <Sheet.Content container={container} {...args}>
            <Stack gap={0}>
              <Row label="Northwind Studio" value="$2,160.00" />
              <Row label="Brightline Labs" value="$612.35" />
              <Row label="Orchard & Co" value="$184.20" />
              <Row label="Paperkite Press" value="$146.90" />
              <Row label="Fernhill School" value="$309.35" />
              <Row label="Total" value="$3,412.80" strong />
            </Stack>
            <Sheet.Footer>
              <Button variant="outline" tone="neutral">
                Export CSV
              </Button>
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet>
      )}
    </Stage>
  ),
}

/**
 * `side` is `right` (the default), `left` or `bottom`, and takes a responsive value: `{ base:
 * 'bottom', md: 'right' }` is a bottom sheet on phones and a drawer from 48em. A bottom sheet
 * shows a grab handle. `size` sets the width of a side sheet or the maximum height of a bottom
 * one. The mobile navigation in these docs is a `Sheet`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Sheet>
        <Sheet.Trigger asChild>
          <Button variant="outline" tone="neutral">
            Your basket
          </Button>
        </Sheet.Trigger>
        <Sheet.Content
          side={{ base: 'bottom', md: 'right' }}
          title="Your basket"
          description="Two items"
        >
          <Stack gap={5}>
            <DataList>
              <DataList.Item label="Annual pass">
                <Amount value={96} currency="GBP" locale="en-GB" />
              </DataList.Item>
              <DataList.Item label="Helmet, medium">
                <Amount value={24.5} currency="GBP" locale="en-GB" />
              </DataList.Item>
            </DataList>
            <Sheet.Footer>
              <Button fullWidth>Check out</Button>
            </Sheet.Footer>
          </Stack>
        </Sheet.Content>
      </Sheet>
    )
  },
}
