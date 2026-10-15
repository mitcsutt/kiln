import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Amount,
  CodeBlock,
  List,
  Prose,
  ShowMore,
  Table,
  Tag,
  TagList,
  Text,
} from '@mitcsutt/kiln-ui'

/*
 * UI/Patterns/ClampingContent: ShowMore around each kind of content, so no layout or text
 * component needs a clamp prop of its own. Every name and figure is invented.
 */

const meta = {
  title: 'UI/Patterns/ClampingContent',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * A paragraph: clamp by `lines`, so the cut always falls between lines of text.
 */
export const Paragraph: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore lines={2}>
      <Text measure="text">
        The east pontoon closes from 4 to 18 November while the piles are replaced. Boats on berths
        E1 to E24 move to the visitor pontoon for those two weeks, and the yard crane runs on
        weekdays only. Fuel stays open, but the pump-out moves to the slipway.
      </Text>
    </ShowMore>
  ),
}

/**
 * Prose with headings and lists: clamp by `maxHeight`, since its lines aren't all the same
 * height.
 */
export const ProseBlock: Story = {
  name: 'Prose',
  tags: ['docs'],
  render: () => (
    <ShowMore maxHeight={10}>
      <Prose>
        <h3>Winter storage</h3>
        <p>Lift-out runs from 1 October. Book a slot at least a week ahead.</p>
        <ul>
          <li>Hard standing: £14.20 per metre per month.</li>
          <li>Covered shed: £22.80 per metre per month, twelve places.</li>
          <li>Mast storage is free for boats stored with us.</li>
        </ul>
        <p>Antifouling and engine winterising can be added when you book.</p>
      </Prose>
    </ShowMore>
  ),
}

const MOVEMENTS = [
  { boat: 'Kittiwake', note: 'Lifted out for antifouling', time: '08:10' },
  { boat: 'Saltire', note: 'Moved to berth C4', time: '08:45' },
  { boat: 'Brindle', note: 'Engine survey booked', time: '09:30' },
  { boat: 'Marram', note: 'Returned to the water', time: '10:05' },
  { boat: 'Gannet', note: 'Mast stepped', time: '11:20' },
  { boat: 'Puffin', note: 'Left for Anstruther', time: '12:00' },
  { boat: 'Fulmar', note: 'Arrived from Dunbar', time: '13:15' },
]

/**
 * A list: clamp by `maxItems`. The toggle counts what's hidden, and the hidden rows are out of the
 * page until it shows them.
 */
export const Rows: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore maxItems={4}>
      <List divided>
        {MOVEMENTS.map((movement) => (
          <List.Item key={movement.boat}>
            <Text weight="medium">{movement.boat}</Text>
            <Text tone="muted">
              {movement.note}, {movement.time}
            </Text>
          </List.Item>
        ))}
      </List>
    </ShowMore>
  ),
}

const SERVICES = [
  'Crane lift',
  'Pressure wash',
  'Antifouling',
  'Anode check',
  'Engine service',
  'Rigging check',
  'Sail repair',
  'Upholstery',
  'Electrics',
  'Gas safety',
  'Survey',
]

/**
 * Tags: `maxItems` again, around the `TagList`.
 */
export const Tags: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore maxItems={5}>
      <TagList>
        {SERVICES.map((service) => (
          <Tag key={service}>{service}</Tag>
        ))}
      </TagList>
    </ShowMore>
  ),
}

const INVOICES = [
  { number: 'HW-3104', boat: 'Kittiwake', amount: 1240 },
  { number: 'HW-3105', boat: 'Saltire', amount: 386.5 },
  { number: 'HW-3106', boat: 'Brindle', amount: 2915 },
  { number: 'HW-3107', boat: 'Marram', amount: 98 },
  { number: 'HW-3108', boat: 'Gannet', amount: 640 },
  { number: 'HW-3109', boat: 'Puffin', amount: 1802.4 },
  { number: 'HW-3110', boat: 'Fulmar', amount: 455 },
]

/**
 * A table: clamp by `maxHeight`, so the header stays and the rows fade out at the cut.
 */
export const TableRows: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore maxHeight={11}>
      <Table label="Invoices sent this week">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Invoice</Table.HeaderCell>
            <Table.HeaderCell>Boat</Table.HeaderCell>
            <Table.HeaderCell numeric>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {INVOICES.map((invoice) => (
            <Table.Row key={invoice.number}>
              <Table.Cell rowHeader>{invoice.number}</Table.Cell>
              <Table.Cell>{invoice.boat}</Table.Cell>
              <Table.Cell numeric>
                <Amount value={invoice.amount} currency="GBP" locale="en-GB" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </ShowMore>
  ),
}

const CONFIG = `{
  "yard": "granton",
  "billingDay": "first-working-day",
  "lateFee": { "startsOnDay": 8, "percentPerMonth": 2 },
  "reminders": [
    { "daysBefore": 3, "channel": "email" },
    { "daysAfter": 1, "channel": "email" },
    { "daysAfter": 7, "channel": "letter" }
  ],
  "currency": "GBP"
}`

/**
 * Code: clamp by `maxHeight`. The code block keeps its own frame, title and copy button, and
 * copying still copies all of it.
 */
export const Code: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore maxHeight={10}>
      <CodeBlock code={CONFIG} language="json" title="billing.json" />
    </ShowMore>
  ),
}
