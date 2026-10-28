import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, Card, Inline, Numeral, Page, Stack, Stat, Text } from '@mitcsutt/kiln-ui'

const meta = {
  title: 'UI/Layout/Page',
  component: Page,
  args: { gap: 8 },
  argTypes: { as: { control: false }, children: { control: false } },
  render: (args) => (
    <Page {...args}>
      <Page.Header
        kicker="Kiln room"
        title="Loading schedule"
        description="What goes into which kiln this week, and the order it fires in."
      />
      <Page.Section title="Firing queue" description="Top of the list fires next.">
        <Text>Saturday class bisque, 22 pieces</Text>
      </Page.Section>
    </Page>
  ),
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const kilns = [
  { name: 'Kiln 1', load: 'Saturday class bisque', temperature: 962, status: 'Firing' },
  { name: 'Kiln 2', load: 'Café planters, glaze', temperature: 1184, status: 'Firing' },
  { name: 'Kiln 3', load: 'Tenmoku test tiles', temperature: 41, status: 'Cooling' },
]

/**
 * A whole page: the header with its actions, then titled sections, one with its content in
 * columns. Nothing here sets a gap or a heading size: every page laid out this way opens and
 * steps the same.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <Page>
      <Page.Header
        kicker="Kiln room"
        title="Live firings"
        description="Readings from every kiln in the studio, every thirty seconds."
        actions={<Button variant="outline">Book a slot</Button>}
      />
      <Page.Section title="Now firing" description="Two kilns are on, one is cooling.">
        <Page.Columns columns={3}>
          {kilns.map((kiln) => (
            <Card key={kiln.name} variant="outline">
              <Card.Header>
                <Card.Title>{kiln.name}</Card.Title>
                <Card.Meta>{kiln.load}</Card.Meta>
              </Card.Header>
              <Card.Body>
                <Inline gap={2} align="center" justify="between">
                  <Numeral value={kiln.temperature} suffix="°C" />
                  <Badge variant="outline">{kiln.status}</Badge>
                </Inline>
              </Card.Body>
            </Card>
          ))}
        </Page.Columns>
      </Page.Section>
      <Page.Section title="This week">
        <Page.Columns columns={4}>
          <Stat label="Firings" value={<Numeral value={14} />} />
          <Stat label="Pieces" value={<Numeral value={212} />} />
          <Stat label="Kiln hours" value={<Numeral value={96} />} />
          <Stat label="Failed pieces" value={<Numeral value={3} />} />
        </Page.Columns>
      </Page.Section>
    </Page>
  ),
}

/**
 * Anything nested in `Page.Header` sits under its title block, at the header's own gap, so a
 * notice or a filter row belongs to the header rather than to the first section.
 */
export const HeaderWithANotice: Story = {
  tags: ['docs'],
  render: () => (
    <Page>
      <Page.Header kicker="Studio admin" title="Members" description="Everyone with a studio key.">
        <Stack gap={1}>
          <Text weight="strong">Kiln 2 is down for elements until Friday</Text>
          <Text size="sm" tone="muted">
            Glaze firings move to Kiln 1 and Kiln 3 this week.
          </Text>
        </Stack>
      </Page.Header>
      <Page.Section title="Teachers">
        <Text>Maud Lindqvist, Tomasz Bielski</Text>
      </Page.Section>
    </Page>
  ),
}
