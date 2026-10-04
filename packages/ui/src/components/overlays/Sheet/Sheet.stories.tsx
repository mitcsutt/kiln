import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Muted, Row, Stage, Strong } from '#components/overlays/_story/StoryKit'
import { Sheet, type SheetContentProps } from './Sheet'

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
    const trigger = within(canvasElement).getByRole('button', { name: 'Your order' })
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
    description: '$3,412.80 spent of $4,100.00',
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
              <Row label="Rent" value="$2,160.00" />
              <Row label="Groceries" value="$612.35" />
              <Row label="Transport" value="$184.20" />
              <Row label="Electricity" value="$146.90" />
              <Row label="Eating out" value="$309.35" />
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
