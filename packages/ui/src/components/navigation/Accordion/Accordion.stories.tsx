import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Navigation/Accordion',
  component: Accordion,
  args: { type: 'single', variant: 'divided', size: 'md', defaultValue: 'billing' },
  render: (args) => (
    <div style={{ maxInlineSize: '36rem' }}>
      <Accordion {...args}>
        <Accordion.Item value="trial">
          <Accordion.Trigger>How long is the free trial?</Accordion.Trigger>
          <Accordion.Content>
            Fourteen days on any plan, with every feature switched on. We only ask for a card when
            you decide to stay.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.Trigger>How does billing work?</Accordion.Trigger>
          <Accordion.Content>
            Plans bill monthly or yearly, per seat. Add a seat mid-cycle and you pay only for the
            days left; remove one and the difference comes off the next invoice.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="cancel">
          <Accordion.Trigger>What happens if I cancel?</Accordion.Trigger>
          <Accordion.Content>
            Your workspace stays readable for 30 days, then it is deleted. Export your projects and
            invoices any time before then.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

/** One section open at a time: opening another closes the first. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const billing = canvas.getByRole('button', { name: 'How does billing work?' })
    const cancel = canvas.getByRole('button', { name: 'What happens if I cancel?' })
    await expect(billing).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(cancel)
    await expect(cancel).toHaveAttribute('aria-expanded', 'true')
    await expect(billing).toHaveAttribute('aria-expanded', 'false')
  },
}

/** Several sections open at once: this month's plan usage. */
export const Multiple: Story = {
  args: { type: 'multiple', defaultValue: ['storage', 'seats'] },
  render: (args) => (
    <div style={{ maxInlineSize: '36rem' }}>
      <Accordion {...args} variant="contained">
        <Accordion.Item value="storage">
          <Accordion.Trigger>Storage — 81 GB of 100 GB</Accordion.Trigger>
          <Accordion.Content>
            Atlas redesign 52 GB, Billing migration 21 GB, Help centre 8 GB.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="seats">
          <Accordion.Trigger>Seats — 12 of 10</Accordion.Trigger>
          <Accordion.Content>
            Two guests became members this month. Add two seats or move them back to guests.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="requests">
          <Accordion.Trigger>API requests — 214,900 of 500,000</Accordion.Trigger>
          <Accordion.Content>Webhooks 120,000, integrations 94,900.</Accordion.Content>
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
          <Accordion.Trigger level={4}>Why is this invoice overdue?</Accordion.Trigger>
          <Accordion.Content>
            It was due on 30 September and Orchard & Co haven&apos;t paid it yet. A reminder went
            out on 3 October.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  ),
}

/**
 * `type="single"` opens one section at a time (and is collapsible unless you pass
 * `collapsible={false}`); `type="multiple"` lets any number stay open. A single item works as a
 * disclosure for an inline "why do we ask this?" note. Set the heading level of the triggers with
 * `level` on `Accordion.Trigger`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Accordion type="single" defaultValue="bikes">
        <Accordion.Item value="bikes">
          <Accordion.Trigger>Can I bring a bike?</Accordion.Trigger>
          <Accordion.Content>
            <Text>Yes, outside the morning peak. Fold-up bikes ride at any time.</Text>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="dogs">
          <Accordion.Trigger>Are dogs allowed?</Accordion.Trigger>
          <Accordion.Content>
            <Text>Dogs on a lead travel free on every ferry and bus.</Text>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="refunds">
          <Accordion.Trigger>How do refunds work?</Accordion.Trigger>
          <Accordion.Content>
            <Text>Unused tickets are refunded in full up to an hour before departure.</Text>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
  },
}

/**
 * `variant="divided"` (the default) separates sections with rules. `variant="contained"` puts them
 * in a framed box, for a few sections inside a page.
 */
export const Contained: Story = {
  tags: ['docs'],
  render: function Contained() {
    return (
      <Accordion type="multiple" variant="contained" size="sm">
        <Accordion.Item value="weekday">
          <Accordion.Trigger>Weekday fares</Accordion.Trigger>
          <Accordion.Content>
            <Text size="sm">Single £2.80, return £5.00, day pass £7.50.</Text>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="weekend">
          <Accordion.Trigger>Weekend fares</Accordion.Trigger>
          <Accordion.Content>
            <Text size="sm">Single £2.40, family day pass £14.00.</Text>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
  },
}
