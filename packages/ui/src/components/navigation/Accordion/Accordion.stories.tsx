import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'

const meta = {
  title: 'UI/Navigation/Accordion',
  component: Accordion,
  args: { type: 'single', variant: 'divided', size: 'md', defaultValue: 'scoring' },
  render: (args) => (
    <div style={{ maxInlineSize: '36rem' }}>
      <Accordion {...args}>
        <Accordion.Item value="fixtures">
          <Accordion.Trigger>How are fixtures set?</Accordion.Trigger>
          <Accordion.Content>
            Every club plays every other club twice, once at home and once away. The fixture list is
            published a month before the first round and only moves for weather.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="scoring">
          <Accordion.Trigger>How does scoring work?</Accordion.Trigger>
          <Accordion.Content>
            Three points for a win and one for a draw. Cup matches count double, and a walkover
            scores as a 3–0 win for the club that turned up.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="ties">
          <Accordion.Trigger>What happens on a tie?</Accordion.Trigger>
          <Accordion.Content>
            Clubs level on points are split by goal difference, then goals scored, then the result
            between them.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** A bordered surface — standing on the page, with Fiesta's print offset. */
export const Contained: Story = {
  args: { variant: 'contained' },
}

/** Several sections open at once: monthly spending notes. */
export const Multiple: Story = {
  args: { type: 'multiple', defaultValue: ['groceries', 'utilities'] },
  render: (args) => (
    <div style={{ maxInlineSize: '36rem' }}>
      <Accordion {...args} variant="contained">
        <Accordion.Item value="groceries">
          <Accordion.Trigger>Groceries — $812.40 of $900.00</Accordion.Trigger>
          <Accordion.Content>
            Corner Grocer $498.20, Bulk Foods Co-op $214.35, Riverside Market $99.85.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="utilities">
          <Accordion.Trigger>Utilities — $356.15 of $320.00</Accordion.Trigger>
          <Accordion.Content>
            The winter power bill came in $36.15 over. Consider moving $40 from Dining out.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="transport">
          <Accordion.Trigger>Transport — $214.90 of $260.00</Accordion.Trigger>
          <Accordion.Content>Travel card top-ups $120.00, fuel $94.90.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
}

/** Small, single item: an inline disclosure next to the thing it explains. */
export const InlineNote: Story = {
  args: { size: 'sm', defaultValue: 'why' },
  render: (args) => (
    <div style={{ maxInlineSize: '24rem' }}>
      <Accordion {...args}>
        <Accordion.Item value="why">
          <Accordion.Trigger level={4}>Why are Westbank relegated?</Accordion.Trigger>
          <Accordion.Content>
            Level on points with Quarry Lane, but bottom of division two on goal difference (−2).
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
}
